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
  return db.createTable('presentation_reports', {
    presentation_exchange_id: {type: 'text', primaryKey: true, unique: true},
    trace: 'boolean',
    connection_id: 'text',
    role: 'text',

    presentation_created_at: 'timestamptz',
    presentation_updated_at: 'timestamptz',

    presentation_request_dict: 'json',
    initiator: 'text',
    presentation_request: 'json',

    state: 'text',
    thread_id: 'text',
    auto_present: 'boolean',
    presentation: 'json',

    created_at: 'timestamptz',
    updated_at: 'timestamptz',
  })
}

exports.down = function (db) {
  return db.dropTable('presentation_reports')
}

exports._meta = {
  version: 1,
}