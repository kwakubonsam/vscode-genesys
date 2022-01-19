const {ProgressLocation, window, workspace} = require('vscode');
const { Octokit } = require('@octokit/rest');
const path = require('path')
var fs = require('fs');
const https = require('https');

class Tutorials {
  constructor() {
    this._octokit = new Octokit();
    this._ORG = 'MyPureCloud';
    this._REPO = 'developercenter-tutorials';
  }

   async selectAndDownloadTutorial() {
    try {
      const selectedTutorial = await this._promptTutorial();
      if (!selectedTutorial) {
        return;
      }

      const selectedLanguage = await this._promptLanguage(selectedTutorial);
      if (!selectedLanguage) {
        return;
      }

      const downloadPath = await this._promptPath();
      if (!downloadPath) {
        return;
      }

      if (!fs.existsSync(downloadPath)){
        fs.mkdirSync(downloadPath);
      }

      await window.withProgress(
        {
          location: ProgressLocation.Notification,
          title: `Tutorial '${selectedTutorial}' cloning in progress...`,
          cancellable: false,
        },
        async (progress, token) => {
          const content = await this._getGithubContent(path.join(selectedTutorial, selectedLanguage))
          for (const item of content.data) {
            await this._downloadToDir(item, downloadPath);
          }
        }
      )

      window.showInformationMessage(
        `Tutorial '${selectedTutorial}' downloaded`,
      );
    } catch (e) {
      window.showErrorMessage(`Cannot create tutorial: ${e.message}`);
    }
  };

  async getQuickPickItems(path) {
    var content = await this._octokit.rest.repos.getContent({
      owner: this._ORG,
      repo: this._REPO,
      path: path ? path : ''
    });
    let tutorials = [];
    // @ts-ignore
    for (const item of content.data) {
        if (item.type === 'dir') {
            tutorials.push(item.name)
        }
    }
    return tutorials
  };

  async _promptTutorial() {
    const selectedTutorial = await window.showQuickPick(this.getQuickPickItems(), {
      matchOnDetail: true,
      placeHolder: 'Select a tutorial to download',
    });
    return selectedTutorial;
  };

  async _promptLanguage(tutorial) {
    const selectedLanguage = await window.showQuickPick(this.getQuickPickItems(tutorial), {
      matchOnDetail: true,
      placeHolder: 'Select a language',
    });
    return selectedLanguage;
  };

   async _promptPath() {
    const downloadDirectoryUri = await window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      defaultUri: workspace.workspaceFolders ? workspace.workspaceFolders[0].uri : undefined,
      openLabel: 'Download tutorial',
    });

    if (!downloadDirectoryUri) {
      return;
    }

    const downloadPath = path.resolve(downloadDirectoryUri[0].fsPath);

    return downloadPath;
  };

  async _getGithubContent(path) {
    return await this._octokit.rest.repos.getContent({
      owner: this._ORG,
      repo: this._REPO,
      path: path
    });
  }
  
  async _downloadToDir(item, dir) {
    const itemPath = path.join(dir, item.name)
    if (item.download_url !== null) {
      await this._download(item.download_url, itemPath)
    } else {
      if (!fs.existsSync(itemPath)){
        fs.mkdirSync(itemPath);
      }
      var content = await this._getGithubContent(item.path)
      for (const item of content.data) {
        await this._downloadToDir(item, itemPath)
      }
    }
  }
  
  async _download(url, filePath) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filePath);
      let fileInfo = null;
  
      const request = https.get(url, response => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
          return;
        }
  
        fileInfo = {
          mime: response.headers['content-type'],
          size: parseInt(response.headers['content-length'], 10),
        };
  
        response.pipe(file);
      });
  
      file.on('finish', () => resolve(fileInfo));
  
      request.on('error', err => {
        fs.unlink(filePath, () => reject(err));
      });
  
      file.on('error', err => {
        fs.unlink(filePath, () => reject(err));
      });
  
      request.end();
    });
  }
}

module.exports.Tutorials = Tutorials