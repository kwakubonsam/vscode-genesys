const {EventEmitter} = require('vscode');
const vscode = require('vscode');
const { GenesysCloudTreeItem } = require('./genesysCloudTreeItem');
const {addNotificationDetails} = require('./workspaceState')
const {StreamingViewDataProvider, Idle, Loading, Streaming} = require('./streamingViewDataProvider')

class NotificationsTreeDataProvider extends StreamingViewDataProvider {
  constructor(context) {
    super(context)
    this.context = context;
    this._onDidChangeTreeData = new EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.streamingTreeItems = []
  }

  hashCode(s) {
    return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
  }

  getStreamingControlItem(
    viewName,
    startCommand,
    stopCommand,
  ) {
    const streamingControlItemArgs = (() => {
      switch (this.viewState) {
        case Idle:
          console.log("idle")
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

  buildTree() {
    const treeItems = [this.getStreamingControlItem('notifications', 'startNotificationStreaming', 'stopNotificationStreaming')]

    if (this.streamingTreeItems.length > 0) {
      const logsStreamRootItem = new GenesysCloudTreeItem('Notifications');
      logsStreamRootItem.children = this.streamingTreeItems;
      logsStreamRootItem.expand();
      treeItems.push(logsStreamRootItem);
    }

    return Promise.resolve(treeItems);
  }

  handleNotification(notification) {
    const label = notification.topicName ? notification.topicName : JSON.stringify(notification)
    const hash = this.hashCode(JSON.stringify(notification)).toString();
    const logTreeItem = new GenesysCloudTreeItem(label, {
      commandString: 'openNotificationDetails',
      contextValue: 'logItem'
    });
    logTreeItem.setMetadata({
      id: hash,
      contents: JSON.stringify(notification)
    });
    this.streamingTreeItems.unshift(logTreeItem);

    addNotificationDetails(this.context, hash, logTreeItem)
    this.refresh()
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

module.exports.NotificationsTreeDataProvider = NotificationsTreeDataProvider;