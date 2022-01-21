const { window } = require("vscode");
const { environments } = require("./devResources");
const os = require("os");
const fs = require("fs");
const path = require("path");

class CreateCliProfile {
  constructor() {}

  async createProfile() {
    const outLog = path.join(os.homedir(), "/.gc/config.toml");
    try {
      let userName = await this._promptInput("Enter username");
      if (userName) userName = userName.trim();
      if (userName === "" || !userName) {
        window.showErrorMessage("user name is required");
        return;
      }

      let clientId = await this._promptInput("Enter client id");
      if (clientId) clientId = clientId.trim();
      if (clientId == "" || !clientId) {
        window.showErrorMessage("client id is required");
        return;
      }

      let clientSecret = await this._promptInput("Enter client secret");
      if (clientSecret) clientSecret = clientSecret.trim();
      if (clientSecret == "" || !clientSecret) {
        window.showErrorMessage("client secret is required");
        return;
      }

      const selectedEnv = await this._promptEnv();

      if (!selectedEnv) {
        window.showErrorMessage("environment is required");
        return;
      }

      const env = environments.find((e) => e.id === selectedEnv);

      const data = `\n[${userName}]\n  client_credentials = "${clientId}"\n  client_secret = "${clientSecret}"\n  environment = "${env.value}"\n`;

      fs.appendFile(outLog, data, function (err) {
        if (err) {
          window.showErrorMessage(
            `There was an error creating profile: ${err.message}`
          );
        }
        window.showInformationMessage("Successfully created profile");
      });
    } catch (e) {
      window.showErrorMessage(`Error: ${e.message}`);
    }
  }

  async _promptEnv() {
    const envList = environments.map((e) => e.id);
    const selectedEnv = await window.showQuickPick(envList, {
      matchOnDetail: true,
      placeHolder: "Select an environment",
    });

    return selectedEnv;
  }

  async _promptInput(title) {
    const input = await window.showInputBox({
      title: title,
    });

    return input;
  }
}

module.exports.CreateCliProfile = CreateCliProfile;
