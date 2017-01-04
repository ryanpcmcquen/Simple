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
  // console.log(editor)

  const newButton = document.getElementById('new')
  const openButton = document.getElementById('open')
  const saveButton = document.getElementById('save')

  newButton.addEventListener('click', handleNewButton)
  openButton.addEventListener('click', handleOpenButton)
  saveButton.addEventListener('click', handleSaveButton)

  // function newFile () {
    // fileEntry = null
    // hasWriteAccess = false
    // handleDocumentChange(null)
  // }

  function errorHandler (e) {
    var msg = ''

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

  function handleDocumentChange (title) {
    // var mode = 'javascript'
    // var modeName = 'JavaScript'
    if (title) {
      title = title.match(/[^/]+$/)[0]
      document.getElementById('title').innerHTML = title
      document.title = title
      // if (title.match(/.json$/)) {
        // mode = {
          // name: 'javascript',
          // json: true
        // }
        // modeName = 'JavaScript (JSON)'
      // } else if (title.match(/.html$/)) {
        // mode = 'htmlmixed'
        // modeName = 'HTML'
      // } else if (title.match(/.css$/)) {
        // mode = 'css'
        // modeName = 'CSS'
      // }
    } else {
      document.getElementById('title').innerHTML = '[no document loaded]'
    }
    // editor.setOption('mode', mode)
    // document.getElementById('mode').innerHTML = modeName
  }

  function setFile (theFileEntry, isWritable) {
    fileEntry = theFileEntry
    hasWriteAccess = isWritable
  }

  function readFileIntoEditor (theFileEntry) {
    if (theFileEntry) {
      theFileEntry.file(function (file) {
        var fileReader = new FileReader()

        fileReader.onload = function (e) {
          handleDocumentChange(theFileEntry.fullPath)
          editor.setValue(e.target.result)
        }

        fileReader.onerror = function (e) {
          console.log('Read failed: ' + e.toString())
        }

        fileReader.readAsText(file)
      }, errorHandler)
    }
  }

  function writeEditorToFile (theFileEntry) {
    theFileEntry.createWriter(function (fileWriter) {
      fileWriter.onerror = function (e) {
        console.log('Write failed: ' + e.toString())
      }

      var blob = new Blob([editor.getValue()])
      fileWriter.truncate(blob.size)
      fileWriter.onwriteend = function () {
        fileWriter.onwriteend = function (e) {
          handleDocumentChange(theFileEntry.fullPath)
          console.log('Write completed.')
        }

        fileWriter.write(blob)
      }
    }, errorHandler)
  }

/*
var onChosenFileToOpen = function (theFileEntry) {
  setFile(theFileEntry, false)
  readFileIntoEditor(theFileEntry)
}
*/

  var onWritableFileToOpen = function (theFileEntry) {
    setFile(theFileEntry, true)
    readFileIntoEditor(theFileEntry)
  }

  var onChosenFileToSave = function (theFileEntry) {
    setFile(theFileEntry, true)
    writeEditorToFile(theFileEntry)
  }

  function handleNewButton () {
    chrome.app.window.create('main.html', {
      frame: 'chrome',
      bounds: {
        width: 800,
        height: 700
      }
    })
  }

  function handleOpenButton () {
    chrome.fileSystem.chooseEntry({
      type: 'openWritableFile'
    }, onWritableFileToOpen)
  }

  function handleSaveButton () {
    if (fileEntry && hasWriteAccess) {
      writeEditorToFile(fileEntry)
    } else {
      chrome.fileSystem.chooseEntry({
        type: 'saveFile'
      }, onChosenFileToSave)
    }
  }
})
