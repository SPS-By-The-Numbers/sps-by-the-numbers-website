import type { FilterDomainTree } from "utilities/filter";

// Iterates a TreeViewBaseItem and extracts all IDs.
//
// Mostly used to generate default selection of all items.
export function allItems(filterItemTree) : Array<string> {
  const nodes = [...filterItemTree]; // Take copy of input
  const itemIds = new Array<string>();
  while (nodes.length > 0) {
    const n = nodes.pop();
    itemIds.push(n.id);

    if (n.children && n.children.length > 0) {
      nodes.push(...n.children);
    }
  }

  return itemIds;
}

// Takes a set list of RichTreeView item settings and extracts the code for it.
//
// The RichTreeView items have the form obj-1 or act-22 which is
// object_code 1 and activity_code 2.  prefix is used to identify the code.
//
// It is not possible to just split by '-' and then take the second element as
// RichTreeView will have grouping items also that need to recork their selected
// state. Our convention is to use a different prefix so they can be filtered out.
export function extractCodes(prefix : string, selectedItems: Array<string>) {
  const selectedCodes = new Array<number>();
  for (const id of selectedItems) {
    const parts = id.split("-");
    if (parts.length === 2 && parts[0] === prefix) {
      selectedCodes.push(parseInt(parts[1]));
    }
  }
  return selectedCodes;
}

