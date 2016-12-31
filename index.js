const yo = require('yo-yo')

const blocks = {
  "free-content": {
    "name": "Free content",
    "fields": [
      { "id": "content", "label": "Content", "type": "markdown" }
    ]
  },
  "place": {
    "name": "Place",
    "fields": [
      { "id": "title", "label": "Title", "type": "text" },
      { "id": "pictures", "label": "Pictures", "type": "text" },
      { "id": "desc", "label": "Description", "type": "textarea" },
      { "id": "type", "label": "Type of place", "type": "select", "data": ['large', 'small', 'medium'] }
    ]
  }
}
  
const blocksToDisplay = ['free-content', 'place', 'place', 'free-content']

const data = {}
// window.data = data
  
function admin (blocks, data) {  
  return yo`
    <span>
      <style>
        * {font-family: sans-serif; box-sizing: border-box;}
  
        .block {
          background-color: #f1f1f1;
          padding: 15px;
          margin-bottom: 15px;
        }
  
        fieldgroup { 
         display: block;
         margin-bottom: 20px;
        }
  
        label {
          display: block;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }
  
        textarea {
          width: 300px;
          height: 80px;
          border: 1px solid black;
        }
  
        input {
          padding: 4px 5px;
          border: 1px solid black;
        }
      </style>
      <form onsubmit=${(ev) => {
        ev.preventDefault()
      }}>
        ${blocksToDisplay.map((block) => {
          const blockId = block + Date.now()
          return yo`
  					<div class="block">
              <h3>${blocks[block].name}</h3>
  						${blocks[block].fields.map((field) => {
                return fieldEl(field, blockId)
              })}
  					</div>
  				`
        })}
        <textarea>${data}</textarea>
        <button type="submit" onclick=${() => {
          console.log(JSON.stringify(data))
        }}>Save</button>
      </form>
    </span>
  `
}

function saveField (block, field, value) {
  data[block][field.id].value = value
  // yo.update(admin(blocks, data), el)
}
  
function fieldEl (field, block) {
  data[block] = data[block] || {}
  data[block][field.id] = field

  switch (field.type) {
    case 'text':
      return yo`
  			<fieldgroup>
          <label>${field.label}</label>
  			  <input type="text" data-block="${block}" name="${block}_${field.id}" placeholder="${field.label}" onkeyup=${ev => saveField(block, field, ev.target.value)}>
        </fieldgroup>
  		`
    case 'textarea':
      return yo`
        <fieldgroup>
          <label>${field.label}</label>
          <textarea name="${field.id}" onkeyup=${ev => saveField(block, field, ev.target.value)}></textarea>
        </fieldgroup>
      `
    case 'markdown':
      return yo`
        <fieldgroup>
          <label>${field.label}</label>
          <textarea name="${field.id}" onkeyup=${ev => saveField(block, field, ev.target.value)}></textarea>
        </fieldgroup>
      `
    case 'select':
      return yo`
        <fieldgroup>
          <select onchange=${ev => saveField(block, field, ev.target.value)}>
           ${field.data.map((item) => {
             return yo`<option>${item}</option>`
           })}
          </select>
        </fieldgroup>
      `
    default:
      return yo`
        <fieldgroup>
          <input name="${field.id}" placeholder="${field.label}">
        </fieldgroup>
      `
  }
}

const el = admin(blocks)
document.body.appendChild(el)
