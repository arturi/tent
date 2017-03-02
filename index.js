// const fieldEditor = require('./field-editor')
const simpleEditor = require('./simple-editor')
const markdownPreview = require('./markdown-preview')
const api = require('./client-api.js')
const debounce = require('lodash.debounce')
// const throttle = require('lodash/throttle')
const csjs = require('csjs')
// const html = require('choo/html')
// const choo = require('choo')

const { h, app } = require('hyperapp')
const hyperx = require('hyperx')
const html = hyperx(h)

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
// const app = choo()

const model = {
  doc: '',
  docId: '',
  docList: [],
  showNewDoc: false
}

const subscriptions = {
  initialize: (model, actions, error) => {
    console.log('start like an animal')

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
        console.log('loaded doc list')
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
        console.log('loaded doc')
        actions.updateDoc({ doc: res.data, docId: docId })
        resolve(res)
      })
    })
  },
  saveDoc: (model, actions, data, error) => {
    console.log('saving...')
    console.log(data.doc)
    return new Promise(function (resolve, reject) {
      api.saveDoc(data.docId, data.doc, (err, res) => {
        if (err) reject(err)
        console.log(res)
        resolve(res)
      })
    })
  },
  newDoc: (model, actions, data, error) => {
    const docId = data
    console.log('new doc', docId)

    return actions.saveDoc({ docId: docId, doc: '' })
      .then(actions.loadDocList)
      .then(() => actions.loadDoc(docId))
      .then(actions.showNewDoc)

    // actions.saveDoc({ docId: docId, doc: '' }), () => {
    //   actions.loadDocList', () => {
    //     actions.loadDoc', docId, () => {
    //       send('showNewDoc', done)
    //     })
    //   })
    // }
  },
  saveState: (model, actions, data, error) => {
    localStorage.setItem('tentState', JSON.stringify(model))
  },
  loadLastOpenDoc: (model, actions, data, error) => {
    const savedState = JSON.parse(localStorage.getItem('tentState'))
    console.log('yes, some saved state: ', savedState)
    if (savedState && savedState.docId) {
      return actions.loadDoc(savedState.docId)
    }
    return actions.loadDoc()
  }
}

function saveDoc (actions, data) {
  // console.log(data)
  actions.saveDoc(data)
  // actions.updateDoc(data)
}
const debouncedSaveDoc = debounce(saveDoc, 1000)

function view (model, actions) {
  let newDocName = ''

  const editor = simpleEditor(model.doc, (updatedDoc) => {
    const data = {docId: model.docId, doc: updatedDoc}
    actions.updateDoc(data)
    // actions.saveDoc(data)
    // saveDoc(actions, data)
  })

  return html`
    <main class=${styles.main}>
      ${model.showNewDoc
        ? html`<div>
          <h4>create new document</h4>
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
        <div oncreate=${(el) => {
          // console.log('update!!!')
          // const editor = simpleEditor(model.doc, (updatedDoc) => {
          //   debouncedSaveAndUpdateDoc(actions, {docId: model.docId, doc: updatedDoc})
          // })
          // console.log(editor)
          // el.parentNode.replaceChild(editor, el)
          el.appendChild(editor.el)
        }} onupdate=${() => editor.update(model.doc)}></div>
      </div>
      <div class="${styles.preview}">
        ${markdownPreview(model.doc, { parseFrontmatter: true } )}
      </div>
    </main>
  `
}

const myApp = app({ model: model, view: view, reducers: reducers, effects: effects, subscriptions: subscriptions})

// function editMe (content) {
//   const editorEl = simpleEditor(content, (updatedDoc) => {
//     debouncedSaveAndUpdateDoc(actions, {docId: model.docId, updatedDoc: updatedDoc})
//   })
//   document.body.appendChild(editorEl)
// }
