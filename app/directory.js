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
  if ($('.buttonNext').length) {
    debug('Has more pages')
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
    debug('Paginating', this.id, this.query, response.nextPageNumber)
    handledPages.push(response.nextPageUrl)
    return Directory(this.id, this.query, this.writers, response.nextPageNumber)
  }
  return response
}

function Directory (id, query, writers, page) {
  if (!id) {
    throw new Error('Missing ID')
  }
  if (!query) {
    throw new Error('Missing Query')
  }
  if (!page) {
    page = 1
  }

  util.incMetadata('pages')
  this.id = id
  this.writers = writers
  this.query = query
  this.writers = writers
  this.inputUrl = `http://www.notar.de/suchergebnis?notprospective=true&active_search=grundbuch&landregistry_id=${id}&page=${page}`
  if (handledPages.indexOf(this.inputUrl) !== -1) {
    throw new Error('Page already handled')
  }
  debug('Loading Directory', this.query, this.id, this.inputUrl)

  return request({
    url: this.inputUrl
  })
    .then(handleResponse.bind(this))
    .then(paginate.bind(this))
}

module.exports = Directory
