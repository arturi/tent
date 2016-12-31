const fieldEditor = require('./field-editor')
const markdownPreview = require('./markdown-preview')
const admin = require('./admin-api.js')
const matter = require('gray-matter')
const html = require('yo-yo')

let state = {
  doc: '',
  docId: '',
  docList: []
}
let tree = ''

function save (id, doc) {
  const docAsYaml = matter.stringify(doc.content, doc.data)
  admin.saveDoc(id, docAsYaml)
}

function loadDocList (done) {
  var request = new XMLHttpRequest()
  request.open('GET', '/documents/list/')
  request.addEventListener('load', function () {
    const docList = JSON.parse(this.responseText)
    setState({docList: docList})
    done(null)
  })
  request.send()
}

function setState (statePatch) {
  state = Object.assign({}, state, statePatch)
  update()
}

function start () {
  tree = render(state)
  document.body.appendChild(tree)

  loadDocList((err) => {
    if (err) console.log(err)

    admin.selectDoc(state.docList[0], (err, file) => {
      if (err) console.log(err)

      const doc = matter(file)
      setState({doc: doc, docId: state.docList[0]})
    })
  })
}

function update () {
  const newTree = render(state)
  html.update(tree, newTree)
}

function render (state) {
  const doc = state.doc
  const docId = state.docId

  return html`<main style="display: flex; align-items: top; justify-content: center;">
    <div style="width: 50%; height: 95vh; overflow-y: scroll; padding-right: 10px;">
      ${fieldEditor(doc, (updatedDoc) => {
        state.doc = updatedDoc
        update()
        save(docId, updatedDoc)
      })}
    </div>
    <div style="width: 50%; height: 95vh; overflow-y: scroll; padding-left: 15px;">
      ${markdownPreview(doc.content)}
    </div>
  </main>`
}

start()

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
