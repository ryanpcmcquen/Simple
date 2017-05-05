/* global chrome, FileReader, ace, editor */
chrome.app.runtime.onLaunched.addListener((theFileEntry) => {
  const modeList = ace.require('ace/ext/modelist')
  const titleNode = document.getElementById('title')
  const modeNode = document.getElementById('mode')
  const handleDocumentChange = (title) => {
    let mode
    if (title) {
      title = title.match(/[^/]+$/)[0]
      titleNode.textContent = title
      document.title = title
      mode = modeList.getModeForPath(title).mode
    } else {
      titleNode.textContent = '[no document loaded]'
    }
    editor.session.setMode(mode)
    if ((/python/).test(mode)) {
      editor.setOptions({
        tabSize: 4,
        useSoftTabs: true
      })
    } else if ((/makefile/).test(mode)) {
      editor.setOptions({
        tabSize: 8,
        useSoftTabs: false
      })
    } else {
      editor.setOptions({
        tabSize: 2,
        useSoftTabs: true
      })
    }
    modeNode.textContent = mode.replace(/.*\//g, '')
  }
  try {
    theFileEntry.file((file) => {
      const fileReader = new FileReader()

      fileReader.onload = (e) => {
        handleDocumentChange(theFileEntry.fullPath)
        editor.setValue(e.target.result)
      }

      fileReader.onerror = (e) => {
        console.log('Read failed: ' + e.toString())
      }

      fileReader.readAsText(file)
    }, () => {})
  } catch (ignore) {}

  chrome.app.window.create('main.html', {
    frame: 'chrome',
    bounds: {
      width: 750,
      height: 700
    }
  })
})
