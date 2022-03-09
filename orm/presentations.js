const {Sequelize, DataTypes, Model} = require('sequelize')

const init = require('./init.js')
sequelize = init.connect()

class Presentations extends Model {}

Presentations.init(
  {
    presentation_exchange_id: {
      type: DataTypes.INTEGER,
      unique: true,
      primaryKey: true,
      allowNull: false,
    },
    trace: {
      type: DataTypes.BOOLEAN,
    },
    connection_id: {
      type: DataTypes.TEXT,
    },
    role: {
      type: DataTypes.TEXT,
    },

    presentation_created_at: {
      type: DataTypes.DATE,
    },
    presentation_updated_at: {
      type: DataTypes.DATE,
    },

    presentation_request_dict: {
      type: DataTypes.JSON,
    },
    initiator: {
      type: DataTypes.TEXT,
    },
    presentation_request: {
      type: DataTypes.JSON,
    },

    state: {
      type: DataTypes.TEXT,
    },
    thread_id: {
      type: DataTypes.TEXT,
    },
    auto_present: {
      type: DataTypes.BOOLEAN,
    },
    presentation: {
      type: DataTypes.JSON,
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
    modelName: 'Presentations',
    tableName: 'presentation_reports',
    timestamps: false,
  },
)

const createPresentationReports = async (
  presentation_exchange_id,
  trace,
  connection_id,
  role,
  presentation_created_at,
  presentation_updated_at,
  presentation_request_dict,
  initiator,
  presentation_request,
  state,
  thread_id,
  auto_present,
  presentation,
) => {
  const timestamp = Date.now()

  try {
    const presentationReport = await Presentations.upsert({
      presentation_exchange_id: presentation_exchange_id,
      trace: trace,
      connection_id: connection_id,
      role: role,
      presentation_created_at: presentation_created_at,
      presentation_updated_at: presentation_updated_at,
      presentation_request_dict: presentation_request_dict,
      initiator: initiator,
      presentation_request: presentation_request,
      state: state,
      thread_id: thread_id,
      auto_present: auto_present,
      presentation: presentation,

      created_at: timestamp,
      updated_at: timestamp,
    })

    console.log('Presentation stored successfully.')
    return presentationReport[0]
  } catch (error) {
    console.log('Error storing presentation inside of database:')
    throw error
  }
}

const updatePresentationReports = async (
  presentation_exchange_id,
  trace,
  connection_id,
  role,
  presentation_created_at,
  presentation_updated_at,
  presentation_request_dict,
  initiator,
  presentation_request,
  state,
  thread_id,
  auto_present,
  presentation,
) => {
  const timestamp = Date.now()

  try {
    const presentationReport = await Presentations.update(
      {
        presentation_exchange_id: presentation_exchange_id,
        trace: trace,
        connection_id: connection_id,
        role: role,
        presentation_created_at: presentation_created_at,
        presentation_updated_at: presentation_updated_at,
        presentation_request_dict: presentation_request_dict,
        initiator: initiator,
        presentation_request: presentation_request,
        state: state,
        thread_id: thread_id,
        auto_present: auto_present,
        presentation: presentation,

        updated_at: timestamp,
      },
      {
        where: {
          presentation_exchange_id: presentation_exchange_id,
        },
        returning: true,
      },
    )

    console.log('Presentation Report updated successfully.')

    return presentationReport[1][0]
  } catch (error) {
    console.log('Error updating presentation inside of database:')
    throw error
  }
}

const readPresentations = async function () {
  try {
    const presentations = await Presentations.findAll()
    return presentations
  } catch (error) {
    console.log('Error reading presentation reports from database:')
    throw error
  }
}

module.exports = {
  createPresentationReports,
  updatePresentationReports,
  readPresentations,
}
