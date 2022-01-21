const { GenesysCloudTreeItem } = require("./genesysCloudTreeItem");
const { TreeViewDataProvider } = require("./treeViewDataProvider");
const { ThemeIcon } = require("vscode");

class ResourcesLinkView extends TreeViewDataProvider {
  buildTree() {
    const items = [];

    const resourceItem = new GenesysCloudTreeItem("Select a resource link", {
      commandString: "openLinks",
      iconPath: new ThemeIcon("link-external"),
      tooltip: "Select a dev resource",
      contextValue: "resourceItem",
    });

    items.push(resourceItem);

    return Promise.resolve(items);
  }
}

module.exports.ResourcesLinkView = ResourcesLinkView;
