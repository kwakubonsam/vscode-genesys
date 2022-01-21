const Tail = require('always-tail');

class SDKLogClient {
  constructor(extensionContext, sdkLogsView) {
    this.extensionContext = extensionContext;
    this.sdkLogsView = sdkLogsView;
    this.tail = null;
  }

  stopTailingFile() {
    this.tail.unwatch();
  }

  tailFile(filePath) {
    this.tail = new Tail(filePath);

    this.tail.on("line", (chunk) => {
      this.sdkLogsView.handleItem(JSON.parse(chunk.toString()));
    });

    this.tail.watch();
  }
}

module.exports.SDKLogClient = SDKLogClient;