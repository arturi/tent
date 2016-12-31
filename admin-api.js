function getDocList (done) {
  var request = new XMLHttpRequest()
  request.open('GET', '/documents/list/')
  request.addEventListener('load', function () {
    update({ docs: JSON.parse(this.responseText) })
    console.log(state.docs)
    done(null)
  })
  request.send()
}

function selectDoc (id, done) {
  var request = new XMLHttpRequest()
  request.open('GET', '/documents/edit/' + id)
  request.addEventListener('load', function () {
    const doc = this.responseText
    done(null, doc)
  })
  request.send()
}

function saveDoc (id, doc) {
  var request = new XMLHttpRequest()
  request.open('POST', '/documents/save/' + id)
  request.addEventListener('load', function () {
    console.log(this.responseText)
  })
  request.send(doc)
}

module.exports = {
  selectDoc,
  saveDoc,
  getDocList
}
