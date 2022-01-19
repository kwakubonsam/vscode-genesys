const {ProgressLocation, window, workspace} = require('vscode');
const path = require('path')

class Notifications {
  constructor(cliClient) {
    this.cliClient = cliClient;
  }

  async selectAndConnectToTopic() {
    try {
      let selectedTopic = await this._promptTopic();
      if (!selectedTopic) {
        return;
      }

      if (selectedTopic.includes('{id}')) {
        const id = await this._promptId();
        selectedTopic = selectedTopic.replace('{id}', id)
      }
      
      this._streamNotifications(selectedTopic)
    } catch (e) {
      window.showErrorMessage(`Cannot subscribe to topic: ${e.message}`);
    }
  };

  async _streamNotifications(topic) {
    const result = await this.cliClient.invoke(['notifications', 'channels', 'create'])
    let channelId = result.id
    await this.cliClient.invoke(['notifications', 'channels', 'subscriptions', 'subscribe', channelId], [{
      id: topic
    }])

    this.cliClient.listenToWebsocket(channelId)
  }

  async _promptTopic() {
    let result = {}
    await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: `Fetching available topics`,
        cancellable: false,
      },
      async (progress, token) => {
        result = await this.cliClient.invoke(['notifications', 'availabletopics', 'list'])
      }
    )

    let availableTopics = [];
    for (const entity of result.entities)
      availableTopics.push(entity.id)

    const selectedTopic = await window.showQuickPick(availableTopics, {
      matchOnDetail: true,
      placeHolder: 'Select a topic',
    });
    return selectedTopic;
  };

  async _promptId() {
    const selectedLanguage = await window.showInputBox({
      placeHolder: 'Enter an ID',
    });
    return selectedLanguage;
  };
}

module.exports.Notifications = Notifications