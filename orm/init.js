const {Sequelize} = require('sequelize')

connect = function () {
  const sequelize = new Sequelize(process.env.DB, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false, //console.log, // Log to console or false (no logging of database queries)
    omitNull: true,
  })

  return sequelize
}

module.exports = {
  connect,
}
