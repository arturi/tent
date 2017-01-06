// const fieldEditor = require('./field-editor')
const simpleEditor = require('./simple-editor')
const markdownPreview = require('./markdown-preview')
const api = require('./client-api.js')
// const matter = require('gray-matter')
const csjs = require('csjs')
const html = require('yo-yo')

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
    // width: 45%;
    flex: 1;
    height: 100vh;
  }

  .preview {
    // width: 45%;
    flex: 1;
    height: 100vh;
    overflow-y: auto;
  }
`

let state = {
  doc: '',
  docId: '',
  docList: [],
  showNewDoc: false
}
let tree = ''

function setState (statePatch) {
  state = Object.assign({}, state, statePatch)
  update()
}

function update () {
  const newTree = render(state)
  html.update(tree, newTree)
}

function app () {
  tree = render(state)
  document.body.appendChild(tree)

  api.getList((err, res) => {
    if (err) console.log(err)
    console.log('loaded doc list')
    setState({ docList: res.data })

    api.getDoc(state.docList[0], (err, res) => {
      if (err) console.log(err)
      console.log('loaded first doc')
      setState({ doc: res.data, docId: state.docList[0] })
    })
  })
}

function render (state) {
  const { doc, docId, docList } = state

  return html`<main class=${styles.main}>
    ${state.showNewDoc
      ? html`<div>
        <h4>create new document</h4>
        <input type="text" placeholder="path/name" onchange=${(ev) => {
          setState({newDocName: ev.target.value})
        }}/>
        <button onclick=${() => {
          api.saveDoc(state.newDocName, '', (err, res) => {
            console.log(res.status)

            api.getList((err, res) => {
              if (err) console.log(err)
              console.log('loaded doc list')
              setState({ docList: res.data })
            })

            api.getDoc(state.newDocName, (err, res) => {
              setState({ doc: res.data, docId: state.newDocName })
            })
          })
        }}>create</button>
      </div>`
      : null
    }
    <ul class=${styles.list}>
      <li>
        <button style="color: red;" onclick=${() => {
          setState({showNewDoc: !state.showNewDoc})
        }}>+ new</button>
      </li>

      ${docList.map((docId) => {
        return html`<li class="${state.docId === docId ? styles.active : ''}">
          <button onclick=${(ev) => {
            api.getDoc(docId, (err, res) => {
              setState({ doc: res.data, docId: docId })
            })
          }}>${docId}</button></li>`
      })}
    </ul>
    <div class="${styles.editor}">
      ${simpleEditor(doc, (updatedDoc) => {
        setState({doc: updatedDoc})
        api.saveDoc(docId, updatedDoc, (err, res) => {
          console.log(res.status)
        })
      })}
    </div>
    <div class="${styles.preview}">
      ${markdownPreview(doc, { parseFrontmatter: true } )}
    </div>
  </main>`
}

app()

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
