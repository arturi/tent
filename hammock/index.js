const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const shortid = require('shortid')
const mkdirp = require('mkdirp')
const imagemin = require('imagemin')
const imageminJpegtran = require('imagemin-jpegtran')
const imageminPngquant = require('imagemin-pngquant')
const imageminGiflossy = require('imagemin-giflossy')
// const imageminWebp = require('imagemin-webp')

module.exports = hammock

const UPLOADS_DIR = `${__dirname}/../uploads/`

const defaultOpts = {
  newImageSize: 1600,
  includeOriginalFileName: false
}

function hammock (file, opts, cb) {
  opts = opts || {}
  opts = Object.assign({}, defaultOpts, opts)

  function fileExists (filePath) {
    try {
      fs.statSync(filePath)
      return true
    } catch (err) {
      if (err.code === 'ENOENT') {
        return false
      }
      throw err
    }
  }

  function generateUniqueName (fileName) {
    const originalExtension = path.extname(fileName);
    const originalName = fileName.substr(0, fileName.lastIndexOf('.'))

    const uniqueName = opts.includeOriginalFileName
      ? originalName.replace(/\W+/g, '-').toLowerCase() + shortid.generate() + originalExtension.toLowerCase()
      : shortid.generate() + originalExtension.toLowerCase()
    return uniqueName
  }

  function pad (str) {
    return (str.length !== 2) ? '0' + str : str
  }

  function resize (file, cb) {
    console.log('Processing:', file.path)
    const transformStream = sharp(file.path)
      .resize(opts.newImageSize)
      .withoutEnlargement()
      .on('info', function (info) {
        console.log('Resized image height is', info.height)
      })
      .on('error', function (err) {
        console.log(err)
      })

    return transformStream
  }

  // `shortid` in `generateUniqueName` is supposed to only return unique strings, but just in case,
  // we check that file doesn’t exist before writing. If it does, we call the function again to generate a new name
  function saveUnique (originalName, type, stream, cb) {
    const newName = generateUniqueName(originalName)
    const date = new Date()
    const datePath = `${date.getFullYear().toString()}/${pad((date.getMonth() + 1).toString())}`
    const destDir = path.join(opts.publicDir, opts.relativeMediaDir, datePath)
    const destPath = path.join(destDir, newName)
    const relativePath = path.join(opts.relativeMediaDir, datePath, newName)

    if ( !fileExists(destPath) ) {
      mkdirp(path.join(opts.publicDir, opts.relativeMediaDir, datePath), function (err) {
        if (err) cb(err)
        const outStream = fs.createWriteStream(destPath)
        stream.pipe(outStream)
        outStream.on('error', cb)
        outStream.on('finish', function () {
          console.log(`Saved to ${relativePath}`)
          imagemin([destPath], destDir, {
            plugins: [
              imageminGiflossy({ lossy: 80 }),
              imageminJpegtran(),
              // imageminWebp(),
              imageminPngquant({quality: '65-80'})
            ]
          }).then(files => {
            console.log(`Minified with imagemin: ${files[0].path}`)
            cb(null, { type: type, url: relativePath })
          })
        })
      })
    } else {
      console.error(`Name already exists, coming up with a new one...`)
      saveUnique(originalName, type, stream, cb)
    }
  }

  let stream
  if (file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/webp') {
    stream = resize(file)
  } else {
    stream = fs.createReadStream(path.join(UPLOADS_DIR + file.filename))
  }

  saveUnique(file.originalname, file.mimetype, stream, function (err, data) {
    if (err) cb(err)
    fs.unlink(file.path, function (err) {
      if (err) cb(err)
      cb(null, data)
    })
  })
}
