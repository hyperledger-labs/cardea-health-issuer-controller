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
  // If there is a theme, we need to delete it anyway
  const sql = 'DELETE FROM governance_files'
  db.runSql(sql, function (err) {
    if (err) return console.log(err)
  })

  return db
    .insert(
      'governance_files',
      ['governance_path', 'governance_file'],
      [
        'http://echo.jsontest.com/insert-key-here/insert-value-here/key/value',
        JSON.stringify({
          "insert-key-here": "insert-value-here",
          "key": "value"
          }),
      ],
    )
}

exports.down = function (db) {
  const sql = 'DELETE FROM governance_files'
  db.runSql(sql, function (err) {
    if (err) return console.log(err)
  })
  return null
}

exports._meta = {
  version: 1,
}
