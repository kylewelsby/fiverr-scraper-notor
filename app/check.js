const request = require('./request')
const Bluebird = require('bluebird')
const Directory = require('./directory')

function handleResponse (content) {
  var ids = []
  content.text().split('\n').forEach(function (row) {
    var id = row.split('|')[1]
    if (id) {
      ids.push(id)
    }
  })
  return ids
}

function processResults (ids, query, writers) {
  return Bluebird.map(ids, function (id) {
    return Directory(id, query, writers)
  }, {concurrency: 1})
}

function Check (query, writers) {
  this.query = query
  this.writers = writers
  return request({
    url: 'http://www.notar.de/index.html?type=landregistry_landregistry&ajax=true&ajaxtype=autocomplete_service',
    method: 'POST',
    form: {
      q: query,
      limit: 50,
      timestamp: 1474385898505
    }
  })
    .then(handleResponse)
    .then(function (ids) {
      return processResults(ids, query, writers)
    })
}
module.exports = Check
