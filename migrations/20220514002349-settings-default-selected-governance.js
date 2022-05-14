'use strict'

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

exports.up = function (db) {
  return db
    .insert(
      'settings',
      ['key', 'value'],
      [
        'governance',
        JSON.stringify({
          governance_path: "http://echo.jsontest.com/insert-key-here/insert-value-here/key/value"
          }),
      ],
    )
}

exports.down = function (db) {
  return db.runSql(
    `DELETE FROM settings WHERE key = 'governance';`,
    function (err) {
      if (err) return console.log(err)
    },
  )
}

exports._meta = {
  version: 1,
}
