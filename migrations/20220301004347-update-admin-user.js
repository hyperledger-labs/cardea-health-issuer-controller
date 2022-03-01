'use strict'

const bcrypt = require('bcryptjs')

var dbm
var type
var seed

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate
  type = dbm.dataType
  seed = seedLink
}

exports.up = async function (db) {
  const timestamp = new Date()
  const castedTimestamp = timestamp.toISOString()
  const hashedPassword = await bcrypt.hash('123!@#!@#QWEqwe', 10)

  return db.runSql(
    `UPDATE users SET password = '${hashedPassword}' WHERE username = 'admin';`,
    function (err) {
      if (err) return console.log(err)
    },
  )
}

exports.down = async function (db) {
  const oldHashedPassword = await bcrypt.hash('12#$qwER', 10)

  return db.runSql(
    `UPDATE users SET password = '${oldHashedPassword}' WHERE username = 'admin';`,
    function (err) {
      if (err) return console.log(err)
    },
  )
}

exports._meta = {
  version: 1,
}