const html = require('yo-yo')
const csjs = require('csjs')

const styles = csjs`
  fieldgroup {
    display: block;
    margin-bottom: 10px;
    padding: 10px;
  }

  .body {
    border: 0;
    border-right: 1px solid black;
    margin-bottom: 20px;
    width: 100%;
    height: 100%;
    font-size: 16px;
    line-height: 1.7;
    padding: 7px 15px;
  }

  .body:focus {
    outline: none;
  }
`

module.exports = simpleEditor

function simpleEditor (doc, onChange) {
  // doc = doc ? { data: doc.data, content: doc.content } : { data: {}, content: '' }
  doc = doc || ''
  onChange = onChange || function () {}

  const el = render(doc)
  return el

  function update (doc) {
    const newEl = render(doc)
    html.update(el, newEl)
  }

  function render (doc) {
    // const data = doc.data
    const content = doc

    return html`
      <div>
        ${renderBodyEditor(content)}
      </div>
    `
  }

  function renderBodyEditor (content) {
    return html`<textarea class="${styles.body}" onkeyup=${updateBody}>${content}</textarea>`

    function updateBody (e) {
      doc = e.target.value
      onChange(doc)
      update(doc)
    }
  }
}
