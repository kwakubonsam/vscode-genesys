const { GenesysCloudTreeItem } = require('./genesysCloudTreeItem');
const {addSDKLogDetails, clearSDKLogDetails} = require('../workspaceState')
const {StreamingViewDataProvider} = require('./streamingViewDataProvider')
const {hashCode} = require('.././utils')

class SDKLogsView extends StreamingViewDataProvider {
  constructor(context) {
    super(context)
  }

  buildTree() {
    const treeItems = [this.getStreamingControlItem('SDK Logs', 'startSDKLogStreaming', 'stopSDKLogStreaming')]

    if (this.streamingTreeItems.length > 0) {
      const logsStreamRootItem = new GenesysCloudTreeItem('SDK Logs');
      logsStreamRootItem.children = this.streamingTreeItems;
      logsStreamRootItem.expand();
      treeItems.push(logsStreamRootItem);
    }

    return Promise.resolve(treeItems);
  }

  handleItem(sdkLog) {
    const label = `${sdkLog.method} ${sdkLog.url}`
    const hash = hashCode(JSON.stringify(sdkLog)).toString();
    const logTreeItem = new GenesysCloudTreeItem(label, {
      commandString: 'openSDKLogDetails',
      contextValue: 'logItem'
    });
    logTreeItem.setMetadata({
      id: hash,
      contents: JSON.stringify(sdkLog)
    });
    this.streamingTreeItems.unshift(logTreeItem);

    addSDKLogDetails(this.context, hash, logTreeItem)
    this.refresh()
  }

  clearItems() {
    this.streamingTreeItems = [];
    clearSDKLogDetails(this.context);
    this.refresh();
  }
}

module.exports.SDKLogsView = SDKLogsView;