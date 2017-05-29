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

  componentDidMount () {
    this.props.onCreate(this.base)
  }

	render () {
		return html`<textarea class="simpleEditor-body" onInput=${this.props.onChange}>${this.props.doc}</textarea>`
	}
}

module.exports = Editor
