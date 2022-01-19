// Used to keep track of notification details for notification tree items while notification streaming is active.
const notificationDetailsKey = 'NotificationDetails';

function initializeWorkspaceState(extensionContext) {
  clearNotificationDetails(extensionContext);
}

function getNotificationDetailsMap(extensionContext) {
  return extensionContext.workspaceState.get(notificationDetailsKey, new Map());
}

function addNotificationDetails(extensionContext, notificationId, notificationObject) {
  const notificationDetailsMap = getNotificationDetailsMap(extensionContext);
  notificationDetailsMap.set(notificationId, notificationObject);
  extensionContext.workspaceState.update(notificationDetailsKey, notificationDetailsMap);
}

function clearNotificationDetails(extensionContext) {
  extensionContext.workspaceState.update(notificationDetailsKey, new Map());
}

module.exports = {
    notificationDetailsKey: notificationDetailsKey,
    initializeWorkspaceState: initializeWorkspaceState,
    addNotificationDetails: addNotificationDetails,
    getNotificationDetailsMap: getNotificationDetailsMap,
    clearNotificationDetails: clearNotificationDetails
}