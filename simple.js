/* global
ace,
chrome,
FileReader,
Blob,
FileError
*/
window.addEventListener('DOMContentLoaded', () => {
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

  const modelist = ace.require('ace/ext/modelist')
  const handleDocumentChange = (title) => {
    let mode
    if (title) {
      title = title.match(/[^/]+$/)[0]
      document.getElementById('title').innerHTML = title
      document.title = title
      mode = modelist.getModeForPath(title).mode
    } else {
      document.getElementById('title').innerHTML = '[no document loaded]'
    }
    editor.session.setMode(mode)
    if ((/python/).test(mode)) {
      editor.getSession().setTabSize(4)
      editor.getSession().setUseSoftTabs(true)
    } else if ((/makefile/).test(mode)) {
      editor.getSession().setTabSize(8)
      editor.getSession().setUseSoftTabs(false)
    } else {
      editor.getSession().setTabSize(2)
      editor.getSession().setUseSoftTabs(true)
    }
    document.getElementById('mode').innerHTML = mode.replace(/.*\//g, '')
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
          console.log('Write completed.')
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

  editor.commands.addCommand({
    name: 'newFile',
    bindKey: {win: 'Ctrl-N', mac: 'Command-N'},
    exec: handleNewButton
  })

  editor.commands.addCommand({
    name: 'openFile',
    bindKey: {win: 'Ctrl-O', mac: 'Command-O'},
    exec: handleOpenButton
  })
  editor.commands.addCommand({
    name: 'saveFile',
    bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
    exec: handleSaveButton
  })

  editor.getSession().setTabSize(2)
  editor.getSession().setUseSoftTabs(true)
})
