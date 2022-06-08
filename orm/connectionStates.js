const {Sequelize, DataTypes, Model, Op} = require('sequelize')

const init = require('./init.js')
sequelize = init.connect()

class ConnectionsStates extends Model {}

ConnectionsStates.init(
  {
    connection_id: {
      type: DataTypes.TEXT,
    },
    key: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    value: {
      type: DataTypes.JSON,
      defaultValue: {},
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
    },
    updated_at: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize, // Pass the connection instance
    modelName: 'ConnectionsStates',
    tableName: 'connections_states', // Our table names don't follow the sequelize convention and thus must be explicitly declared
    timestamps: false,
  },
)

const createOrUpdateConnectionState = async function (
  connection_id,
  key,
  value,
) {
  try {
    await sequelize.transaction(
      {
        isolationLevel: Sequelize.Transaction.SERIALIZABLE,
      },
      async (t) => {
        let connectionState = await ConnectionsStates.findOne({
          where: {
            connection_id,
            key,
          },
        })

        const timestamp = Date.now()

        // (JamesKEbert) TODO: Change upsert for a better mechanism, such as locking potentially.
        if (!connectionState) {
          console.log('Creating Connection State')
          await ConnectionsStates.upsert({
            connection_id,
            key,
            value,
            created_at: timestamp,
            updated_at: timestamp,
          })
        } else {
          console.log('Updating connection state')
          await ConnectionsStates.update(
            {
              connection_id,
              key,
              value,
              updated_at: timestamp,
            },
            {
              where: {
                connection_id,
                key,
              },
            },
          )
        }
      },
    )
    console.log('Connection state saved successfully.')
    return true
  } catch (error) {
    console.error('Error saving connection state to the database: ', error)
  }
}

const readConnectionStates = async function (connection_id, key) {
  try {
    const connectionStates = await ConnectionsStates.findAll({
      where: {
        connection_id,
        key,
      },
    })
    return connectionStates[0]
  } catch (error) {
    console.error('Could not find a connection in the database: ', error)
  }
}

const readConnectionsStates = async function () {
  try {
    const connectionsStates = await ConnectionsStates.findAll()

    return connectionsStates
  } catch (error) {
    console.error('Could not find connection states in the database: ', error)
  }
}

const deleteConnectionStates = async function (connection_id) {
  try {
    await ConnectionsStates.destroy({
      where: {
        connection_id,
      },
    })

    console.log('Successfully deleted connection state')
  } catch (error) {
    console.error('Error while deleting connection state: ', error)
  }
}

const deleteConnectionsStates = async function () {
  try {
    // (eldersonar) This is great for testing since it removes all the rows and resets the counter to 1
    await ConnectionsStates.sync({force: true})

    // await ConnectionsStates.destroy({
    //     where: {},
    //     truncate: true
    // })

    console.log('Successfully deleted ALL connections states')
  } catch (error) {
    console.error('Error while deleting ALL connections state: ', error)
  }
}

const ConnectionsStatesGarbageCollection = async function (expiration) {
  try {
    await ConnectionsStates.destroy({
      where: {
        updated_at: {
          [Op.lt]: expiration,
        },
      },
    })

    console.log(
      `Connection states garbage collection: DELETE FROM "connection_states" WHERE "updated_at" < ${expiration}`,
    )
  } catch (error) {
    console.error(
      'Error while running garbage collection for connection states table: ',
      error,
    )
  }
}

module.exports = {
  createOrUpdateConnectionState,
  readConnectionStates,
  readConnectionsStates,
  deleteConnectionStates,
  deleteConnectionsStates,
  ConnectionsStatesGarbageCollection,
}
