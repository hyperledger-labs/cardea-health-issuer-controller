const {Sequelize, DataTypes, Model} = require('sequelize')

const init = require('./init.js')
sequelize = init.connect()

class Session extends Model {}
exports.Session = Session

Session.init(
  {
    sid: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    expires: {
      type: DataTypes.DATE,
    },
    data: {
      type: DataTypes.TEXT,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize, // Pass the connection instance
    modelName: 'Session',
    tableName: 'sessions', // Our table names don't follow the sequelize convention and thus must be explicitly declared
    timestamps: false,
  },
)

const readSessionById = async function (sid) {
  try {
    const session = await Session.findAll({
      where: {
        sid,
      },
    })

    return session[0]
  } catch (error) {
    console.error('Could not find session in the database: ', error)
  }
}

const readSessions = async function () {
  try {
    const sessions = await Session.findAll()

    return sessions
  } catch (error) {
    console.error('Could not find sessions in the database: ', error)
  }
}

module.exports = {
  Session,
  readSessions,
  readSessionById,
}