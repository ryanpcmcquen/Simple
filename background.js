/* global chrome */
chrome.app.runtime.onLaunched.addListener((launchData) => {
  window.launchData = launchData
  if (launchData.items) {
    window._simpleIsOpeningFiles_ = true
  } else {
    window._simpleIsOpeningFiles_ = false
  }
  chrome.app.window.create('main.html', {
    frame: 'chrome',
    bounds: {
      width: 750,
      height: 700
    }
  })
})
