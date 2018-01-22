const { h, Component } = require('preact')
const hyperx = require('hyperx')
const html = hyperx(h)
const css = require('template-css')
const Uppy = require('uppy/lib/core')
const Dashboard = require('uppy/lib/plugins/Dashboard')
const Webcam = require('uppy/lib/plugins/Webcam')
const XHRUpload = require('uppy/lib/plugins/XHRUpload')
const Instagram = require('uppy/lib/plugins/Instagram')

const styles = css`
  .simpleEditor-wrap {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-right: 1px solid black;
  }

  .simpleEditor-body {
    border: 0;
    width: 100%;
    height: 100%;
    font-size: 16px;
    line-height: 1.7;
    font-family: -apple-system, BlinkMacSystemFont,
      'avenir next', avenir,
      helvetica, 'helvetica neue',
      ubuntu,
      roboto, noto,
      'segoe ui', arial,
      sans-serif;
    padding: 8px;
    flex: 1;
  }

  .simpleEditor-body:focus {
    outline: none;
  }

  .simpleEditor-toolbar {
    height: 30px;
    font-size: 12px;
    line-height: 30px;
    border-top: 1px dashed black;
    text-align: center;
    background-color: #fafbfc;
    color: #586069;
  }

  .simpleEditor-toolbarAction {
    color: blue;
    cursor: pointer;
  }
`

class Editor extends Component {
  constructor (props) {
    super(props)

    this.openUppyModal = this.openUppyModal.bind(this)
    this.closeUppyModal = this.closeUppyModal.bind(this)
  }

  componentDidMount () {
    const { onCreate,  appendUploadResult } = this.props
    onCreate(this.editorEl)

    this.uppy = Uppy({ debug: true })
    this.uppy.use(Dashboard, {
      closeModalOnClickOutside: true,
      hideProgressAfterFinish: true
    })
    this.uppy.use(Webcam, { target: Dashboard })
    this.uppy.use(Instagram, { target: Dashboard, host: 'http://localhost:3020' })
    this.uppy.use(XHRUpload, { endpoint: 'http://localhost:3360/api/files/' })
    this.uppy.run()

    this.uppy.on('upload-success', (fileId, resp, uploadURL) => {
      appendUploadResult(resp)
      this.closeUppyModal()
      this.uppy.reset()
    })
  }

  componentWillUnmount () {
    this.uppy.close()
  }

  openUppyModal () {
    this.uppy.getPlugin('Dashboard').openModal()
  }

  closeUppyModal () {
    this.uppy.getPlugin('Dashboard').closeModal()
  }

	render () {
    return html`
      <div class="simpleEditor-wrap">
        <textarea class="simpleEditor-body" ref="${editorEl => { this.editorEl = editorEl } }" oninput="${this.props.onChange}" value="${this.props.doc}"></textarea>
        <div class="simpleEditor-toolbar">
          Drag + drop to upload or <button class="simpleEditor-toolbarAction" type="button" onclick=${this.openUppyModal}>press to select files</button>
        </div>
      </div>
    `
	}
}

module.exports = Editor
