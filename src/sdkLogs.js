const fs = require('fs');
const {window} = require('vscode');
const {Idle, Loading, Streaming} = require('./views/streamingViewDataProvider')

class SDKLogs {
  constructor(sdkLogsCLient, sdkLogsView) {
    this.sdkLogsCLient = sdkLogsCLient;
    this.sdkLogsView = sdkLogsView;
  }

  async selectAndTailLogFile() {
    try {
      this.sdkLogsView.clearItems();
      this.sdkLogsView.setViewState(Loading);
      let selectedFilePath = await this._promptLogPath();
      if (!selectedFilePath) {
        this.sdkLogsView.setViewState(Idle);
        return;
      }

      if (!fs.existsSync(selectedFilePath)) {
        this.sdkLogsView.setViewState(Idle);
        throw new Error(`${selectedFilePath} does not exist`);
      }

      this.sdkLogsView.setViewState(Streaming);
      this._streamSDKLogs(selectedFilePath)
    } catch (e) {
      window.showErrorMessage(`Cannot tail SDK Log: ${e.message}`);
    }
  };

  async stopSDKLogStreaming() {
    this.sdkLogsView.setViewState(Idle);
    this.sdkLogsCLient.stopTailingFile();
  }

  async _streamSDKLogs(filePath) {
    this.sdkLogsCLient.tailFile(filePath);
  }

  async _promptLogPath() {
    const selectedPath = await window.showInputBox({
      placeHolder: 'Enter the log file path',
    });
    return selectedPath;
  };
}

module.exports.SDKLogs = SDKLogs