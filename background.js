chrome.app.runtime.onLaunched.addListener(function () {
  // width 640 for font size 12
  //       720 for font size 14
  chrome.app.window.create('main.html', {
    frame: 'chrome',
    bounds: {
      width: 640,
      height: 400
    },
  });
  chrome.commands.onCommand.addListener(function (command) {
    if (command == "cmdNew") {
      chrome.app.window.create('main.html', {
        frame: 'chrome'
      });
    }
  });
});
