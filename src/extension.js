// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

const { Tutorials } = require("./tutorials");
const { CliClient } = require("./cliClient");
const { HelpfulLinks } = require("./helpfulLinks.js");
const {
  initializeWorkspaceState,
  getNotificationDetailsMap,
} = require("./workspaceState");

const { NotificationsTreeDataProvider } = require("./testTreeViewProvider");

const { TutorialsViewProvider } = require("./tutorialsView");
const { ResourcesLinkView } = require("./linksView");
const { Notifications } = require("./notifications");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  initializeWorkspaceState(context);

  const tutorials = new Tutorials();

  const links = new HelpfulLinks();

  function openNotificationDetails(data) {
    const filename = data.id;
    const uri = vscode.Uri.parse(`genesysCloudNotification:${filename}`);
    vscode.workspace
      .openTextDocument(uri)
      .then((doc) => vscode.languages.setTextDocumentLanguage(doc, "json"))
      .then((doc) => vscode.window.showTextDocument(doc, { preview: false }));
  }

  const myScheme = "genesysCloudNotification";
  const myProvider = new (class {
    // emitter and its event
    onDidChangeEmitter = new vscode.EventEmitter();
    onDidChange = this.onDidChangeEmitter.event;

    provideTextDocumentContent(uri) {
      console.log(uri);
      let notificationMap = getNotificationDetailsMap(context);
      let notification = notificationMap.get(uri.path);

      const editorConfig = vscode.workspace.getConfiguration("editor");
      const insertSpaces = editorConfig.get("insertSpaces", true);
      const tabSize = editorConfig.get("tabSize", 2);
      const space = insertSpaces ? tabSize : "\t";

      const contents = notification.getMetadata().contents;

      return JSON.stringify(JSON.parse(contents), undefined, space);
    }
  })();
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(myScheme, myProvider)
  );

  let notificationsTreeViewDataProvider = new NotificationsTreeDataProvider(
    context
  );
  const cliClient = new CliClient(context, notificationsTreeViewDataProvider);
  vscode.window.createTreeView("notificationsView", {
    treeDataProvider: notificationsTreeViewDataProvider,
    showCollapseAll: false,
  });

  vscode.window.createTreeView("tutorialsView", {
    treeDataProvider: new TutorialsViewProvider(),
    showCollapseAll: false,
  });

  vscode.window.createTreeView("helpfulLinks", {
    treeDataProvider: new ResourcesLinkView(),
    showCollapseAll: false,
  });

  const notifications = new Notifications(cliClient);

  let disposable = [
    vscode.commands.registerCommand("genesys-cloud.openTutorial", function () {
      return tutorials.selectAndDownloadTutorial();
    }),
    vscode.commands.registerCommand("genesys-cloud.checkCLI", function () {
      return cliClient.getCLIPath();
    }),
    vscode.commands.registerCommand(
      "genesys-cloud.startNotificationStreaming",
      function () {
        return notifications.selectAndConnectToTopic();
      }
    ),
    vscode.commands.registerCommand(
      "genesys-cloud.openNotificationDetails",
      function (data) {
        return openNotificationDetails(data);
      }
    ),
    vscode.commands.registerCommand("genesys-cloud.openLinks", function () {
      return links.selectAndOpenLink();
    }),
  ];

  context.subscriptions.push(...disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
