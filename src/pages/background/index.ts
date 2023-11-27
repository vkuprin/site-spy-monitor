import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import trackedWebsitesStorage from '@src/shared/storages/trackedWebsitesStorage';

const absoluteIconPath = chrome.runtime.getURL('icon-128.png');

reloadOnUpdate('pages/background');
reloadOnUpdate('pages/content/style.scss');

// console.log('background loaded');
//
// let trackedWebsites = [];
// const DEFAULT_INTERVAL_TIME = 30; // default 30 seconds
//
// // This function will be similar to checkWebsiteChanges in your popup component
// async function checkWebsiteChanges(url: string) {
//   const isSameVersion = await trackedWebsitesStorage.isVersionSame(url);
//   console.log('isSameVersion', isSameVersion);
//
//   if (!isSameVersion) {
//     await trackedWebsitesStorage.saveContent(url);
//     // send a browser notification if the website has changed
//     chrome.notifications.create({
//       type: 'basic',
//       iconUrl: absoluteIconPath,
//       title: 'Website Updated',
//       message: `The website ${url} has been updated.`,
//     });
//   }
// }
//
// let intervalTime = DEFAULT_INTERVAL_TIME; // default 30 seconds
//
// function setupAlarm() {
//   chrome.alarms.create('checkWebsites', { periodInMinutes: intervalTime / 60 });
// }
//
// // When the background script is loaded, initialize trackedWebsites
// async function initialize() {
//   trackedWebsites = await trackedWebsitesStorage.getAllUrls();
//
//   // Fetch the saved intervalTime from storage
//   chrome.storage.local.get(['intervalTime'], function (result) {
//     if (result.intervalTime) {
//       intervalTime = result.intervalTime;
//     }
//     setupAlarm(); // Setup the alarm after fetching the interval
//   });
// }
//
// initialize();
//
// // chrome.notifications.create({
// //   type: 'basic',
// //   iconUrl: absoluteIconPath,
// //   title: 'Vee Tracker was installed',
// //   message: 'Ensure browser notifications are enabled for website change notifications.',
// // });
//
// // Add an alarm listener to trigger the checks
// chrome.alarms.onAlarm.addListener(alarm => {
//   if (alarm.name === 'checkWebsites') {
//     for (const website of trackedWebsites) {
//       checkWebsiteChanges(website);
//     }
//   }
// });
//
// chrome.storage.onChanged.addListener(changes => {
//   if (changes.intervalTime) {
//     intervalTime = changes.intervalTime.newValue;
//     chrome.alarms.clear('checkWebsites', () => {
//       setupAlarm(); // reset the alarm with the new interval
//     });
//   }
// });
