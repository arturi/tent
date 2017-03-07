const { h, app } = require('hyperapp')
const hyperx = require('hyperx')
const html = hyperx(h)

const MarkdownIt = require('markdown-it')
const MarkdownItTaskLists = require('markdown-it-task-lists')
const md = MarkdownIt({html: true, breaks: true})
  .use(MarkdownItTaskLists)
const csjs = require('csjs')
const fastmatter = require('fastmatter')

const styles = csjs`
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

    element = html`<div class="${styles.mdBody}" onUpdate=${(el) => {
      el.innerHTML = title + md.render(parsedDoc.body)
    }}></div>`
  } else {
    doc = doc || ''
    element = html`<div class="${styles.mdBody}" onUpdate=${(el) => {
      el.innerHTML = el.innerHTML = md.render(doc)
    }}></div>`
  }

  return element
}

module.exports = renderMarkdown
