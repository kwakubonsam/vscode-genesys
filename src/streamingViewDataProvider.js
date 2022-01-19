const path = require('path');
const {ThemeIcon, window} = require('vscode');
const {GenesysCloudTreeItem} = require('./genesysCloudTreeItem');
const {TreeViewDataProvider} = require('./treeViewDataProvider');

const Idle = 0;
const Loading = 1;
const Streaming = 2;

class StreamingViewDataProvider extends TreeViewDataProvider {
  constructor(cliClient) {
    super();
    this.cliClient = cliClient;
    this.streamingTreeItems = [];
    this.viewState = Idle;

    this.readableStream = {};
  }

  startStreaming = async () => {
    if (this.viewState === Idle) {
      this.setViewState(Loading);
      try {
        await this.setupStreams();
      } catch (e) {
        window.showErrorMessage(e.message);
        this.stopStreaming();
      }
    }
  };

  stopStreaming = () => {
    this.cleanupStreams();
    this.setViewState(Idle);
  };

  clearItems() {
    this.streamingTreeItems = [];
    this.refresh();
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
          light: path.resolve(__dirname, `../resources/icons/light/${command.iconFileName}.svg`),
          dark: path.resolve(__dirname, `../resources/icons/dark/${command.iconFileName}.svg`),
        },
      });
    } else {
      return new GenesysCloudTreeItem(command.label, {
        commandString: command.command,
        iconPath: command.iconId ? new ThemeIcon(command.iconId) : undefined,
      });
    }
  }

async setupStreams() {
  }

  createReadableStream(){}

  handleData(){};

  insertItem = (treeItem) => {
    this.streamingTreeItems.unshift(treeItem);
  };

  setViewState(viewState) {
    this.viewState = viewState;
    this.refresh();
  }

  cleanupStreams = () => {
    this.readableStream.cancel();
    this.readableStream.destroy();
    this.readableStream = undefined;
  };
}

module.exports = {
  StreamingViewDataProvider,
  Idle,
  Loading,
  Streaming
}