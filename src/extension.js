// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

const {Tutorials} = require('./tutorials')
const {CliClient} = require('./cliClient')
const { HelpfulLinks } = require("./helpfulLinks.js");
const {initializeWorkspaceState, getNotificationDetailsMap, getSDKLogDetailsMap} = require('./workspaceState')

const {NotificationsView} = require('./views/notificationsView');
const {TutorialsView} = require('./views/tutorialsView');
const { ResourcesLinkView } = require("./views/linksView");
const { SDKLogsView } = require('./views/sdkLogsView');
const { Notifications } = require('./notifications');
const { SDKLogs } = require('./sdkLogs');
const { SDKLogClient } = require('./sdkLogClient');

const notificationsScheme = 'genesysCloudNotification';
const sdkLogsScheme = 'genesysCloudSDKLog';

const cliProfileStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  initializeWorkspaceState(context);

	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(notificationsScheme, new NotificationsProvider(context)));
  context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(sdkLogsScheme, new SDKLogsProvider(context)));

  const notificationsView = new NotificationsView(context)
  const sdkLogsView = new SDKLogsView(context);
  const tutorialsView = new TutorialsView();
  const links = new HelpfulLinks();

  vscode.window.createTreeView('notificationsView', {
    treeDataProvider: notificationsView,
    showCollapseAll: false,
  });

  vscode.window.createTreeView('sdkLogsView', {
    treeDataProvider: sdkLogsView,
    showCollapseAll: false,
  });
  
  vscode.window.createTreeView('tutorialsView', {
    treeDataProvider: tutorialsView,
    showCollapseAll: false,
  });

  vscode.window.createTreeView("helpfulLinksView", {
    treeDataProvider: new ResourcesLinkView(),
    showCollapseAll: false,
  });

  const cliClient = new CliClient(context, notificationsView, updateCLIProfileStatusBarItem);
  const sdkLogsClient = new SDKLogClient(context, sdkLogsView);

  const tutorials = new Tutorials();
  const notifications = new Notifications(cliClient, notificationsView);
  const sdkLogs = new SDKLogs(sdkLogsClient, sdkLogsView);

	cliProfileStatusBarItem.command = 'genesys-cloud.selectCLIProfile';
  context.subscriptions.push(cliProfileStatusBarItem);
  updateCLIProfileStatusBarItem('default')
  cliProfileStatusBarItem.show();

  let disposable = [
      vscode.commands.registerCommand('genesys-cloud.openTutorial', function () {
        return tutorials.selectAndDownloadTutorial();
      }),
      vscode.commands.registerCommand('genesys-cloud.checkCLI', function () {
        return cliClient.getCLIPath();
      }),
      vscode.commands.registerCommand('genesys-cloud.selectCLIProfile', function () {
        return cliClient.selectCLIProfile();
      }),
      vscode.commands.registerCommand('genesys-cloud.startNotificationStreaming', function () {
        return notifications.selectAndConnectToTopic();
      }),
      vscode.commands.registerCommand('genesys-cloud.stopNotificationStreaming', function () {
        return notifications.stopNotificationStreaming();
      }),
      vscode.commands.registerCommand('genesys-cloud.openNotificationDetails', function (data) {
        return openNotificationDetails(data);
      }),
      vscode.commands.registerCommand('genesys-cloud.startSDKLogStreaming', function () {
        return sdkLogs.selectAndTailLogFile();
      }),
      vscode.commands.registerCommand('genesys-cloud.stopSDKLogStreaming', function () {
        return sdkLogs.stopSDKLogStreaming();
      }),
      vscode.commands.registerCommand('genesys-cloud.openSDKLogDetails', function (data) {
        return openSDKLogDetails(data);
      }),
      vscode.commands.registerCommand("genesys-cloud.openLinks", function () {
        return links.selectAndOpenLink();
      }),
  ];

  context.subscriptions.push(...disposable);
}

function openNotificationDetails(data) {
  const filename = data.id;
  const uri = vscode.Uri.parse(`${notificationsScheme}:${filename}`);
  vscode.workspace
    .openTextDocument(uri)
    .then((doc) => vscode.languages.setTextDocumentLanguage(doc, 'json'))
    .then((doc) => vscode.window.showTextDocument(doc, {preview: false}));
};

function openSDKLogDetails(data) {
  const filename = data.id;
  const uri = vscode.Uri.parse(`${sdkLogsScheme}:${filename}`);
  vscode.workspace
    .openTextDocument(uri)
    .then((doc) => vscode.languages.setTextDocumentLanguage(doc, 'json'))
    .then((doc) => vscode.window.showTextDocument(doc, {preview: false}));
};

class NotificationsProvider {
  constructor(context) {
    this.context = context;
  }

  onDidChangeEmitter = new vscode.EventEmitter();
  onDidChange = this.onDidChangeEmitter.event;

  provideTextDocumentContent(uri) {
    let notificationMap = getNotificationDetailsMap(this.context);
    let notification = notificationMap.get(uri.path)

    const editorConfig = vscode.workspace.getConfiguration('editor');
    const insertSpaces = editorConfig.get('insertSpaces', true);
    const tabSize = editorConfig.get('tabSize', 2);
    const space = insertSpaces ? tabSize : '\t';

    const contents = notification.getMetadata().contents

    return JSON.stringify(JSON.parse(contents), undefined, space);
  }
};

class SDKLogsProvider {
  constructor(context) {
    this.context = context;
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  provideTextDocumentContent(uri) {
    let sdkLogMap = getSDKLogDetailsMap(this.context);
    let sdkLog = sdkLogMap.get(uri.path)

    const editorConfig = vscode.workspace.getConfiguration('editor');
    const insertSpaces = editorConfig.get('insertSpaces', true);
    const tabSize = editorConfig.get('tabSize', 2);
    const space = insertSpaces ? tabSize : '\t';

    const contents = sdkLog.getMetadata().contents

    return JSON.stringify(JSON.parse(contents), undefined, space);
  }
};

function updateCLIProfileStatusBarItem(profileName) {
  cliProfileStatusBarItem.text = `GC Profile: ${profileName}`;
  cliProfileStatusBarItem.show();
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
