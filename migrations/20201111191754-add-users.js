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
  return db.createTable('users', {
    user_id: {type: 'int', primaryKey: true, unique: true, autoIncrement: true},
    username: {type: 'text', null: true},
    email: 'text',
    password: {type: 'text', null: true},
    token: {type: 'text', null: true},
    created_at: 'timestamptz',
    updated_at: 'timestamptz',
  })
}

exports.down = function (db) {
  return db.dropTable('users')
}

exports._meta = {
  version: 1,
}
