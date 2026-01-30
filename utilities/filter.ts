import type { TreeViewBaseItem } from "@mui/x-tree-view";
import { Base64Stream, Base64Reader } from "utilities/base64_stream";
import { decodeNumberSet, encodeNumberSet } from "utilities/number_set";

// Using TreeViewBaseItem is a slightly layering violation since this section shouldn't understand
// UI but tying the two types together just makes everything simpler for now.
type FilterDomainBaseNode = TreeViewBaseItem & {
  shortLabel: string;
};

export type FilterDomainLeafNode = FilterDomainBaseNode & {
  nodeType: "leaf";
  code: number;

  // Optional override of `code` to use when serializing/deserializing.
  // This allows mapping the range of values down to usually < 100 for sparse
  // identifier domains such as school building or NCES codes. With a smaller
  // range the serialization is much more efficient using the number_set's
  // compact formats.
  //
  // If undefined, code is the default value used for serialization.
  serializationCode?: number;
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
}

// Helper for creating a FilterDomainTree internal node.
export function makeInternalNode(
  baseId,
  label,
  children,
  shortLabel?,
): FilterDomainTree {
  return {
    nodeType: "internal",
    id: `i-${baseId}`,
    label: label,
    shortLabel: shortLabel === undefined ? label : shortLabel,
    children,
  };
}

// Helper for creating a FilterDomainTree leaf node.
export function makeLeafNodeWithSerialization(
  prefix,
  code,
  serializationCode,
  label,
  shortLabel?,
): FilterDomainTree {
  return {
    nodeType: "leaf",
    id: `${prefix}-${code}`,
    label,
    shortLabel: shortLabel === undefined ? label : shortLabel,
    code,
    serializationCode,
  };
}

// More common variant without the serializationCode.
export function makeLeafNode(
  prefix,
  code,
  label,
  shortLabel?,
): FilterDomainTree {
  return makeLeafNodeWithSerialization(
    prefix,
    code,
    undefined,
    label,
    shortLabel,
  );
}

export class Filter {
  private domainTree: FilterDomainTree;
  private itemPrefix: string;
  private savedAllCodes: Set<number> | undefined;
  private savedFromSerializationCode: Returns<number, number> | undefined;

  constructor(domainTree, prefix) {
    this.domainTree = domainTree;
    this.itemPrefix = prefix;
  }

  public treeViewItems(): Array<TreeViewBaseItem> {
    return [this.domainTree];
  }

  public allCodes(): Set<number> {
    if (this.savedAllCodes === undefined) {
      const result = new Set<number>();
      this.savedAllCodes = result;
      this.visitDomain(
        this.domainTree,
        () => {},
        (n) => result.add(n.code),
      );
    }

    return this.savedAllCodes;
  }

  // Returns the correct set of Tree View Items.
  public toTreeViewItems(filterString: string): Array<string> {
    const included = this.fromFilterString(filterString);
    return this.codesToTreeViewItems(included);
  }

  // Takes a set of codes and returns it as a TreeViewItem.
  public codesToTreeViewItems(included: Set<number>): Array<string> {
    const selectItems = new Set<string>();
    this.visitDomain(
      this.domainTree,
      (n) => {
        if (n.children.reduce((acc, c) => acc && selectItems.has(c.id), true)) {
          selectItems.add(n.id);
        }
      },
      (n) => {
        if (included.has(n.code)) {
          selectItems.add(n.id);
        }
      },
    );

    this.visitDomain(
      this.domainTree,
      (n) => {},
      (n) => {
        if (included.has(n.code)) {
          selectItems.add(n.id);
        }
      },
    );
    return [...selectItems];
  }

  // Parses a set of options and returns a set of codes for data filtering.
  public treeViewItemsToCodes(selectedItems: Array<string>) : Set<number> {
    const selectedCodes = new Set<number>();
    for (const id of selectedItems) {
      const parts = id.split("-");
      if (parts.length === 2 && parts[0] === this.itemPrefix) {
        selectedCodes.add(parseInt(parts[1]));
      }
    }
    return selectedCodes.intersection(this.allCodes());
  }


  public toSummaryText(selected: FilterSelection): string {
    const result = this.filterDomainCondensed(this.domainTree, selected);
    if (result.skipped.length === 0) {
      return "all";
    }

    if (result.matched.length === 0) {
      return "none";
    }

    const matchedString =
      "Only: " + result.matched.map((n) => n.shortLabel).join(", ");
    const skippedString =
      "Excl: " + result.skipped.map((n) => n.shortLabel).join(", ");
    return this.shorterString(matchedString, skippedString);
  }

  public toFilterString(selected: FilterSelection): string {
    const result = this.filterDomainLeafs(this.domainTree, selected);
    const excludeString = encodeNumberSet(
      "exclude",
      new Set(result.skipped.map((n) => n.serializationCode ?? n.code)),
    );
    const includeString = encodeNumberSet(
      "include",
      new Set(result.matched.map((n) => n.serializationCode ?? n.code)),
    );
    return this.shorterString(excludeString, includeString);
  }

  public fromSerializationCode(serializationCode: number) {
    if (this.savedFromSerializationCodes === undefined) {
      const mapping : Record<number, number> = {};
      this.savedFromSerializationCodes = mapping;
      this.visitDomain(
        this.domainTree,
        () => {},
        (n) => mapping[n.serializationCode ?? n.code] = n.code,
      );
    }
    return this.savedFromSerializationCodes[serializationCode];
  }

  public fromFilterString(filterString: string): Set<number> {
    const decoded = decodeNumberSet(filterString);
    let result = this.allCodes();
    if (decoded.include) {
      const includeCodes = new Set(decoded.include.values().map(x => this.fromSerializationCode(x)));
      result = result.intersection(includeCodes);
    }

    if (decoded.exclude) {
      const excludeCodes = new Set(decoded.exclude.values().map(x => this.fromSerializationCode(x)));
      result = result.difference(excludeCodes);
    }
    return result;
  }

  private filterDomainInternal(
    root: FilterDomainTree,
    selected: FilterSelection,
    condense,
  ) {
    if (root.nodeType === "leaf") {
      if (selected.has(root.code)) {
        return { matched: [root], skipped: [] };
      }

      return { matched: [], skipped: [root] };
    } else {
      const result: FilterResult<FilterDomainTree> = {
        matched: [],
        skipped: [],
      };
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

  private filterDomainCondensed(
    root: FilterDomainTree,
    selected: FilterSelection,
  ) {
    const result = this.filterDomainInternal(root, selected, true);
    return result as FilterResult<FilterDomainTree>;
  }

  private filterDomainLeafs(
    root: FilterDomainTree,
    selected: FilterSelection,
    condense?,
  ) {
    const result = this.filterDomainInternal(root, selected, false);
    return result as FilterResult<FilterDomainLeafNode>;
  }

  private shorterString(matchedString, skippedString) {
    if (matchedString.length <= skippedString.length) {
      return matchedString;
    }

    return skippedString;
  }

  // Does a post-order traversal of the tree. This allows aggregation of the
  // lower levels first which is necessary when calculating if internal nodes
  // should have all of their subtree included in the filter.
  private visitDomain(
    root: FilterDomainTree,
    onInternal: (n: FilterDomainInternalNode) => void,
    onLeaf: (n: FilterDomainLeafNode) => void,
  ) {
    if (!root) {
      return;
    }

    if (root.nodeType === "internal") {
      for (const c of root.children) {
        this.visitDomain(c, onInternal, onLeaf);
      }

      onInternal(root);
    } else {
      onLeaf(root);
    }
  }
}
