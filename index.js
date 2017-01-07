// const fieldEditor = require('./field-editor')
const simpleEditor = require('./simple-editor')
const markdownPreview = require('./markdown-preview')
const api = require('./client-api.js')
const csjs = require('csjs')
const html = require('choo/html')
const choo = require('choo')

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
const app = choo()

app.model({
  state: {
    doc: '',
    docId: '',
    docList: [],
    showNewDoc: false
  },
  subscriptions: {
    start: (send, done) => {
      console.log('start like an animal')
      send('loadDocList', () => {
        send('loadDoc', null, done)
      })
    }
  },
  effects: {
    loadDocList: (state, data, send, done) => {
      api.getList((err, res) => {
        if (err) console.log(err)
        console.log('loaded doc list')
        send('updateDocList', res.data, done)
      })
    },
    loadDoc: (state, data, send, done) => {
      const docId = data || state.docList[0]
      api.getDoc(docId, (err, res) => {
        if (err) console.log(err)
        console.log('loaded doc')
        send('updateDoc', { doc: res.data, docId: docId }, done)
      })
    },
    saveDoc: (state, data, send, done) => {
      send('updateDoc', { docId: data.docId, doc: data.updatedDoc }, () => {
        api.saveDoc(data.docId, data.updatedDoc, (err, res) => {
          console.log(res.status)
          done()
        })
      })
    },
    newDoc: (state, data, send, done) => {
      const docId = data
      console.log('new doc', docId)
      send('saveDoc', { docId: docId, updatedDoc: '' }, () => {
        send('loadDocList', () => {
          send('loadDoc', docId, () => {
            send('showNewDoc')
          })
        })
      })
    }
  },
  reducers: {
    updateDocList: (state, data) => {
      return { docList: data }
    },
    updateDoc: (state, data) => {
      return { doc: data.doc, docId: data.docId }
    },
    showNewDoc: (state, data) => {
      return { showNewDoc: !state.showNewDoc }
    }
  }
})

function mainView (state, prev, send) {
  // const { doc, docList } = state

  let newDocName = ''

  return html`
    <main class=${styles.main}>
      ${state.showNewDoc
        ? html`<div>
          <h4>create new document</h4>
          <input type="text" placeholder="path/name" onchange=${(ev) => newDocName = ev.target.value}/>
          <button onclick=${() => send('newDoc', newDocName)}>create</button>
        </div>`
        : null
      }
      <ul class=${styles.list}>
        <li>
          <button style="color: red;" onclick=${() => send('showNewDoc')}>+ new</button>
        </li>

        ${state.docList.map((docId) => {
          return html`<li class="${state.docId === docId ? styles.active : ''}">
            <button onclick=${(ev) => send('loadDoc', docId)}>${docId}</button></li>`
        })}
      </ul>
      <div class="${styles.editor}">
        ${simpleEditor(state.doc, (updatedDoc) => {
          send('saveDoc', {docId: state.docId, updatedDoc: updatedDoc})
        })}
      </div>
      <div class="${styles.preview}">
        ${markdownPreview(state.doc, { parseFrontmatter: true } )}
      </div>
    </main>
  `
}

app.router(['/', mainView])

const tree = app.start()
document.body.appendChild(tree)

// return html`
//   <main>
//     ${Object.keys(attributes).map((attribute) => {
//       if (attribute === 'blocks') {
//         const blocks = attributes[attribute]
//         return blocks.map((block, index) => {
//           return renderBlock(block, index)
//         })
//       } else {
//         // console.log(attribute)
//         return renderField(attribute, attributes[attribute])
//       }
//     })}
//   </main>
// `

// function renderBlock (block, blockIndex) {
//   // console.log(block)
//   if (!block.type) return
//   return html`
//     <fieldgroup class="block">
//       <strong>${block.type}</strong>
//       ${Object.keys(block).map((field, fieldIndex) => {
//         if (field === 'type') return
//         const key = field
//         const value = block[field]
//         const path = { blockIndex, fieldIndex }
//         return renderField(key, value, path)
//       })}
//     </fieldgroup>
//   `
// }

// function renderField (key, value, source) {
//   return html`
//     <fieldset>
//       <label>${key}</label>

//       ${key === 'description'
//         ? html`<textarea name="${key}" onchange=${(ev) => {
//             updateField(ev.target.value)
//           }}>${value}</textarea>`
//         : html`<input name="${key}" value="${value}" onchange=${(ev) => {
//             updateField(ev.target.value)
//           }}>`
//       }
//     </fireldset>
//   `

//   function updateField (newValue) {
//     state.blocks[source.blockIndex][key] = newValue
//     update(state)
//   }
// }
