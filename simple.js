/* global
ace,
chrome,
FileReader,
Blob,
FileError,
odis
*/
window.addEventListener('load', () => {
  let fileEntry
  let hasWriteAccess
  const editor = ace.edit('editor')

  const errorHandler = (e) => {
    let msg = ''

    switch (e.code) {
      case FileError.QUOTA_EXCEEDED_ERR:
        msg = 'QUOTA_EXCEEDED_ERR'
        break
      case FileError.NOT_FOUND_ERR:
        msg = 'NOT_FOUND_ERR'
        break
      case FileError.SECURITY_ERR:
        msg = 'SECURITY_ERR'
        break
      case FileError.INVALID_MODIFICATION_ERR:
        msg = 'INVALID_MODIFICATION_ERR'
        break
      case FileError.INVALID_STATE_ERR:
        msg = 'INVALID_STATE_ERR'
        break
      default:
        msg = 'Unknown Error'
        break
    }
    console.log('Error: ' + msg)
  }

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
      titleNode.textContent = '[No document loaded.]'
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

  const setFile = (theFileEntry, isWritable) => {
    fileEntry = theFileEntry
    hasWriteAccess = isWritable
  }

  const readFileIntoEditor = (theFileEntry) => {
    if (theFileEntry) {
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
      }, errorHandler)
    }
  }

  const writeEditorToFile = (theFileEntry) => {
    theFileEntry.createWriter((fileWriter) => {
      fileWriter.onerror = (e) => {
        console.log('Write failed: ' + e.toString())
      }

      const blob = new Blob([editor.getValue()])
      fileWriter.truncate(blob.size)
      fileWriter.onwriteend = () => {
        fileWriter.onwriteend = (e) => {
          handleDocumentChange(theFileEntry.fullPath)
        }

        fileWriter.write(blob)
      }
    }, errorHandler)
  }

  const onWritableFileToOpen = (theFileEntry) => {
    setFile(theFileEntry, true)
    readFileIntoEditor(theFileEntry)
  }

  const onChosenFileToSave = (theFileEntry) => {
    setFile(theFileEntry, true)
    writeEditorToFile(theFileEntry)
  }

  const handleNewButton = () => {
    chrome.app.window.create('main.html', {
      frame: 'chrome',
      bounds: {
        width: 750,
        height: 700
      }
    })
  }

  const handleOpenButton = () => {
    chrome.fileSystem.chooseEntry({
      type: 'openWritableFile'
    }, onWritableFileToOpen)
  }

  const handleSaveButton = () => {
    if (fileEntry && hasWriteAccess) {
      writeEditorToFile(fileEntry)
    } else {
      chrome.fileSystem.chooseEntry({
        type: 'saveFile'
      }, onChosenFileToSave)
    }
  }

  // Fix an odd scrolling error:
  editor.$blockScrolling = Infinity
  // Disable syntax checking:
  editor.session.setOption('useWorker', false)

  editor.commands.addCommands([{
    name: 'newFile',
    bindKey: {
      win: 'Ctrl-N',
      mac: 'Command-N'
    },
    exec: handleNewButton
  }, {
    name: 'openFile',
    bindKey: {
      win: 'Ctrl-O',
      mac: 'Command-O'
    },
    exec: handleOpenButton
  }, {
    name: 'saveFile',
    bindKey: {
      win: 'Ctrl-S',
      mac: 'Command-S'
    },
    exec: handleSaveButton
  }, {
    name: 'increaseFontSize',
    bindKey: {
      win: 'Ctrl-=|Ctrl-+',
      mac: 'Command-=|Command-+'
    },
    exec: () => {
      editor.setOption('fontSize', (editor.getOption('fontSize') +
    2))
    }
  }, {
    name: 'decreaseFontSize',
    bindKey: {
      win: 'Ctrl--|Ctrl-_',
      mac: 'Command--|Command-_'
    },
    exec: () => {
      editor.setOption('fontSize', (editor.getOption('fontSize') -
    2))
    }
  }, {
    name: 'resetFontSize',
    bindKey: {
      win: 'Ctrl-0|Ctrl-Numpad0',
      mac: 'Command-0|Command-Numpad0'
    },
    exec: () => {
      editor.setOption('fontSize', 14)
    }
  }])

  // Autosave:
  editor.on('input', odis.debounce(() => {
    if (titleNode.textContent) {
      handleSaveButton()
    }
  }))

  // Enable autocomplete:
  ace.require('ace/ext/language_tools')
  editor.setOptions({
    tabSize: 2,
    useSoftTabs: true,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true
  })

  chrome.runtime.getBackgroundPage((backgroundWindow) => {
    if (backgroundWindow._simpleIsOpeningFiles_) {
      if (backgroundWindow.launchData && backgroundWindow.launchData.items) {
        backgroundWindow.launchData.items.map((item) => {
          chrome.app.window.create('main.html', {
            frame: 'chrome',
            bounds: {
              width: 750,
              height: 700
            }
          }, () => {
            onWritableFileToOpen(item.entry)
          })
        })
        backgroundWindow._simpleIsOpeningFiles_ = false
      }
    } else {
      return false
    }
  })

  editor.focus()
})
