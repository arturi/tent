const Tent = require('./components/Tent')
const dragDrop = require('drag-drop')
const api = require('./client-api.js')
const debounce = require('lodash.debounce')
const css = require('template-css')
const { h, Component, render } = require('preact')
const hyperx = require('hyperx')
const html = hyperx(h)

// TODO: encryption
// https://www.webpackbin.com/bins/-Kf39BfshtwP3rIZVuEV

function log (msg) {
  if (typeof msg === 'object') {
    try {
      msg = JSON.stringify(msg)
    } catch (e) {
      msg = msg
    }
  }

  function pad (str) {
    return (str.length !== 2) ? '0' + str : str
  }

  var date = new Date()
  var hours = date.getHours().toString()
  var minutes = date.getMinutes().toString()
  var seconds = date.getSeconds().toString()
  var time = pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)

  // const resultingMessage = `%c [${time}] ✨ ${msg}`
  // console.log(resultingMessage, 'color: #5e2ca5;')
  var resultingMessage = `[${time}] 🚦 ${msg}`
  console.log(resultingMessage)
}

let state = {
  doc: '',
  docId: '',
  docList: [],
  showNewDocPopOver: false
}

window.state = state

const actions = {
  updateDocList: (data) => {
    update({ docList: data })
  },
  updateDoc: (data) => {
    update({ doc: data.doc, docId: data.docId })
  },
  toggleNewDocPopover: (data) => {
    update({ showNewDocPopOver: data })
  },
  saveFile: (data) => {
    log('Saving file')
    api.saveFile(data, (err, res) => {
      if (err) console.log(err)
      console.log(res.data)
      const type = res.data.type.split('/')[0]
      const editorTextEl = editorEl.querySelector('textarea')

      let insertContent
      if (type === 'image') {
        insertContent = `![](${res.data.url})`
      } else {
        insertContent = res.data.url
      }

      insertAtCaret(editorTextEl, insertContent)
    })
  },
  loadDocList: (data) => {
    return new Promise((resolve, reject) => {
      api.getList((err, res) => {
        if (err) reject(err)
        log('Loaded doc list')
        actions.updateDocList(res.data)
        return resolve(res.data)
      })
    })
  },
  loadDoc: (data) => {
    const docId = data || state.docList[0]
    return new Promise((resolve, reject) => {
      api.getDoc(docId, (err, res) => {
        if (err) reject(err)
        log('Loaded doc: ' + docId)
        actions.updateDoc({ doc: res.data, docId: docId })
        actions.updateEditor(data)
        resolve(res)
      })
    })
  },
  updateEditor: (data) => {
    log('Updating editor')
  },
  saveDoc: (data) => {
    log('Saving: ' + data.docId)
    return new Promise(function (resolve, reject) {
      api.saveDoc(data.docId, data.doc, (err, res) => {
        if (err) reject(err)
        console.log(res)
        log(res)
        resolve(res)
      })
    })
  },
  _saveDoc: debounce((data, actions) => actions.saveDoc(data), 1000),
  newDoc: (data) => {
    const docId = data
    log('Creating new doc: ' + docId)

    return actions.saveDoc({ docId: docId, doc: '' })
      .then(actions.loadDocList)
      .then(() => actions.loadDoc(docId))
      .then(() => actions.toggleNewDocPopover(false))
  },
  saveState: (data) => {
    localStorage.setItem('tentState', JSON.stringify(state))
  },
  loadLastOpenDoc: (data) => {
    const savedStateString = localStorage.getItem('tentState')
    const savedState = JSON.parse(savedStateString)
    let docId
    if (savedState && savedState.docId) {
      log('Found some saved state: ' + savedStateString)
      docId = savedState.docId
    }
    return actions.loadDoc(docId)
      .then(actions.updateEditor)
  }
}

let root = render(h(Tent, {state: state, actions: actions, update: update}), document.body)

function update (patch) {
  state = Object.assign({}, state, patch)
  root._component.setState(state)
}

function init () {
  log('Start like an animal!')
  update(state)

  window.onbeforeunload = (ev) => actions.saveState()

  dragDrop(document.body, (files) => {
    files.forEach((file) => {
      actions.saveFile(file)
    })
  })

  actions.loadDocList().then(actions.loadLastOpenDoc)
}

init()
