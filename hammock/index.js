const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const shortid = require('shortid')
const mkdirp = require('mkdirp')

module.exports = hammock

const UPLOADS_DIR = `${__dirname}/../uploads/`
const PUBLIC_DIR = `${__dirname}/../public/`
const PUBLIC_FILE_DIR = `${__dirname}/../public/s`
const PUBLIC_FILE_PATH = '/public/s'

// mkdirp.sync(PUBLIC_FILE_DIR)

const opts = {
  newImageSize: 1600,
  includeOriginalFileName: false
}

function fileExists (filePath) {
  try {
    fs.statSync(filePath)
    return true
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false
    }
    throw e
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

function resize (file) {
  const transformStream = sharp(path.join(UPLOADS_DIR + file.filename))
    .resize(opts.newImageSize)
    .withoutEnlargement()
    .on('info', function (info) {
      console.log('Resized image height is ' + info.height)
    })

  return transformStream
}

// `shortid` in `generateUniqueName` is supposed to only return unique strings, but just in case,
// we check that file doesn’t exist before writing. If it does, we call the function again to generate a new name
function saveUnique (originalName, type, stream, cb) {
  const newName = generateUniqueName(originalName)
  const date = new Date()
  const datePath = `${date.getFullYear().toString()}/${pad((date.getMonth() + 1).toString())}`
  const destPath = path.join(PUBLIC_FILE_DIR, datePath, newName)
  const relativePath = path.join('/s/', datePath, newName)

  if (!fileExists(destPath)) {
    mkdirp(path.join(PUBLIC_FILE_DIR, datePath), function (err) {
      if (err) cb(err)
      const outStream = fs.createWriteStream(destPath)
      stream.pipe(outStream)
      outStream.on('error', cb)
      outStream.on('finish', function () {
        console.log(`Saved to ${relativePath}`)
        cb(null, { type: type, url: relativePath })
      })
    })
  } else {
    console.error(`Name already exists, coming up with a new one...`)
    saveUnique(originalName, type, stream, cb)
  }
}

function hammock (file, cb) {
  const type = file.mimetype.split('/')[0]

  let stream
  if (type === 'image') {
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

// old version from Lettuja
// function resizeAndMove(folder, imgSize, file) {
//   let originalExtension = path.extname(file.originalname);
//   let originalName = file.originalname.substr(0, file.originalname.lastIndexOf('.'));
//
//   // if file is an image, resize it, then move
//   if (file.mimetype === 'image/jpeg'
//       || file.mimetype === 'image/png'
//       || file.mimetype === 'image/gif'
//       || file.mimetype === 'image/webp') {
//
//     let newName = originalName.replace(/\W+/g, '-').toLowerCase() + Date.now() + originalExtension.toLowerCase();
//     let dstImgPath = conf.outputMediaDirectory + '/' + folder + '/' + newName;
//     let imgPath = '/media/' + folder + '/' + newName;
//
//     return new Promise(function (resolve, reject) {
//       gm(file.path).resize(imgSize).write(file.path, function(err) {
//         if (err) reject(err);
//         fs.move(file.path, dstImgPath, function(err) {
//           if (err) reject(err);
//           resolve(imgPath);
//         });
//       });
//     });
//
//   // otherwise just move
//   } else {
//     let dstImgPath = conf.outputMediaDirectory + '/' + folder + '/' + originalName + originalExtension;
//     let imgPath = '/media/' + folder + '/' + originalName + originalExtension;
//
//     return new Promise(function (resolve, reject) {
//       fs.move(file.path, dstImgPath, function(err) {
//         if (err) reject(err);
//         resolve(imgPath);
//       });
//     });
//   }
// }
