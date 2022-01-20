const { window, Uri, env } = require("vscode");
const { resources } = require("./devResources");

class HelpfulLinks {
  constructor() {}

  async selectAndOpenLink() {
    try {
      let selectedLink = await this._promptTopic();
      if (!selectedLink) {
        return;
      }
      let selectedLinkValue = resources.find(
        (resource) => resource.name === selectedLink
      );
      this._openLink(selectedLinkValue.url);
    } catch (e) {
      window.showErrorMessage(`Cannot open link: ${e.message}`);
    }
  }

  async _openLink(url) {
    env.openExternal(Uri.parse(url));
  }

  async _promptTopic() {
    let resourceList = resources.map((resource) => resource.name);

    const selectedLink = await window.showQuickPick(resourceList, {
      matchOnDetail: true,
      placeHolder: "Select a resource",
    });
    return selectedLink;
  }
}

module.exports.HelpfulLinks = HelpfulLinks;
