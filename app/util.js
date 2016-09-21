const fs = require('fs')
const path = require('path')
const metadataFile = path.resolve(__dirname, '../data/_meta.json')
module.exports.stripWhitespace = function stripWhitespace (input) {
  if (typeof input === 'string') {
    return input.replace(/^\s+/, '').replace(/\s+$/, '').replace(/(\n|\t|\r)/g, '').replace(/^"/, '').replace(/"$/, '')
  }
  return input
}

function setMetadata (key, value) {
  var meta = require(metadataFile)
  meta[key] = value
  fs.writeFileSync(metadataFile, JSON.stringify(meta, null, '  '))
}
module.exports.setMetadata = setMetadata

module.exports.incMetadata = function incMetadata (key, value) {
  var meta = require(metadataFile)
  if (!meta[key]) {
    meta[key] = 0
  }
  if (value) {
    meta[key] = meta[key] + value
  } else {
    meta[key]++
  }
  fs.writeFileSync(metadataFile, JSON.stringify(meta, null, '  '))
}

module.exports.setup = function (cb) {
  try {
    fs.mkdirSync(path.resolve(__dirname, '../data'))
  } catch (e) {}
  try {
    fs.unlinkSync(path.resolve(__dirname, '../data/_master.csv'), '')
  } catch (e) {}
  try {
    fs.unlinkSync(path.resolve(__dirname, '../data/_master.json'), '')
  } catch (e) {}
  try {
    fs.unlinkSync(path.resolve(__dirname, '../data/error.log'), '')
  } catch (e) {}
  fs.writeFileSync(metadataFile, '{}')

  setMetadata('startAt', new Date())
  cb()
}

module.exports.showMetaData = function () {
  console.log(require(metadataFile))
}
