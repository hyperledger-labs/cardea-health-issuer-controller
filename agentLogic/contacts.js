const AdminAPI = require('../adminAPI')
const Websockets = require('../websockets.js')

const Connections = require('../orm/connections')

const ConnectionStates = require('../agentLogic/connectionStates')

const Contacts = require('../orm/contacts')
const ContactsCompiled = require('../orm/contactsCompiled')
const Demographics = require('../orm/demographics')

// Perform Agent Business Logic

// Fetch an existing connection
const fetchConnection = async (connectionID) => {
  try {
    // (JamesKEbert) TODO:Change to use Controller DB versus Admin API Call
    const connection = await AdminAPI.Connections.fetchConnection(connectionID)

    return connection
  } catch (error) {
    console.error('Error Fetching Connection')
    throw error
  }
}

const getContact = async (contactID, additionalTables) => {
  try {
    const contact = await ContactsCompiled.readContact(
      contactID,
      additionalTables,
    )

    console.log('Contact:', contact)

    return contact
  } catch (error) {
    console.error('Error Fetching Contact')
    throw error
  }
}

const getContactByConnection = async (connectionID, additionalTables) => {
  try {
    const contact = await ContactsCompiled.readContactByConnection(
      connectionID,
      additionalTables,
    )

    console.log('Contact:', contact)

    return contact
  } catch (error) {
    console.error('Error Fetching Contact')
    throw error
  }
}

const getAll = async (additionalTables) => {
  try {
    const contacts = await ContactsCompiled.readContacts(additionalTables)

    console.log('Got All Contacts')

    return contacts
  } catch (error) {
    console.error('Error Fetching Contacts')
    throw error
  }
}

const adminMessage = async (connectionMessage) => {
  try {
    console.log('Received new Admin Webhook Message', connectionMessage)

    if (connectionMessage.state === 'invitation') {
      console.log('State - Invitation')

      await Connections.createOrUpdateConnection(
        connectionMessage.connection_id,
        connectionMessage.state,
        connectionMessage.my_did,
        connectionMessage.alias,
        connectionMessage.request_id,
        connectionMessage.invitation_key,
        connectionMessage.invitation_mode,
        connectionMessage.invitation_url,
        connectionMessage.invitation,
        connectionMessage.accept,
        connectionMessage.initiator,
        connectionMessage.their_role,
        connectionMessage.their_did,
        connectionMessage.their_label,
        connectionMessage.routing_state,
        connectionMessage.inbound_connection_id,
        connectionMessage.error_msg,
      )
      // Broadcast the invitation in the invitation agent logic
      return
    }

    var contact

    if (connectionMessage.state === 'request') {
      console.log('State - Request')
      console.log('Creating Contact')

      contact = await Contacts.createContact(
        connectionMessage.their_label, // label
        {}, // meta_data
      )

      await Connections.updateConnection(
        connectionMessage.connection_id,
        connectionMessage.state,
        connectionMessage.my_did,
        connectionMessage.alias,
        connectionMessage.request_id,
        connectionMessage.invitation_key,
        connectionMessage.invitation_mode,
        connectionMessage.invitation_url,
        connectionMessage.invitation,
        connectionMessage.accept,
        connectionMessage.initiator,
        connectionMessage.their_role,
        connectionMessage.their_did,
        connectionMessage.their_label,
        connectionMessage.routing_state,
        connectionMessage.inbound_connection_id,
        connectionMessage.error_msg,
      )

      await Connections.linkContactAndConnection(
        contact.contact_id,
        connectionMessage.connection_id,
      )
    } else {
      console.log('State - Response or later')
      await Connections.updateConnection(
        connectionMessage.connection_id,
        connectionMessage.state,
        connectionMessage.my_did,
        connectionMessage.alias,
        connectionMessage.request_id,
        connectionMessage.invitation_key,
        connectionMessage.invitation_mode,
        connectionMessage.invitation_url,
        connectionMessage.invitation,
        connectionMessage.accept,
        connectionMessage.initiator,
        connectionMessage.their_role,
        connectionMessage.their_did,
        connectionMessage.their_label,
        connectionMessage.routing_state,
        connectionMessage.inbound_connection_id,
        connectionMessage.error_msg,
      )
    }

    // (mikekebert) Send a question to the new contact
    if (connectionMessage.state === 'active') {
      // QuestionAnswer.askQuestion(
      //   connectionMessage.connection_id,
      //   'Have you received a Medical Release credential from Cardea Lab before?',
      //   'Please select an option below:',
      //   [
      //     {text: 'I need a new credential'},
      //     {text: 'I already have a credential'},
      //   ],
      // )
      // (eldersonar) First, get connection current state name by id
      const currentState = await ConnectionStates.getConnectionStates(
        connectionMessage.connection_id,
        'action',
      )

      // (eldersonar) Writing connection state to DB
      await ConnectionStates.updateOrCreateConnectionState(
        connectionMessage.connection_id,
        'action',
        {
          step_name: currentState.value.step_name,
          data: {
            connectionMessageState: connectionMessage.state,
          },
        },
      )

      // (eldersonar) Trigger next step in rules engine
      ActionProcessor.actionComplete(connectionMessage.connection_id)
    }

    contact = await ContactsCompiled.readContactByConnection(
      connectionMessage.connection_id,
      ['Demographic'],
    )

    Websockets.sendMessageToAll('CONTACTS', 'CONTACTS', {contacts: [contact]})
  } catch (error) {
    console.error('Error Storing Connection Message')
    throw error
  }
}

module.exports = {
  adminMessage,
  fetchConnection,
  getContact,
  getAll,
  getContactByConnection,
}

// const QuestionAnswer = require('./questionAnswer')
const ActionProcessor = require('../governance/actionProcessor')