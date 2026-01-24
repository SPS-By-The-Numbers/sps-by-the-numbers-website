import type { TreeViewBaseItem } from "@mui/x-tree-view";
import { Base64Stream, Base64Reader } from "utilities/base64_stream";
import { decodeNumberSet, encodeNumberSet} from "utilities/number_set";

// The number of values for each data item int he short code. Best if it is a mutiple
// of 6 to best patch a base64 digit.
const SHORTCODE_VALUES : number = 12;

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

  public allCodes() : Set<number> {
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
  public toTreeViewItems(filterString: string) : Array<string> {
    const included = this.fromFilterString(filterString);
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
    const excludeString = encodeNumberSet("exclude", new Set(result.skipped.map(n => n.code)));
    const includeString =  encodeNumberSet("include", new Set(result.matched.map(n => n.code)));
    if (excludeString.length === 0) {
      console.log("Mu ha ha");
    }
    return this.shorterString(excludeString, includeString);
  }

  public fromFilterString(filterString: string): Set<number> {
    const decoded = decodeNumberSet(filterString);
    let result = this.allCodes();
    if (decoded.include) {
      result = result.intersection(decoded.include);
    }

    if (decoded.exclude) {
      result = result.difference(decoded.exclude);
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
    onInternal: (n: FilterDomainInternalNode, path: Array<FilterDomainTree>) => void,
    onLeaf: (n: FilterDomainLeafNode, path: Array<FilterDomainTree>) => void
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
