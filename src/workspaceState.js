// Used to keep track of notification details for notification tree items while notification streaming is active.
const notificationDetailsKey = 'NotificationDetails';
const sdkLogDetailsKey = 'SDKLogDetails';

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

function getSDKLogDetailsMap(extensionContext) {
  return extensionContext.workspaceState.get(sdkLogDetailsKey, new Map());
}

function addSDKLogDetails(extensionContext, sdkLogId, sdkLogObject) {
  const sdkLogDetailsMap = getSDKLogDetailsMap(extensionContext);
  sdkLogDetailsMap.set(sdkLogId, sdkLogObject);
  extensionContext.workspaceState.update(sdkLogDetailsKey, sdkLogDetailsMap);
}

function clearSDKLogDetails(extensionContext) {
  extensionContext.workspaceState.update(sdkLogDetailsKey, new Map());
}

module.exports = {
    notificationDetailsKey,
    sdkLogDetailsKey,
    initializeWorkspaceState,
    addNotificationDetails,
    getNotificationDetailsMap,
    clearNotificationDetails,
    addSDKLogDetails,
    getSDKLogDetailsMap,
    clearSDKLogDetails
}