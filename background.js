/* global chrome */
chrome.app.runtime.onLaunched.addListener(function () {
  chrome.app.window.create('main.html', {
    frame: 'chrome',
    bounds: {
      width: 800,
      height: 700
    }
  })
  chrome.commands.onCommand.addListener(function (command) {
    if (command === 'cmdNew') {
      chrome.app.window.create('main.html', {
        frame: 'chrome',
        bounds: {
          width: 800,
          height: 700
        }
      })
    }
  })
})
