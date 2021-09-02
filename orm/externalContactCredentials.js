const {Sequelize, DataTypes, Model} = require('sequelize')

const init = require('./init.js')
sequelize = init.connect()

class ExternalContactCredential extends Model {}
exports.ExternalContactCredential = ExternalContactCredential

ExternalContactCredential.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    external_contact_id: {
      type: DataTypes.STRING,
    },
    connection_id: {
      type: DataTypes.STRING,
    },
    external_record_id: {
      type: DataTypes.STRING,
    },
    schema_id: {
      type: DataTypes.STRING,
    },
    credential_exchange_id: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize, // Pass the connection instance
    modelName: 'ExternalContactCredential',
    tableName: 'external_contact_credentials',
    timestamps: false,
  },
)

module.exports = {
  ExternalContactCredential,
}
