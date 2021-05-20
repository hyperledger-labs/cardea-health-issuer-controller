const Websockets = require('../websockets.js')

const Presentations = require('./presentations.js')

const adminMessage = async (message) => {
  console.log('New Basic Message')

  // Connection Reuse Method
  switch (message.content) {
    case 'test_id':
      console.log('Connection Request Employee Workflow')

      await Websockets.sendMessageToAll('INVITATIONS', 'SINGLE_USE_USED', {
        workflow: message.content,
        connection_id: message.connection_id,
      })

      break
    case 'test_result':
      console.log('Connection Request Immunization Workflow')

      await Websockets.sendMessageToAll('INVITATIONS', 'SINGLE_USE_USED', {
        workflow: message.content,
        connection_id: message.connection_id,
      })

      // Send Presentation Request
      await Presentations.requestPresentation(message.connection_id)

      break
    default:
      console.warn('Regular Basic Message:', message.content)
      return
  }
}

module.exports = {
  adminMessage,
}
