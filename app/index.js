const fs = require('fs')
const path = require('path')
const util = require('./util')
const Check = require('./check')
const csvWriter = require('csv-write-stream')
const JSONStream = require('JSONStream')
const Bluebird = require('bluebird')

const INPUT = fs.readFileSync(path.resolve(__dirname, '../input.txt'), {encoding: 'utf8'}).split('\n').sort()

util.setup(function () {
  let writers = {}

  writers.csv = csvWriter()
  writers.json = JSONStream.stringify()
  writers.json.pipe(fs.createWriteStream(path.resolve(__dirname, '../data/_master.json')))
  writers.csv.pipe(fs.createWriteStream(path.resolve(__dirname, '../data/_master.csv')))
  var counter = 0
  Bluebird.map(INPUT, function (item) {
    util.setMetadata('progress', (counter / INPUT.length).toFixed(2) + '%')
    counter++
    if (item) {
      return Check(item, writers).catch(function (error) {
        console.error(error)
        fs.appendFileSync(path.resolve(__dirname, '../data/error.log'), error + '\n')
        util.incMetadata('Skipped')
      })
    }
  }, {concurrency: 1}).then(function () {
    Object.keys(writers).forEach(function (key) {
      writers[key].end()
    })

    util.setMetadata('finishAt', new Date())
    util.showMetaData()
    process.exit()
  }).catch(function (e) {
    console.error(e)
    process.exit(1)
  })
})
