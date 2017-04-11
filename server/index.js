const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const glob = require('glob')
const fs = require('fs-extra')
const hammock = require('../hammock')

const DOCUMENTS_DIR = `${__dirname}/../documents`
const UPLOADS_DIR = `${__dirname}/../uploads/`

const upload = multer({ dest: UPLOADS_DIR })
const app = express()
app.use(bodyParser.json())
app.use(express.static(__dirname + '/../public'))

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
    hammock(file, function (err, data) {
      if (err) throw err
      res.json({status: 'ok', data: data})
    })
  })
})

const port = process.env.PORT || 3350
app.listen(port)
