import type { TreeViewBaseItem } from "@mui/x-tree-view";
import { Base64Stream } from "utilities/base64_stream";

// Using TreeViewBaseItem is a slightly layering violation since this section shouldn't understand
// UI but tying the two types together just makes everything simpler for now.
type FilterDomainBaseNode = TreeViewBaseItem & {
  shortLabel: string;
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
export function makeLeafNode(
  prefix,
  code,
  label,
  shortLabel?,
): FilterDomainTree {
  return {
    nodeType: "leaf",
    id: `${prefix}-${code}`,
    label,
    shortLabel: shortLabel === undefined ? label : shortLabel,
    code,
  };
}

export class Filter {
  private domainTree: FilterDomainTree;
  private savedAllCodes: Set<number> | undefined;

  constructor(domainTree) {
    this.domainTree = domainTree;
  }

  public treeViewItems(): Array<TreeViewBaseItem> {
    return [this.domainTree];
  }

  public allCodes() {
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

  public toTreeViewItems() {
    const selectItems = new Array<TreeViewBaseItem>();
    const result = new Set<number>();
    this.visitDomain(
      this.domainTree,
      () => {},
      (n) => result.add(n.code),
    );
    return result;
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

  public toShortFilterString(selected: FilterSelection): string {
    const result = this.filterDomainLeafs(this.domainTree, selected);
    // Header format
    //  b[0] = Long or short format. 1 for Long.
    //  b[1] = Positive of Negative filter. 1 for Negative.
    //
    // In Short format, the header is 12 bits (2 Base64 characters).
    // The last 10 bits represent, in order, the number ranges
    // 0-9, 10-19, ..., 90-99.  The bit is set to 1 if there is a filter
    // item within that range. This implicitly encodes the sizes of the
    // filter data.
    //
    // After the header, comes the filter data. For every range that was set
    // to 1 above there is a 10 bit sequence that represents if the filter
    // item is set. In the worst case, there will be 100 bits of filter item
    // data. In the best case, no filter items are set and there is no data.

    // TODO: Handle codes > 100.

    // The most frequent setting with be a negative filter with nothing set
    // indicating all options are set. Special case it.
    const b64Stream = new Base64Stream();
    if (result.skipped.length === 0) {
      b64Stream.pushBits(0, 1,
                         0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0);
    } {
      b64Stream.pushBits(0);  // Short form
    }

    return b64Stream.urlsafeEncode();
  }

  public toFilterString(selected: FilterSelection): string {
    const result = this.filterDomainLeafs(this.domainTree, selected);

    if (result.skipped.length === 0) {
      return "";
    }

    const matchedString = result.matched.map((n) => n.code).join("_");
    const skippedString = "-" + result.skipped.map((n) => n.code).join("_");

    return this.shorterString(matchedString, skippedString);
  }

  public fromFilterString(filterString: string) {
    const isSkipped = filterString[0] === "-";
    const filterExpression = isSkipped ? filterString.slice(1) : filterString;

    const codes = new Set(filterExpression.split("_").map((s) => parseInt(s)));

    // If this is skipped codes, then we have to search through the domain and
    // invert the selection.
    if (isSkipped) {
      const result = this.filterDomainLeafs(this.domainTree, codes);
      return new Set(result.skipped.map((n) => n.code));
    }

    return codes;
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

  private visitDomain(
    root: FilterDomainTree,
    onInternal: (n: FilterDomainInternalNode) => void,
    onLeaf: (n: FilterDomainLeafNode) => void,
  ) {
    if (!root) {
      return;
    }

    if (root.nodeType === "internal") {
      onInternal(root);
      for (const c of root.children) {
        this.visitDomain(c, onInternal, onLeaf);
      }
    } else {
      onLeaf(root);
    }
  }
}
