const {TreeItem, TreeItemCollapsibleState} = require('vscode');

class GenesysCloudTreeItem extends TreeItem {
  constructor(label, options) {
    super(label, TreeItemCollapsibleState.None);
    this.children = [];
    this.parent = null;
    this.label = label;
    this.contextValue = options && options.contextValue || 'genesys-cloud';
    this.commandString = options && options.commandString;
    this.iconPath = options && options.iconPath;
    this.tooltip = options && options.tooltip;
    this._metadata = {};
    this.setMetadata({})
  }

  getMetadata() {
    return this._metadata;
  }

  setMetadata(data) {
    this._metadata = data;
    if (this.commandString) {
      this.command = {
        title: `genesys-cloud.${this.commandString}`,
        command: `genesys-cloud.${this.commandString}`,
        arguments: [this._metadata],
      };
    }
  }

  makeCollapsible() {
    this.collapsibleState = TreeItemCollapsibleState.Collapsed;
  }

  expand() {
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  addChild(item) {
    this.children.push(item);
    if (this.children.length) {
      if (this.collapsibleState !== TreeItemCollapsibleState.Expanded) {
        this.makeCollapsible();
      }
    }
    return this;
  }
}

module.exports.GenesysCloudTreeItem = GenesysCloudTreeItem;