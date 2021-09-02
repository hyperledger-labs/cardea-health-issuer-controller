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
    .createTable('external_contacts', {
      id: {type: 'int', primaryKey: true, unique: true, autoIncrement: true},
      external_contact_id: 'text',
      contact_id: 'int',
    })
    .then(function () {
      return db.addIndex(
        'external_contacts',
        'external_contacts_external_contact_id',
        ['external_contact_id'],
      )
    })
    .then(function () {
      return db.addIndex('external_contacts', 'external_contacts_contact_id', [
        'contact_id',
      ])
    })
}

exports.down = function (db) {
  return db.dropTable('external_contacts')
}

exports._meta = {
  version: 1,
}
