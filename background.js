/* global chrome */
chrome.app.runtime.onLaunched.addListener(launchData => {
    window.launchData = launchData
    chrome.app.window.create("main.html", {
        frame: "chrome",
        bounds: {
            width: 750,
            height: 700
        }
    })
})
