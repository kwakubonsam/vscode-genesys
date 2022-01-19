const vscode = require('vscode');
const childProcess = require('child_process');
const fs = require('fs');

class CliClient {
  constructor(extensionContext, notificationTreeViewProvider) {
    this.cliPath = CliClient.detectInstallation();
    this.extensionContext = extensionContext;
    this.notificationTreeViewProvider = notificationTreeViewProvider;
    vscode.workspace.onDidChangeConfiguration(this._handleDidChangeConfiguration, this);
  }

  static promptInstall() {
    vscode.commands.executeCommand('installCLIView.focus');
  }

  static async detectInstallation() {
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

  async invoke(args, body) {
    if (body != null) {
      return await this._upsert(JSON.stringify(body), args);
    } else {
      const child = childProcess.spawnSync('gc', args, { encoding : 'utf8' })
      return JSON.parse(child.stdout);
    }
  }

  _upsert(body, gcArgs) {
    return new Promise((resolve, reject) => {
      const echo = childProcess.spawn('echo', [body])
      const gc = childProcess.spawn('gc', gcArgs)
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

  listenToWebsocket(channelId) {
    const gc = childProcess.spawn('gc', ['notifications', 'channels', 'listen', channelId])

    gc.stdout.on("data", (chunk) => {
      this.notificationTreeViewProvider.handleNotification(JSON.parse(chunk.toString()));
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