const {window} = require('vscode');
const vscode = require('vscode');
const childProcess = require('child_process');
const fs = require('fs');

class CliClient {
  constructor(extensionContext, notificationsView, updateCLIProfileStatusBarItem) {
    this.cliPath = CliClient.detectInstallation();
    this.extensionContext = extensionContext;
    this.notificationsView = notificationsView;
    this.updateCLIProfileStatusBarItem = updateCLIProfileStatusBarItem;
    this.gcStream = null;
    this.profileName = null;
    vscode.workspace.onDidChangeConfiguration(this._handleDidChangeConfiguration, this);
  }

  static promptInstall() {
    vscode.commands.executeCommand('installCLIView.focus');
  }

  static async detectInstallation() {
    // TODO more operating systems
    const installPath = '/usr/local/bin/gc';

    if (await isFile(installPath)) {
      // This context tells TreeViews if they should be rendered. It is negative ("is not ...")
      // because we want to assume the CLI is installed on startup (when undefined, it implies CLI
      // is installed).
      vscode.commands.executeCommand('setContext', 'genesys-cloud.isNotCLIInstalled', false);
      return Promise.resolve(installPath);
    }

    vscode.commands.executeCommand('setContext', 'genesys-cloud.isNotCLIInstalled', true);
    return Promise.resolve(null);
  }

  async getCLIPath() {
    this.cliPath = CliClient.detectInstallation();
    const cliPath = await this.cliPath;
    if (!cliPath) {
      CliClient.promptInstall();
    }

    return cliPath;
  }

  async selectCLIProfile() {
    try {
      let selectedProfile = await this._promptProfile();
      if (!selectedProfile) {
        return;
      }
      this.profileName = selectedProfile;
      this.updateCLIProfileStatusBarItem(this.profileName);
    } catch (e) {
      window.showErrorMessage(`Cannot select CLI profile: ${e.message}`);
    }
  }

  async _promptProfile() {
    const profiles = await this.invoke(['profiles', 'list']);
    let profileNames = [];
    for (const profile of profiles)
      profileNames.push(profile.profileName)
    const selectedProfile = await window.showQuickPick(profileNames, {
      matchOnDetail: true,
      placeHolder: 'Select a profile',
    });
    return selectedProfile;
  }

  async invoke(args, body) {
    if (body != null) {
      return await this._upsert(JSON.stringify(body), args);
    } else {
      args = this._generateArgs(args)
      const child = childProcess.spawnSync('gc', args, { encoding : 'utf8' })
      return JSON.parse(child.stdout);
    }
  }

  _upsert(body, gcArgs) {
    return new Promise((resolve, reject) => {
      const echo = childProcess.spawn('echo', [body])
      const gc = childProcess.spawn('gc', this._generateArgs(gcArgs))
      echo.stdout.pipe(gc.stdin)

      let response = "";
      gc.stdout.on("data", (chunk) => {
          response += chunk;
      });

      gc.on("close", (code) => {
          if (code != 0) {
              reject();
          } else {
              resolve(response);
          }
      });
    });
  };

  _generateArgs(args) {
    if (this.profileName != null) {
      args.push('--profile')
      args.push(this.profileName)
    }
    return args;
  }

  stopListeningToWebsocket() {
    this.gcStream.kill();
  }

  listenToWebsocket(channelId, showHeartbeat) {
    let args = ['notifications', 'channels', 'listen', channelId];
    if (!showHeartbeat)
      args.push('--noheartbeat')
    args = this._generateArgs(args)
    this.gcStream = childProcess.spawn('gc', args)

    this.gcStream.stdout.on("data", (chunk) => {
      this.notificationsView.handleItem(JSON.parse(chunk.toString()));
    });
  }

  async _handleDidChangeConfiguration(e) {
    const shouldHandleConfigurationChange = e.affectsConfiguration('genesys-cloud');
    if (shouldHandleConfigurationChange) {
      await this.getCLIPath();
    }
  }
}

async function isFile(path) {
  try {
    const resolvedPath = await fs.promises.realpath(path);
    const fileStat = await fs.promises.stat(resolvedPath);
    return fileStat.isFile();
  } catch (err) {
    console.error(`Error looking for CLI at ${path}`, err);
    return false;
  }
}

module.exports.CliClient = CliClient;