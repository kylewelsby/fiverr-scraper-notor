const url = require('url')
const request = require('./request')

const debug = require('debug')('app:directory')
const util = require('./util')

let handledPages = []

function handleResponse ($) {
  var query = this.query
  var writers = this.writers
  var results = []
  $('table .dataRow').each(function () {
    var data = {}
    data['usedInput'] = query
    data['GRUNDBUCHAMT'] = util.stripWhitespace($(this).find('.columnRegistry').text())
    data['ELRV AB'] = util.stripWhitespace($(this).find('td:nth-of-type(3)').text())
    data['GEMARKUNG'] = util.stripWhitespace($(this).find('td:nth-of-type(4)').text())
    data['GRUNDBUCHBEZIRK'] = util.stripWhitespace($(this).find('td:nth-of-type(5)').text())
    data['ORT'] = util.stripWhitespace($(this).find('td:nth-of-type(6)').text())
    data['ZUSTDG. AB'] = util.stripWhitespace($(this).find('td:nth-of-type(7)').text())
    data['ZUSTDG. BIS'] = util.stripWhitespace($(this).find('td:nth-of-type(8)').text())
    Object.keys(writers).forEach(function (key) {
      writers[key].write(data)
    })
    util.incMetadata('results')

    results.push(data)
  })
  var nextPageNumber = null
  if ($('.buttonNext').prop('href')) {
    var theUrl = url.parse(this.inputUrl, true)

    nextPageNumber = parseInt(theUrl.query.page, 10) || 1
    nextPageNumber = nextPageNumber + 1
  }
  return {
    daresultsta: results,
    nextPageNumber: nextPageNumber
  }
}

function paginate (response) {
  if (response.nextPageNumber) {
    if (handledPages.indexOf(response.nextpages) === -1) {
      debug('Paginating')
      handledPages.push(response.nextPageUrl)
      return Directory(this.id, this.query, this.writers, response.nextPageNumber)
    }
  }
  return response
}

function Directory (id, query, writers, page) {
  if (!page) {
    page = 1
  }
  util.incMetadata('pages')
  this.id = id
  this.writers = writers
  this.query = query
  this.inputUrl = `http://www.notar.de/suchergebnis?notprospective=true&active_search=grundbuch&landregistry_id=${id}&page=${page}`
  this.writers = writers
  debug('Loading Directory', query, id, this.inputUrl)

  return request({
    url: this.inputUrl
  })
    .then(handleResponse.bind(this))
    .then(paginate.bind(this))
}

module.exports = Directory
