const frontMatter = require('front-matter')
const yo = require('yo-yo')
const MarkdownIt = require('markdown-it')
const md = new MarkdownIt();

const page = `---
title: It’s my page
date: 2016-06-21 19:59:00 Z
blocks:
- type: free-content
  fields:
  - id: content
    content: Hello, *this* is it!
- type: place
  fields:
  - id: title
    content: Cherny coop
  - id: location
    content: Pokrovka
  - id: description
    content: |-
      We'll ignore the *state* stuff for now, since it's [not important](http://ya.ru) for this simple plugin. The rest should be fairly straightforward.
      
      ### yo!

      The next thing this method does is create **an instance** of the CompositeDisposable class so it can register all the commands that can be called from the plugin so other plugins could subscribe to these events.

      Yes.
- type: place
  fields:
  - id: title
    content: Sosna and Lipa
  - id: location
    content: Clean Lake
  - id: description
    content: |-
      Yo, like *drink* and **sign**:
      - Russian beer
      - Norwegian beer
- type: wide-img
  fields:
  - id: img
    type: img
    content: http://ya.ru
---

# Right.

![IMG_9078.jpg](/uploads/IMG_9078.jpg)`

const result = frontMatter(page)

function render (state) {
  const places = state.attributes.blocks.filter((block) => {
    return block.type === 'place'
  })

  return yo`
    <div>
      ${places.map((place) => {
        return yo`<article class="place">
          ${place.fields.map((field) => {
            return fieldEl(field)
          })}
        </article>`
      })}
    </div>
  `
}

function fieldEl (field) {
  if (field.id === 'description') { 
    const mdElement = yo`<div class="markdown"></div>`
    mdElement.innerHTML = md.render(field.content)
    return mdElement
  }

  if (field.id === 'title') {
    return yo`<h2>${field.content}</h2>`
  }

  if (field.id === 'location') {
    return yo`<strong>${field.content}</strong>`
  }
}

const el = render(result)
document.body.appendChild(el)
