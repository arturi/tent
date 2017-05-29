const Editor = require('./Editor')
const Preview = require('./Preview')
const { h, Component, render } = require('preact')
const css = require('template-css')
const hyperx = require('hyperx')
const html = hyperx(h)

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
          ${h(Editor, {doc: state.doc, onChange: onEditorChange, onCreate: onEditorCreate})}
        </div>

        <div class="tent-preview">
          ${h(Preview, {doc: state.doc})}
        </div>
      </main>
    `
	}
}

module.exports = Tent
