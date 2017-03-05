const simpleEditor = require('./simple-editor')
const markdownPreview = require('./markdown-preview')
const api = require('./client-api.js')
const debounce = require('lodash.debounce')
const csjs = require('csjs')

const { h, app } = require('hyperapp')
const hyperx = require('hyperx')
const html = hyperx(h)

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
  showNewDoc: false
}

const subscriptions = {
  initialize: (model, actions, error) => {
    // console.log('Start like an animal!')
    log('Start like an animal!')

    window.onbeforeunload = (ev) => {
      actions.saveState()
    }

    actions.loadDocList()
      .then(actions.loadLastOpenDoc)
  }
}

const reducers = {
  updateDocList: (model, data, params) => {
    return { docList: data }
  },
  updateDoc: (model, data, params) => {
    return { doc: data.doc, docId: data.docId }
  },
  showNewDoc: (model, data, params) => {
    return { showNewDoc: !state.showNewDoc }
  }
}

const effects = {
  loadDocList: (model, actions, data, error) => {
    return new Promise(function (resolve, reject) {
      api.getList((err, res) => {
        if (err) reject(err)
        // console.log('Loaded doc list')
        log('Loaded doc list')
        actions.updateDocList(res.data)
        return resolve(res.data)
      })
    })
  },
  loadDoc: (model, actions, data, error) => {
    const docId = data || model.docList[0]
    return new Promise(function (resolve, reject) {
      api.getDoc(docId, (err, res) => {
        if (err) reject(err)
        // console.log('Loaded doc:', docId)
        log('Loaded doc: ' + docId)
        actions.updateDoc({ doc: res.data, docId: docId })
        actions.updateEditor(model, actions, data, error)
        resolve(res)
      })
    })
  },
  updateEditor: (model, actions, data, error) => {
    log('Updating editor')
    // console.log('Updating editor')
    editor.update(model.doc, editorEl)
  },
  saveDoc: (model, actions, data, error) => {
    // console.log('Saving:', data.docId)
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
  newDoc: (model, actions, data, error) => {
    const docId = data
    // console.log('Creating new doc:', docId)
    log('Creating new doc: ' + docId)

    return actions.saveDoc({ docId: docId, doc: '' })
      .then(actions.loadDocList)
      .then(() => actions.loadDoc(docId))
      .then(actions.showNewDoc)
  },
  saveState: (model, actions, data, error) => {
    localStorage.setItem('tentState', JSON.stringify(model))
  },
  loadLastOpenDoc: (model, actions, data, error) => {
    const savedStateString = localStorage.getItem('tentState')
    const savedState = JSON.parse(savedStateString)
    let docId
    if (savedState && savedState.docId) {
      // console.log('Found some saved state:', savedState)
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

  return html`<div oncreate=${(el) => {
      el.appendChild(editor.el)
      editorEl = el
    }}>
  </div>`
}

function view (model, actions) {
  let newDocName = ''

  return html`
    <main class=${styles.main}>
      ${model.showNewDoc
        ? html`<div>
          <h4>Create new document</h4>
          <input type="text" placeholder="path/name" onchange=${(ev) => newDocName = ev.target.value}/>
          <button onclick=${() => actions.newDoc(newDocName)}>create</button>
        </div>`
        : null
      }
      <ul class=${styles.list}>
        <li><button onclick=${() => actions.showNewDoc()}>+ new</button></li>

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
  reducers: reducers,
  effects: effects,
  subscriptions: subscriptions
})
