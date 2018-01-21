const { h, Component, render } = require('preact')
const hyperx = require('hyperx')
const html = hyperx(h)
const css = require('template-css')
const MarkdownIt = require('markdown-it')
const MarkdownItTaskLists = require('markdown-it-task-lists')
const fastmatter = require('fastmatter')

const md = MarkdownIt({
  html: true, breaks: true, linkify: true
})
md.use(MarkdownItTaskLists)

const styles = css`
.tent-mdBody {
    font-family: -apple-system, BlinkMacSystemFont,
           'avenir next', avenir,
           helvetica, 'helvetica neue',
           ubuntu,
           roboto, noto,
           'segoe ui', arial,
           sans-serif;
    box-sizing: border-box;
    padding: 7px 15px;
    line-height: 1.5;
    word-wrap: break-word;
  }

  .tent-mdBody h1 {
    font-size: 2em;
    border-bottom: 1px solid #eaecef;
  }

  .tent-mdBody h2 {
    font-size: 1.5em;
    border-bottom: 1px solid #eaecef;
  }

  .tent-mdBody h3 {
    font-size: 1.25em;
  }

  .tent-mdBody a {
    text-decoration: none;
  }

    .tent-mdBody a:hover {
      text-decoration: underline;
    }

  .tent-mdBody img {
    max-width: 100%;
    height: auto;
  }

  .tent-mdBody .icon {
    fill: currentColor;
    width: 1em;
    height: 1em;
    vertical-align: text-bottom;
    overflow: hidden;
  }

  .tent-mdBody code {
    display: inline-block;
    padding: 0.3em 0.6em;
    font-family: inherit;
    font-size: 90%;
    border-radius: 3px;
    background-color: rgba(27,31,35,0.05);
    max-width: 100%;
    overflow-x: auto;
  }

  .tent-mdBody hr {
    border: 0;
    border-top: 1px solid #000;
  }

  .tent-mdBody figure {
    margin: 0;
    padding: 0;
  }

  .tent-mdBody .task-list {
    margin: 0;
    padding: 0;
  }

  .tent-mdBody .task-list-item {
    list-style: none;
    margin: 0;
    padding: 0;
  }
`

class Preview extends Component {
	render () {
    let element

    let opts = this.props.opts || {}

    if (opts.parseFrontmatter) {
      const parsedDoc = fastmatter(this.props.doc)
      const attributes = parsedDoc.attributes || {}
      const title = attributes.title ? `<h1>${parsedDoc.attributes.title}</h1>` : ''

      element = html`<div class="tent-mdBody" dangerouslySetInnerHTML={{ __html: title + md.render(parsedDoc.body) }}></div>`
    } else {
      element = html`<div class="tent-mdBody" dangerouslySetInnerHTML=${{ __html: md.render(this.props.doc) }}></div>`
    }

		return element
	}
}

module.exports = Preview
