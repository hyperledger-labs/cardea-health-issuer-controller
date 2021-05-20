const {Sequelize} = require('sequelize')

connect = function () {
  const sequelize = new Sequelize('development', 'development', 'development', {
    host: 'lab-db',
    dialect: 'postgres',
    logging: false, //console.log, // Log to console or false (no logging of database queries)
    omitNull: true,
  })

  return sequelize
}

module.exports = {
  connect,
}
