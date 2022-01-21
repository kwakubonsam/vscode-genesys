const {GenesysCloudTreeItem} = require('./genesysCloudTreeItem');

class TreeViewDataProvider {
  constructor() {
    this._onDidChangeTreeData = {}
  }

  refresh() {
    this.treeItems = null;
    this._onDidChangeTreeData.fire(null);
  }

  getTreeItem(element) {
    return element;
  }

  getParent(element) {
    if (element instanceof GenesysCloudTreeItem && element.parent) {
      return element.parent;
    }
    return null;
  }

  async getChildren(element) {
    if (!this.treeItems) {
      this.treeItems = await this.buildTree();
    }

    if (element instanceof GenesysCloudTreeItem) {
      return element.children;
    }

    if (!element) {
      if (this.treeItems) {
        return this.treeItems;
      }
    }
    return [];
  }

  buildTree() {
    return Promise.resolve([]);
  }
}

module.exports.TreeViewDataProvider = TreeViewDataProvider;