chrome.app.runtime.onLaunched.addListener(function () {
  // width 640 for font size 12
  //       720 for font size 14
  chrome.app.window.create('main.html', {
    frame: 'chrome'
  });
});

/**
 * Set up the Commands listener event
 * @see http://developer.chrome.com/trunk/apps/commands.html
 */
if (chrome.commands) {
  chrome.commands.onCommand.addListener(function (command) {
    console.log("Command triggered: " + command);

    if (command == "cmdNew") {
      chrome.app.window.create('main.html', {
        frame: 'chrome'
      });
    }
  });
}
