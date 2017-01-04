/* global ace, chrome */
window.addEventListener('DOMContentLoaded', () => {
  let fileEntry
  let hasWriteAccess
  const editor = ace.edit('editor')
  console.log(editor)

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
