const coreRequest = require('request-promise')

const Bluebird = require('bluebird')

const cheerio = require('cheerio')

const debug = require('debug')('app:request')
const util = require('./util')
const HTTP_TIMEOUT = 30000

const coreDefaults = {
  method: 'GET',
  timeout: HTTP_TIMEOUT,
  transform: function (body) {
    return cheerio.load(body)
  }
}

let rp = coreRequest.defaults(coreDefaults)

function updateMetadata (data) {
  util.incMetadata('requests')
  return data
}

function request (options) {
  return rp(options)
    .then(updateMetadata)
    .catch(function (err) {
      debug(err.message)
      util.incMetadata('failedRequests')
      if (!options.attempts) {
        options.attempts = 0
      }
      if (options.attempts > 10) {
        util.incMetadata('totalFailures')
        return Bluebird.reject('Maximum attempts reached')
      }
      options.attempts++
      return request(options)
    })
}

module.exports = request
