const Websockets = require('../websockets.js')
let Sessions = require('../orm/sessions')

const getSessions = async () => {
  try {
    const sessions = await Sessions.readSessions()
    return sessions
  } catch (error) {
    console.error('Error Fetching Sessions')
    throw error
  }
}

const getSessionById = async (sid) => {
  try {
    const session = await Sessions.readSessionById(sid)
    return session
  } catch (error) {
    console.error('Error Fetching Session by sid')
    throw error
  }
}

module.exports = {
  getSessions,
  getSessionById,
}