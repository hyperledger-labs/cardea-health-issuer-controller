'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
}

exports.up = function (db) {
  const organizationName = JSON.stringify({
    organizationName: 'Health Lab',
    title: 'Health Lab',
  })

  return db.runSql(
    `UPDATE settings SET value = '${organizationName}' WHERE key = 'organization';`,
    function (err) {
      if (err) return console.log(err)
    },
  )
}

exports.down = function (db) {
  const companyName = JSON.stringify({
    companyName: 'Health Lab',
  })

  return db.runSql(
    `UPDATE settings SET value = '${companyName}' WHERE key = 'organization';`,
    function (err) {
      if (err) return console.log(err)
    },
  )
}

exports._meta = {
  "version": 1
}
