const path = require('path');
const {EventEmitter} = require('vscode');
const {ThemeIcon} = require('vscode');
const {GenesysCloudTreeItem} = require('./genesysCloudTreeItem');
const {TreeViewDataProvider} = require('./treeViewDataProvider');

const Idle = 0;
const Loading = 1;
const Streaming = 2;

class StreamingViewDataProvider extends TreeViewDataProvider {
  constructor(context) {
    super()
    this.context = context;
    this._onDidChangeTreeData = new EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.streamingTreeItems = [];
    this.viewState = Idle;
  }

  clearItems() {
    throw new Error('clearItems not implemented')
  }

  handleItem() {
    throw new Error('handleItem not implemented')
  }

  getStreamingControlItem(
    viewName,
    startCommand,
    stopCommand,
  ) {
    const streamingControlItemArgs = (() => {
      switch (this.viewState) {
        case Idle:
          return {
            label: `Start streaming ${viewName}`,
            command: startCommand,
            iconId: 'play-circle',
          };
        case Loading:
          return {
            label: `Starting streaming ${viewName} ...`,
            command: stopCommand,
            iconFileName: 'loading',
          };
        case Streaming:
          return {
            label: `Stop streaming ${viewName}`,
            command: stopCommand,
            iconId: 'stop-circle',
          };
      }
    })();
    return this.createItemWithCommand(streamingControlItemArgs);
  }

  createItemWithCommand(command) {
    if (command.iconFileName) {
      return new GenesysCloudTreeItem(command.label, {
        commandString: command.command,
        iconPath: {
          light: path.resolve(__dirname, `../../resources/icons/light/${command.iconFileName}.svg`),
          dark: path.resolve(__dirname, `../../resources/icons/dark/${command.iconFileName}.svg`),
        },
      });
    } else {
      return new GenesysCloudTreeItem(command.label, {
        commandString: command.command,
        iconPath: command.iconId ? new ThemeIcon(command.iconId) : undefined,
      });
    }
  }

  setViewState(viewState) {
    this.viewState = viewState;
    this.refresh();
  }

  refresh() {
    this.treeItems = null;
    this._onDidChangeTreeData.fire(null);
  }

  getTreeItem(element) {
    return element;
  }

  async getChildren(element) {
    if (element === undefined) {
      return await this.buildTree();
    }
    return element.children;
  }
}

module.exports = {
  StreamingViewDataProvider,
  Idle,
  Loading,
  Streaming
}