const { h, Component } = require('preact')
const hyperx = require('hyperx')
const html = hyperx(h)
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

class Editor extends Component {
  constructor (props) {
    super(props)
    this.state = props.state
  }

	render () {
    const state = this.props.state
		return html`<div style="height: 100%;">
      <textarea class="simpleEditor-body" onKeyUp=${this.props.onChange}>${this.state.doc}</textarea>
    </div>`
	}
}

module.exports = Editor
