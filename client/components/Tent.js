const { h, Component, render } = require('preact')
const hyperx = require('hyperx')
const html = hyperx(h)
const css = require('template-css')

const Editor = require('./Editor')
const Preview = require('./Preview')

const styles = css`
  html {
    box-sizing: border-box;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  body, html {
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont,
           'avenir next', avenir,
           helvetica, 'helvetica neue',
           ubuntu,
           roboto, noto,
           'segoe ui', arial,
           sans-serif;
  }

  button {
    background: none;
    border: 0;
    font-family: inherit;
    font-size: inherit;
    padding: 0;
    margin: 0;
  }

  .tent-newDoc {
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

  .tent-newDoc.is-visible {
    display: block;
  }

  .tent-main {
    display: flex;
    justify-content: center;
    height: 100vh;
    overflow: hidden;
    position: relative;
  }

  .drag .tent-main:before {
    content: '';
    background-color: rgba(68, 68, 68, 0.6);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 5px dashed #ccc;
  }

  .tent-list {
    width: 150px;
    height: 100vh;
    list-style: none;
    padding: 0;
    margin: 0;
    border-right: 1px solid black;
    overflow-y: auto;
  }

  .tent-list li {
    margin: 0;
    padding: 0;
  }

  .tent-list li:hover button,
  .active button {
    background: black;
    color: white;
  }

  .tent-list button {
    cursor: pointer;
    padding: 10px 6px;
    border-bottom: 1px solid black;
    width: 100%;
    text-align: left;
    outline: none;
    font-size: 12px;
    border-radius: 0;
  }

  .tent-panels {
    flex: 1;
  }

  .tent-editor {
    flex: 1;
    height: 100vh;
  }

  .tent-preview {
    flex: 1;
    height: 100vh;
    overflow-y: auto;
  }
`

class Tent extends Component {
	render (props) {
    const actions = props.actions
    const state = props.state
    let newDocName = ''

    function onEditorChange (ev) {
      const data = {docId: state.docId, doc: ev.target.value}
      actions.updateDoc(data)
      actions._saveDoc(data, actions)
    }

    function onEditorCreate (el) {
       actions.setEditorEl(el)
     }

    return html`
      <main class="tent-main">
        <div class="tent-newDoc ${state.showNewDocPopOver ? 'is-visible' : ''}">
          <h4>Create new document</h4>
          <input type="text" placeholder="path/name" onChange=${(ev) => newDocName = ev.target.value}/>
          <button onClick=${() => actions.newDoc(newDocName)}>create</button>
        </div>

        <ul class="tent-list">
          <li><button onclick=${() => actions.toggleNewDocPopover(true)}>+ new</button></li>
          ${state.docList.map((docId) => {
            return html`<li class="${state.docId === docId ? 'active' : ''}">
              <button onclick=${(ev) => actions.loadDoc(docId)}>${docId}</button>
            </li>`
          })}
        </ul>

        <div class="tent-editor">
          ${h(Editor, {
            doc: state.doc, 
            onChange: onEditorChange, 
            onCreate: onEditorCreate,
            appendUploadResult: actions.appendUploadResult
          })}
        </div>

        <div class="tent-preview">
          ${h(Preview, {
            doc: state.doc
          })}
        </div>
      </main>
    `
	}
}

module.exports = Tent
