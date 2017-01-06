const html = require('yo-yo')
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
  let el

  if (opts.parseFrontmatter) {
    el = html`<div class="${styles.mdBody}"></div>`
    const parsedDoc = fastmatter(doc)
    console.log(JSON.stringify(parsedDoc.attributes))
    el.innerHTML = md.render(parsedDoc.body)
  } else {
    doc = doc || ''
    el = html`<div class="${styles.mdBody}"></div>`
    el.innerHTML = md.render(doc)
  }

  return el
}

module.exports = renderMarkdown
