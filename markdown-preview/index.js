const { h, app } = require('hyperapp')
const hyperx = require('hyperx')
const html = hyperx(h)

const MarkdownIt = require('markdown-it')
const MarkdownItTaskLists = require('markdown-it-task-lists')
const md = MarkdownIt({
  html: true, breaks: true, linkify: true
})
md.use(MarkdownItTaskLists)
const css = require('template-css')
const fastmatter = require('fastmatter')

const styles = css`
  .mdBody {
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
  }

  .mdBody img {
    max-width: 100%;
  }

  .mdBody code {
    padding: 0.2em 0.3em;
    font-family: inherit;
    font-size: 90%;
    border-radius: 3px;
    background-color: rgba(27,31,35,0.05);
  }

  .mdBody hr {
    border: 0;
    border-top: 1px solid #000;
  }

  .mdBody .task-list {
    margin: 0;
    padding: 0;
  }

  .mdBody .task-list-item {
    list-style: none;
    margin: 0;
    padding: 0;
  }
`

function renderMarkdown (doc, opts) {
  const defaultOpts = {
    parseFrontmatter: false
  }

  opts = Object.assign({}, defaultOpts, opts)

  let element

  if (opts.parseFrontmatter) {
    const parsedDoc = fastmatter(doc)
    const attributes = parsedDoc.attributes || {}
    const title = attributes.title ? `<h1>${parsedDoc.attributes.title}</h1>` : ''

    element = html`<div class="mdBody" onUpdate=${(el) => {
      el.innerHTML = title + md.render(parsedDoc.body)
    }}></div>`
  } else {
    doc = doc || ''
    element = html`<div class="mdBody" onUpdate=${(el) => {
      el.innerHTML = el.innerHTML = md.render(doc)
    }}></div>`
  }

  return element
}

module.exports = renderMarkdown
