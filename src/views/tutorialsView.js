const {GenesysCloudTreeItem} = require('./genesysCloudTreeItem');
const {TreeViewDataProvider} = require('./treeViewDataProvider');
const {ThemeIcon} = require('vscode');

class TutorialsView extends TreeViewDataProvider {

  buildTree() {
    const items = [];

    const tutorialsItem = new GenesysCloudTreeItem('Start with a tutorial', {
      commandString: 'openTutorial',
      iconPath: new ThemeIcon('repo-clone'),
      tooltip: 'Clone a tutorial in a language of your choice',
      contextValue: 'tutorialsItem',
    });

    items.push(tutorialsItem);

    return Promise.resolve(items);
  }
}

module.exports.TutorialsView = TutorialsView