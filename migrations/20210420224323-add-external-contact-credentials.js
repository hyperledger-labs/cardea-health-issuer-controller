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
    .createTable('external_contact_credentials', {
      id: {type: 'int', primaryKey: true, unique: true, autoIncrement: true},
      external_contact_id: 'text',
      connection_id: 'text',
      external_record_id: 'text',
      schema_id: 'text',
      credential_exchange_id: 'text',
    })
    .then(function () {
      return db.addIndex(
        'external_contact_credentials',
        'external_contact_credentials_external_contact_id',
        ['external_contact_id'],
      )
    })
}

exports.down = function (db) {
  return db.dropTable('external_contact_credentials')
}

exports._meta = {
  version: 1,
}
