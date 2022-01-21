const { GenesysCloudTreeItem } = require('./genesysCloudTreeItem');
const {addNotificationDetails, clearNotificationDetails} = require('../workspaceState')
const {StreamingViewDataProvider} = require('./streamingViewDataProvider')
const {hashCode} = require('.././utils')

class NotificationsView extends StreamingViewDataProvider {
  constructor(context) {
    super(context)
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

  handleItem(notification) {
    const label = notification.topicName ? notification.topicName : JSON.stringify(notification)
    const hash = hashCode(JSON.stringify(notification)).toString();
    const logTreeItem = new GenesysCloudTreeItem(label, {
      commandString: 'openNotificationDetails',
      contextValue: 'notificationItem'
    });
    logTreeItem.setMetadata({
      id: hash,
      contents: JSON.stringify(notification)
    });
    this.streamingTreeItems.unshift(logTreeItem);

    addNotificationDetails(this.context, hash, logTreeItem)
    this.refresh()
  }

  clearItems() {
    this.streamingTreeItems = [];
    clearNotificationDetails(this.context);
    this.refresh();
  }
}

module.exports.NotificationsView = NotificationsView;