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
    padding: 0.2em 0.3em;
    font-family: inherit;
    font-size: 90%;
    border-radius: 3px;
    background-color: rgba(27,31,35,0.05);
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

  .tent-mdBody .slider {
    height: 400px;
  }

  .tent-mdBody .slider img {
    display: block;
    height: 400px;
  }
`

function initSlider () {
  var flkty = new Flickity('.tent-mdBody .slider', {
    prevNextButtons: false,
    selectedAttraction: 0.2,
    friction: 0.8,
    imagesLoaded: true,
    setGallerySize: false,
    percentPosition: false
  })
  return flkty
}

function renderMarkdown (doc, opts) {
  const defaultOpts = {
    parseFrontmatter: false
  }

  opts = Object.assign({}, defaultOpts, opts)
  doc = doc || ''
  let element

  if (opts.parseFrontmatter) {
    const parsedDoc = fastmatter(doc)
    const attributes = parsedDoc.attributes || {}
    const title = attributes.title ? `<h1>${parsedDoc.attributes.title}</h1>` : ''

    element = html`<div class="tent-mdBody" onUpdate=${(el) => {
      el.innerHTML = title + md.render(parsedDoc.body)
      initSlider()
    }}></div>`
  } else {
    element = html`<div class="tent-mdBody" onUpdate=${(el) => {
      el.innerHTML = md.render(doc)
      initSlider()
    }}></div>`
  }

  return element
}

module.exports = renderMarkdown
