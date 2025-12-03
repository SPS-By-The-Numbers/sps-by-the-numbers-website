type FilterDomainBaseNode = {
  selectId: string;
  name: string;
  shortName: string;
};

export type FilterDomainLeafNode = FilterDomainBaseNode & {
  nodeType: "leaf";
  code: number;
};

export type FilterDomainInternalNode = FilterDomainBaseNode & {
  nodeType: "internal";
  children: Array<FilterDomainTree>;
};

export type FilterDomainTree = FilterDomainInternalNode | FilterDomainLeafNode;

type FilterSelection = Set<number>;
type SelectOption = Array<string>;

interface FilterResult<NodeType> {
  matched: Array<NodeType>;
  skipped: Array<NodeType>;
};

// Helper for creating a FilterDomainTree internal node.
export function makeInternalNode(baseId, name, children, shortName?) : FilterDomainTree {
  return {
    nodeType: 'internal',
    selectId: `i-${baseId}`,
    name: name,
    shortName: shortName === undefined ? name : shortName,
    children,
  };
}

// Helper for creating a FilterDomainTree leaf node.
export function makeLeafNode(prefix, code, name, shortName?) : FilterDomainTree {
  return {
    nodeType: 'leaf',
    selectId: `${prefix}-${code}`,
    name,
    shortName: shortName === undefined ? name : shortName,
    code,
  };
}

export class Filter {
  private domainTree : FilterDomainTree;

  constructor(domainTree) {
    this.domainTree = domainTree;
  }

  public toSummaryString(selected: FilterSelection) : string {
    const result = this.filterDomainCondensed(this.domainTree, selected);
    const matchedString = 'Only: ' + result.matched.map(n => n.shortName).join(', ');
    const skippedString = 'Excl: ' + result.skipped.map(n => n.shortName).join(', ');
    return this.shorterString(matchedString, skippedString);
  }

  public toFilterString(selected: FilterSelection) : string {
    const result = this.filterDomainLeafs(this.domainTree, selected);

    if (result.skipped.length === 0) {
      return '';
    }

    const matchedString = result.matched.map(n => n.code).join('_');
    const skippedString = '-' + result.skipped.map(n => n.code).join('_');

    return this.shorterString(matchedString, skippedString);
  }

  public fromFilterString(filterString: string) {
    const isSkipped = filterString[0] === '-';
    const filterExpression = isSkipped ? filterString.slice(1) : filterString;

    const codes = new Set(filterExpression.split('_').map(s => parseInt(s)));
    
    // If this is skipped codes, then we have to search through the domain and
    // invert the selection.
    if (isSkipped) {
      const result = this.filterDomainLeafs(this.domainTree, codes);
      return new Set(result.skipped.map(n => n.code));
    }

    return codes;
  }

  private filterDomainInternal(root: FilterDomainTree, selected: FilterSelection, condense) {
    if (root.nodeType === 'leaf') {
      if (selected.has(root.code)) {
        return { matched: [root], skipped: [] };
      }

      return { matched: [], skipped: [root] };
    } else {
      const result : FilterResult<FilterDomainTree> = {matched: [], skipped: []};
      for (const c of root.children) {
        const childResult = this.filterDomainInternal(c, selected, condense);
        result.matched.push(...childResult.matched);
        result.skipped.push(...childResult.skipped);
      }

      // Coallesce to internal nodes.
      if (condense) {
        if (result.matched.length === 0) {
          return { matched: [], skipped: [root] };
        } else if (result.skipped.length === 0) {
          return { matched: [root], skipped: [] };
        }
      }

      return result;
    }
  }

  private filterDomainCondensed(root: FilterDomainTree, selected: FilterSelection) {
    const result = this.filterDomainInternal(root, selected, true);
    return result as FilterResult<FilterDomainTree>;
  }

  private filterDomainLeafs(root: FilterDomainTree, selected: FilterSelection, condense?) {
    const result = this.filterDomainInternal(root, selected, false);
    return result as FilterResult<FilterDomainLeafNode>;
  }

  private shorterString(matchedString, skippedString) {
    if (matchedString.length <= skippedString.length) {
      return matchedString;
    }

    return skippedString;
  }
}
