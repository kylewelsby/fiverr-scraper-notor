const fs = require('fs')
const path = require('path')
const util = require('./util')
const Check = require('./check')
const csvWriter = require('csv-write-stream')
const JSONStream = require('JSONStream')
const Bluebird = require('bluebird')

const INPUT = fs.readFileSync(path.resolve(__dirname, '../input.txt'), {encoding: 'utf8'}).split('\n')

util.setup(function () {
  let writers = {}

  writers.csv = csvWriter()
  writers.json = JSONStream.stringify()
  writers.json.pipe(fs.createWriteStream(path.resolve(__dirname, '../data/_master.json')))
  writers.csv.pipe(fs.createWriteStream(path.resolve(__dirname, '../data/_master.csv')))

  Bluebird.map(INPUT, function (item) {
    if (item) {
      return Check(item, writers).catch(function (error) {
        console.error(error)
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
