const fs = require('fs-extra')
const matter = require('gray-matter')

const fileName = 'lol/yo-file.md'
const fileData = {
  title: 'Hello',
  date: new Date().toDateString()
}
const fileContent = 'hi'

const file = matter.stringify(fileContent, fileData)

fs.outputFileSync(fileName, file)
