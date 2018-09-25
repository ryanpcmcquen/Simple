/* global chrome */
chrome.app.runtime.onLaunched.addListener((launchData) => {
console.log(chrome.storage.local.get())
    window.launchData = Object.assign(
        {},
        launchData,
        
    )
    chrome.app.window.create('main.html', {
        frame: 'chrome',
        bounds: {
            width: 750,
            height: 600
        }
    })
})
chrome.runtime.onMessage.addListener((request) => {
    navigator.webkitPersistentStorage.simplePreferences = request
})