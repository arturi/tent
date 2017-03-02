// const html = require('yo-yo')
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

    element = html`<div class="${styles.mdBody}" onupdate=${(el) => {
      el.innerHTML = title + md.render(parsedDoc.body)
    }}></div>`
  } else {
    doc = doc || ''
    element = html`<div class="${styles.mdBody}" oncreate=${(el) => {
      el.innerHTML = el.innerHTML = md.render(doc)
    }}>bla</div>`
  }

  return element
}

module.exports = renderMarkdown
