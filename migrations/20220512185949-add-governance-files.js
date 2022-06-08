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
  return db.createTable('governance_files', {
    id: {type: 'text', primaryKey: true, unique: true, autoIncrement: true},
    governance_path: {type: 'string', null: true},
    governance_file: {type: 'json', null: true},
    created_at: 'timestamptz',
    updated_at: 'timestamptz',
  })
}

exports.down = function (db) {
  return db.dropTable('governance_files')
}

exports._meta = {
  version: 1,
}
