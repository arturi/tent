const simpleEditor = require('./simple-editor')
const markdownPreview = require('./markdown-preview')
const dragDrop = require('drag-drop')
const api = require('./client-api.js')
const debounce = require('lodash.debounce')
const csjs = require('csjs')

const { h, app } = require('hyperapp')
const hyperx = require('hyperx')
const html = hyperx(h)

// TODO: encryption
// https://www.webpackbin.com/bins/-Kf39BfshtwP3rIZVuEV

// var dragDrop = require('drag-and-drop-files')
// var fileReader = require('filereader-stream')
// var concat = require('concat-stream')
// var path = require('path')
//
// dragDrop(window, function (files) {
//   files.forEach(function (file) {
//     fileReader(file).pipe(concat({ encoding: 'buffer' }, function (buf) {
//       var ext = path.extname(file.name).slice(1)
//       if (ext === 'svg') ext = 'svg+xml'
//       var img = document.createElement('img')
//       var src = 'data:image/' + ext + ';base64,' + buf.toString('base64')
//       img.setAttribute('src', src)
//       document.body.appendChild(img)
//     }))
//   })
// })

function log (msg) {
  if (typeof msg === 'object') {
    try {
      msg = JSON.stringify(msg)
    } catch (e) {
      msg = msg
    }
  }

  var date = new Date()
  var hours = date.getHours().toString()
  var minutes = date.getMinutes().toString()
  var seconds = date.getSeconds().toString()
  var time = hours + ':' + minutes + ':' + seconds

  // const resultingMessage = `%c [${time}] ✨ ${msg}`
  // console.log(resultingMessage, 'color: #5e2ca5;')
  const resultingMessage = `[${time}] 🚦 ${msg}`
  console.log(resultingMessage)
}

function insertAtCaret (el, text) {
  const startPos = el.selectionStart
  const endPos = el.selectionEnd
  el.value = el.value.substring(0, startPos) + text + el.value.substring(endPos, el.value.length)
  el.selectionStart = startPos + text.length
  el.selectionEnd = startPos + text.length
  el.focus()
  el.dispatchEvent(new Event('input'))
}

const styles = csjs`
  body, html {
    margin: 0;
    padding: 0;
  }

  button {
    background: none;
    border: 0;
    font-family: inherit;
    font-size: inherit;
  }

  .newDoc {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 200px;
    border: 1px solid #b9b9b9;
    border-radius: 3px;
    background-color: white;
    z-index: 10;
  }

  .newDocVisible {
    display: block;
  }

  .main {
    display: flex;
    justify-content: center;
    height: 100vh;
    overflow: hidden;
  }

  .list {
    width: 150px;
    height: 100vh;
    list-style: none;
    padding: 0;
    margin: 0;
    border-right: 1px solid black;
    overflow-y: auto;
  }

  .list li {
    margin: 0;
    padding: 0;
  }

  .list li:hover button,
  .active button {
    background: black;
    color: white;
  }

  .list button {
    cursor: pointer;
    padding: 10px 6px;
    border-bottom: 1px solid black;
    width: 100%;
    text-align: left;
    outline: none;
    font-size: 12px;
  }

  .editor {
    flex: 1;
    height: 100vh;
  }

  .preview {
    flex: 1;
    height: 100vh;
    overflow-y: auto;
  }
`

let editor
let editorEl

const model = {
  doc: '',
  docId: '',
  docList: [],
  showNewDocPopOver: false
}

const subscriptions = [
  (model, actions, error) => {
    log('Start like an animal!')

    window.onbeforeunload = (ev) => actions.saveState()

    actions.loadDocList()
      .then(actions.loadLastOpenDoc)
  },
  (model, actions, error) => {
    dragDrop(document.body, function (files) {
      files.forEach(function (file) {
        actions.saveFile(file)
      })
    })
  }
]

const actions = {
  updateDocList: (model, data, actions, error) => {
    return { docList: data }
  },
  updateDoc: (model, data, actions, error) => {
    return { doc: data.doc, docId: data.docId }
  },
  toggleNewDocPopover: (model, data, actions, error) => {
    return { showNewDocPopOver: data }
  },
  saveFile: (model, data, actions, error) => {
    log('Saving file')
    api.saveFile(data, (err, res) => {
      if (err) console.log(err)
      console.log(res.data)
      // const updatedDoc = {
      //   doc: `${model.doc}\n\n![](${res.data})`,
      //   docId: model.docId
      // }

      const editorText = editorEl.querySelector('textarea')
      console.log(editorText)
      const mdImg = `![](${res.data})`

      insertAtCaret(editorText, mdImg)
    })
  },
  loadDocList: (model, data, actions, error) => {
    return new Promise((resolve, reject) => {
      api.getList((err, res) => {
        if (err) reject(err)
        log('Loaded doc list')
        actions.updateDocList(res.data)
        return resolve(res.data)
      })
    })
  },
  loadDoc: (model, data, actions, error) => {
    const docId = data || model.docList[0]
    return new Promise((resolve, reject) => {
      api.getDoc(docId, (err, res) => {
        if (err) reject(err)
        log('Loaded doc: ' + docId)
        actions.updateDoc({ doc: res.data, docId: docId })
        actions.updateEditor(model, actions, data, error)
        resolve(res)
      })
    })
  },
  updateEditor: (model, data, actions, error) => {
    log('Updating editor')
    editor.update(model.doc, editorEl)
  },
  saveDoc: (model, data, actions, error) => {
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
  newDoc: (model, data, actions, error) => {
    const docId = data
    log('Creating new doc: ' + docId)

    return actions.saveDoc({ docId: docId, doc: '' })
      .then(actions.loadDocList)
      .then(() => actions.loadDoc(docId))
      .then(() => actions.toggleNewDocPopover(false))
  },
  saveState: (model, data, actions, error) => {
    localStorage.setItem('tentState', JSON.stringify(model))
  },
  loadLastOpenDoc: (model, data, actions, error) => {
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

const _saveDoc = debounce((data, actions) => actions.saveDoc(data), 1000)

function Editor (model, actions) {
  editor = simpleEditor(model.doc, (updatedDoc) => {
    const data = {docId: model.docId, doc: updatedDoc}
    actions.updateDoc(data)
    _saveDoc(data, actions)
  })

  return html`<div onCreate=${(el) => {
      el.appendChild(editor.el)
      editorEl = el
    }}>
  </div>`
}

function view (model, actions) {
  let newDocName = ''

  return html`
    <main class=${styles.main}>
      <div class="${styles.newDoc} ${model.showNewDocPopOver ? styles.newDocVisible : ''}">
        <h4>Create new document</h4>
        <input type="text" placeholder="path/name" onchange=${(ev) => newDocName = ev.target.value}/>
        <button onclick=${() => actions.newDoc(newDocName)}>create</button>
      </div>

      <ul class=${styles.list}>
        <li><button onclick=${() => actions.toggleNewDocPopover(true)}>+ new</button></li>
        ${model.docList.map((docId) => {
          return html`<li class="${model.docId === docId ? styles.active : ''}">
            <button onclick=${(ev) => actions.loadDoc(docId)}>${docId}</button></li>`
        })}
      </ul>

      <div class="${styles.editor}">
        ${Editor(model, actions)}
      </div>

      <div class="${styles.preview}">
        ${markdownPreview(model.doc, { parseFrontmatter: true } )}
      </div>
    </main>
  `
}

const myApp = app({
  model: model,
  view: view,
  actions: actions,
  subscriptions: subscriptions
})
