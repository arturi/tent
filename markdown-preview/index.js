const html = require('yo-yo')
const MarkdownIt = require('markdown-it')
const MarkdownItTaskLists = require('markdown-it-task-lists')
const css = require('sheetify')
const md = MarkdownIt({html: true, breaks: true})
  .use(MarkdownItTaskLists)

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
  
  :host img {
    max-width: 100%;
  }
`

function renderMarkdown (mdString) {
  mdString = mdString || ''
  const el = html`<div class="${cssPrefix}"></div>`
  el.innerHTML = md.render(mdString)
  return el
}

module.exports = renderMarkdown
