const {Sequelize, DataTypes, Model} = require('sequelize')

const init = require('./init.js')
sequelize = init.connect()

class ExternalContact extends Model {}
exports.ExternalContact = ExternalContact

ExternalContact.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    external_contact_id: {
      type: DataTypes.STRING,
    },
    contact_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize, // Pass the connection instance
    modelName: 'ExternalContact',
    tableName: 'external_contacts',
    timestamps: false,
  },
)

module.exports = {
  ExternalContact,
}
