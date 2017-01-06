'use strict'

const html = require('yo-yo')
const map = require('lodash/map')
const css = require('sheetify')

module.exports = fieldEditor

const cssPrefix = css`
  :host * {
    font-family: -apple-system, BlinkMacSystemFont,
           'avenir next', avenir,
           helvetica, 'helvetica neue',
           ubuntu,
           roboto, noto,
           'segoe ui', arial,
           sans-serif;
    box-sizing: border-box;
  }

  :host strong {
    display: block;
    margin-bottom: 10px;
  }

  :host fieldgroup { 
   display: block;
   margin-bottom: 10px;
   padding: 10px;
  }

  :host fieldgroup fieldgroup  {
    border: 1px solid #E5E5E5;
    border-radius: 5px;
  }

  :host fieldset {
    border: 0;
    padding: 0;
    margin: 0;
    margin-bottom: 10px;
  }

  :host label {
    display: block;
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 1px;
    margin-bottom: 5px;
  }

  :host textarea {
    width: 100%;
    height: 150px;
    border: 1px solid black;
    font-size: 16px;
    line-height: 1.4;
    padding: 7px 5px;
  }

  :host input {
    font-size: 13px;
    line-height: 1.4;
    width: 100%;
    padding: 7px 5px;
    border: 1px solid black;
    display: block;
    margin-bottom: 5px;
  }

  :host .body {
    border-width: 2px;
    height: 400px;
    margin-bottom: 20px;
  }
`

function fieldEditor (doc, onChange) {
  doc = doc ? { data: doc.data, content: doc.content } : { data: {}, content: '' }
  onChange = onChange || function () {}

  const el = render(doc)
  return el

  function update (doc) {
    const newEl = render(doc)
    html.update(el, newEl)
  }

  function render (doc) {
    const data = doc.data
    const content = doc.content

    return html`
      <div class=${cssPrefix}>
        ${renderBodyEditor(content)}
        ${traverseFields(data)}
      </div>
    `
  }

  function setToValue (obj, value, path) {
    path = path.split('.');
    let i
    for (i = 0; i < path.length - 1; i++) {
      obj = obj[path[i]];
    }
    obj[path[i]] = value;
  }

  function renderGroup (key, value, type, newPath) {
    return html`
      <fieldgroup>
        <strong>${key}</strong>
        ${traverseFields(value, newPath)}
      </fieldgroup>
    `
  }

  function renderField (key, value, path) {
    return html`
      <fieldset>
        <label>${key}</label>
        ${key === 'description' 
          ? html`<textarea name="${key}" onchange=${(ev) => {
              updateField(ev.target.value, path)          
            }}>${value}</textarea>`
          : html`<input name="${key}" value="${value}" onkeyup=${(ev) => {
              updateField(ev.target.value, path)     
            }}>`
        }
      </fireldset>
    `

    function updateField (newValue, path) {
      setToValue(doc.data, newValue, path)
      onChange(doc)
      update(doc)
    }
  }

  function renderBodyEditor (content) {
    return html`<textarea class="body" onkeyup=${updateBody}>${content}</textarea>`

    function updateBody (e) {
      doc.content = e.target.value
      onChange(doc)
      update(doc)
    }
  }


  // recursive loop through metadata fields, if a field is an array or object,
  // run a traverse on it too
  function traverseFields (haystack, path) {
    return map(haystack, (value, key) => {
      path = path || ''
      const newPath = path ? path + '.' + key : key

      // if nested array or object, redner a group
      if (Array.isArray(value) || typeof value === 'object') {
        const type = Array.isArray(value) ? 'array' : 'object'
        return renderGroup(key, value, type, newPath)

      // otherwise redner a field
      } else {
        return renderField(key, value, newPath)
      }
    })
  }
}
