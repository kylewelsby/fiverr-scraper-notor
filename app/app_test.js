const assert = require('assert')
const mockery = require('mockery')
const cheerio = require('cheerio')
const Bluebird = require('bluebird')
const fs = require('fs')
const path = require('path')
const url = require('url')
const csvWriter = require('csv-write-stream')
const JSONStream = require('JSONStream')

function requestMock (options) {
  let body = null
  let theUrl = url.parse(options.url, true)
  if (theUrl.query.page > 1) {
    body = fs.readFileSync(path.resolve(__dirname, `fixtures/directory_${theUrl.query.page}.html`), 'utf8')
  } else {
    body = fs.readFileSync(path.resolve(__dirname, 'fixtures/directory.html'), 'utf8')
  }
  if (options.url.indexOf('ajaxtype=autocomplete_service') >= 0) {
    body = fs.readFileSync(path.resolve(__dirname, 'fixtures/check.html'), 'utf8')
  }
  let response = cheerio.load(body)
  return Bluebird.resolve(response)
}

before(function (done) {
  try {
    fs.mkdirSync(path.resolve(__dirname, '../data'))
  } catch (e) {}
  try {
    fs.unlinkSync(path.resolve(__dirname, '../data/_master.csv'), '')
  } catch (e) {}
  fs.writeFileSync(path.resolve(__dirname, '../data/_meta.json'), '{}')

  mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
    useCleanCache: true
  })

  requestMock.jar = require('request').jar
  requestMock.cookie = require('request').cookie

  requestMock.defaults = function (options) {
    return requestMock
  }
  mockery.registerMock('request-promise', requestMock)

  done()
})
after(function () {
  mockery.disable()
  mockery.deregisterAll()
// try {
//   fs.unlinkSync(path.resolve(__dirname, '../data/_master.csv'), '')
// } catch(e) {}
// try {
//   fs.unlinkSync(path.resolve(__dirname, '../data/_meta.json'), '')
// } catch(e) {}
})

function countFileLines (file, done) {
  var count = 0
  var readline = require('readline')
  var rl = readline.createInterface({
    input: fs.createReadStream(path.resolve(__dirname, file))
  })
  rl.on('line', function (line) {
    count++
  })
  rl.on('close', function () {
    done(count)
  })
}

describe('Directory', function () {
  it('Scrapes the site', function (done) {
    let Check = require('./check')
    let writer = csvWriter()
    let jsonWriter = JSONStream.stringify()
    jsonWriter.pipe(fs.createWriteStream(path.resolve(__dirname, '../data/_master.json')))
    writer.pipe(fs.createWriteStream(path.resolve(__dirname, '../data/_master.csv')))
    let writers = {
      csv: writer,
      json: jsonWriter
    }

    Check('Aalen', writers).then(function (response) {
      Object.keys(writers).forEach(function (key) {
        writers[key].end()
      })
      setTimeout(function () {
        let data = require('../data/_master.json')
        let item = data[0]
        assert.equal(item['GRUNDBUCHAMT'], 'Grundbuchamt Backnang')
        assert.equal(item['GEMARKUNG'], 'Allmersbach - 1215')
        assert.equal(item['GRUNDBUCHBEZIRK'], 'Allmersbach - 081215')
        assert.equal(item['ORT'], 'Aspach')
        assert.equal(item['ZUSTDG. AB'], '01.01.1900')
        assert.equal(item['ZUSTDG. BIS'], '11.12.2016')
        assert.equal(data.length, 14)
        countFileLines('../data/_master.csv', function (count) {
          assert.equal(count, 15) // includes header
          done()
        })
      }, 10)
    }).catch(done)
  })
})
