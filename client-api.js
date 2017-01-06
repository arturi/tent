function sendRequest (payload, done) {
  const request = new XMLHttpRequest()
  request.open('POST', '/api')
  request.addEventListener('load', function () {
    console.log(this.responseText)
    done(null, this.responseText)
  })
  request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  request.send(JSON.stringify(payload))
}

function getList (done) {
  const request = new XMLHttpRequest()
  request.open('GET', '/api/documents')
  request.addEventListener('load', function () {
    console.log(this.responseText)
    done(null, JSON.parse(this.responseText))
  })
  request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  request.send()
}

function getDoc (id, done) {
  const request = new XMLHttpRequest()
  request.open('GET', '/api/documents/' + encodeURIComponent(id))
  request.addEventListener('load', function () {
    console.log(this.responseText)
    done(null, JSON.parse(this.responseText))
  })
  request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  request.send()
}

function saveDoc (id, doc, done) {
  const request = new XMLHttpRequest()
  request.open('POST', '/api/documents/' + encodeURIComponent(id))
  request.addEventListener('load', function () {
    console.log(this.responseText)
    done(null, JSON.parse(this.responseText))
  })
  request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  request.send(JSON.stringify({ doc: doc }))
}

module.exports = {
  getDoc,
  saveDoc,
  getList,
  sendRequest
}
