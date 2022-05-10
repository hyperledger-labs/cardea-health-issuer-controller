let ConnectionsState = require('../orm/connectionStates')

// Perform Agent Business Logic
const updateOrCreateConnectionState = async function (
  connection_id,
  key,
  value,
) {
  try {
    await ConnectionsState.createOrUpdateConnectionState(
      connection_id,
      key,
      value,
    )

    const connectionStates = await ConnectionsState.readConnectionStates(
      connection_id,
      key,
    )

    return connectionStates
  } catch (error) {
    console.error('Error Fetching Connection States')
    throw error
  }
}

const getConnectionStates = async (connection_id, key) => {
  try {
    const connectionStates = await ConnectionsState.readConnectionStates(
      connection_id,
      key,
    )

    return connectionStates
  } catch (error) {
    console.error('Error Fetching Connection States')
    throw error
  }
}

const getAll = async () => {
  try {
    const connectionStates = await ConnectionsState.readConnectionsStates()

    return connectionStates
  } catch (error) {
    console.error('Error Fetching States of All Connections')
    throw error
  }
}

const removeConnectionStates = async function (connection_id) {
  try {
    await ConnectionsState.deleteConnectionStates(connection_id)
  } catch (error) {
    console.error('Error Removing Connection State')
    throw error
  }
}

const removeConnectionsStates = async function (connection_id) {
  try {
    await ConnectionsState.deleteConnectionsStates(connection_id)
  } catch (error) {
    console.error('Error Removing ALL Connection State')
    throw error
  }
}

const ConnectionsStatesGarbageCollection = async function (expiration) {
  try {
    await ConnectionsState.deleteUser(expiration)
  } catch (error) {
    console.error('Error Running Garbage Collection')
    throw error
  }
}

module.exports = {
  updateOrCreateConnectionState,
  getConnectionStates,
  getAll,
  removeConnectionStates,
  removeConnectionsStates,
  ConnectionsStatesGarbageCollection,
}