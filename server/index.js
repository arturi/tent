const argv = require('yargs').argv
const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const glob = require('glob')
const fs = require('fs-extra')
const hammock = require('../hammock')

console.log(argv)

const DOCUMENTS_DIR = argv.docs ? argv.docs : `./../documents`
const RELATIVE_MEDIA_DIR = argv.relativeMediaDir ? argv.relativeMediaDir : '/s/'
const PUBLIC_DIR = argv.public ? argv.public : `./../public`
const PORT = argv.port ? argv.port : 3350
const TEMP_UPLOADS_DIR = `./../uploads/`

const hammockOpts = {
  newImageSize: 1600,
  includeOriginalFileName: false,
  publicDir: PUBLIC_DIR ,
  relativeMediaDir: RELATIVE_MEDIA_DIR
}

const upload = multer({ dest: TEMP_UPLOADS_DIR })
const app = express()
app.use(bodyParser.json())
app.use(express.static(PUBLIC_DIR))
app.use('/admin', express.static(`${__dirname}/../public`))

// app.get('/admin', (req, res) => {
//   console.log('admin!')
//   fs.readFile(`${__dirname}/../public/index.html`, (err, content) => {
//     if (err) console.log(err)
//     res.end(content)
//   })
// })

app.get('/api/documents', (req, res) => {
  console.log('list!')
  glob('**/*.md', { cwd: DOCUMENTS_DIR }, (err, fileList) => {
    if (err) throw err
    res.json({status: 'ok', data: fileList})
  })
})

app.get('/api/documents/:id', (req, res) => {
  console.log(req.params)
  console.log('get!')
  const id = req.params.id
  fs.readFile(`${DOCUMENTS_DIR}/${id}`, 'utf-8', (err, file) => {
    if (err) {
      console.log(err)
      return res.json({status: 'error', err: err})
    }
    res.json({status: 'ok', data: file})
  })
})

app.post('/api/documents/:id', (req, res) => {
  console.log(req.params)
  console.log('save!')
  const id = req.params.id
  const body = req.body
  fs.outputFile(`${DOCUMENTS_DIR}/${id}`, body.doc, (err) => {
    if (err) throw err
    res.json({status: 'ok'})
  })
})

app.post('/api/files', upload.any(), (req, res) => {
  req.files.forEach((file) => {
    hammock(file, hammockOpts, function (err, data) {
      if (err) throw err
      res.json({status: 'ok', data: data})
    })
  })
})

app.listen(PORT, (err) => {
  if (err) throw err
  console.log('Tent is running on localhost:', PORT)
})
