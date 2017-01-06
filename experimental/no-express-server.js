// const config = require('./config')
const http = require('http')
const fs = require('fs')
const glob = require('glob')
const Router = require('routes')
const router = Router()
const matter = require('gray-matter')
const body = require('body/any')
const ecstatic = require('ecstatic')

const st = ecstatic(__dirname + '/public')
const DOCUMENTS_DIR = 'documents'
const PORT = 3350

function getDocumentList (folder) {
	return glob.sync('**/*.md', { cwd: folder })
}

router.addRoute('/documents/:action/:id?', (req, res, match) => {
  const action = match.params.action
  const id = match.params.id

  body(req, res, function (err, params) {
    if (err) console.log(err)
    console.log(params)
  })

  if (action === 'edit') {
    res.setHeader('content-type', 'text/html')
    fs.readFile(`${__dirname}/${DOCUMENTS_DIR}/${id}`, 'utf-8', (err, file) => {
      if (err) throw err
      // console.log(file)
      res.end(file)
      return
    })
    // fs.createReadStream(`${__dirname}/${DOCUMENTS_DIR}/${id}`).pipe(res)
    return
  } else if (action === 'save') {
    req.pipe(fs.createWriteStream(`${__dirname}/${DOCUMENTS_DIR}/${id}`))
    res.end('saved ' + id + '\n')
  } else if (action === 'list') {
    var docList = getDocumentList(DOCUMENTS_DIR)

    res.end(JSON.stringify(docList))
  } else {
    res.statusCode = 404
    res.end('not found\n')
  }
})

const server = http.createServer(function (req, res) {
  var match = router.match(req.url)
  if (match) {
    match.fn(req, res, match)
  } else {
    st(req, res)
  }
})

server.listen(PORT)
console.log('Listening on port ' + PORT)
