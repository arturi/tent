const html = require('yo-yo')
const css = require('template-css')

const styles = css`
  .simpleEditor-body {
    border: 0;
    border-right: 1px solid black;
    margin-bottom: 20px;
    width: 100%;
    height: 100%;
    font-size: 16px;
    line-height: 1.7;
    padding: 7px 15px;
  }

  .simpleEditor-body:focus {
    outline: none;
  }
`

module.exports = simpleEditor

function simpleEditor (doc, onChange) {
  doc = doc || ''
  onChange = onChange || function () {}

  const el = render(doc)

  function update (doc, elem) {
    const newEl = render(doc)

    // If `elem` is passed in, update that,
    // if not, update the one `yo-yo keeps reference to.
    // This is needed for yo-yo element to work with virtual-dom
    if (elem) {
      return html.update(elem, newEl)
    }

    html.update(el, newEl)
  }

  function render (content) {
    return html`<div style="height: 100%;">
      <textarea class="simpleEditor-body" oninput=${updateBody}>${content}</textarea>
    </div>`

    function updateBody (e) {
      doc = e.target.value
      onChange(doc)
      // update(doc)
    }
  }

  return { el, update }
}
