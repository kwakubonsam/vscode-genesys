const {window} = require('vscode');
const {Idle, Loading, Streaming} = require('./views/streamingViewDataProvider')

class Notifications {
  constructor(cliClient, notificationsView) {
    this.cliClient = cliClient;
    this.notificationsView = notificationsView;
  }

  async selectAndConnectToTopic() {
    try {
      this.notificationsView.clearItems();
      this.notificationsView.setViewState(Loading);
      let selectedTopic = await this._promptTopic();
      if (!selectedTopic) {
        this.notificationsView.setViewState(Idle);
        return;
      }

      if (selectedTopic.includes('{id}')) {
        const selectedId = await this._promptId();
        if (!selectedId) {
          this.notificationsView.setViewState(Idle);
          return;
        }
        selectedTopic = selectedTopic.replace('{id}', selectedId)
      }

      const showHeartBeat = await this._promptHeartbeat()

      this.notificationsView.setViewState(Streaming);
      this._streamNotifications(selectedTopic, showHeartBeat)
    } catch (e) {
      window.showErrorMessage(`Cannot subscribe to topic: ${e.message}`);
    }
  };

  async stopNotificationStreaming() {
    this.notificationsView.setViewState(Idle);
    this.cliClient.stopListeningToWebsocket();
  }

  async _streamNotifications(topic, showHeartbeat) {
    const result = await this.cliClient.invoke(['notifications', 'channels', 'create'])
    let channelId = result.id
    await this.cliClient.invoke(['notifications', 'channels', 'subscriptions', 'subscribe', channelId], [{
      id: topic
    }])

    this.cliClient.listenToWebsocket(channelId, showHeartbeat)
  }

  async _promptTopic() {
    let result = await this.cliClient.invoke(['notifications', 'availabletopics', 'list'])
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

  async _promptHeartbeat() {
    const answer = await window.showQuickPick(["Yes", "No"], {
      matchOnDetail: true,
      placeHolder: 'Show heartbeat message?',
    });
    return answer === "Yes";
  }
}

module.exports.Notifications = Notifications