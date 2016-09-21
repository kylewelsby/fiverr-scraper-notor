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

function processResults (ids) {
  if (ids.length === 0) {
    throw new Error('No ids found for ' + this.inputQuery)
  }
  return Bluebird.map(ids, function (id) {
    return new Directory(id, this.inputQuery, this.writers)
  }.bind(this), {concurrency: 2})
}

function Check (query, writers) {
  if (!query) {
    throw new Error('No input query')
  }
  this.inputQuery = query
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
    .then(processResults.bind(this))
}
module.exports = Check
