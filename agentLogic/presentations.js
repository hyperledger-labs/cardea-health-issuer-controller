const {v4: uuid} = require('uuid')

const ControllerError = require('../errors.js')

const AdminAPI = require('../adminAPI')
const Websockets = require('../websockets')
const Contacts = require('./contacts')
const ConnectionStates = require('../agentLogic/connectionStates')
const Credentials = require('./credentials')
const Demographics = require('./demographics')
const ActionProcessor = require('../governance/actionProcessor')
const Presentations = require('../orm/presentations')

const Governance = require('./governance')

// (eldersonar) Request identity proof
const requestIdentityPresentation = async (connectionID) => {
  console.log(`Requesting Presentation from Connection: ${connectionID}`)

  let attributes = [
    'patient_surnames',
    'patient_given_names',
    'patient_date_of_birth',
    'patient_gender_legal',
    'patient_street_address',
    'patient_city',
    'patient_state_province_region',
    'patient_postalcode',
    'patient_country',
    'patient_phone',
    'patient_email',
  ]

  // console.log(attributes)

  const result = AdminAPI.Presentations.requestProof(connectionID, attributes)
  console.log(result)
  return result
}

const requestPresentation = async (connectionID) => {
  console.log(`Requesting Presentation from Connection: ${connectionID}`)

  let attributes = [
    'patient_surnames',
    'patient_given_names',
    'patient_date_of_birth',
    'patient_gender_legal',
    'patient_street_address',
    'patient_city',
    'patient_state_province_region',
    'patient_postalcode',
    'patient_country',
    'patient_phone',
    'patient_email',
    'medical_release_id',
  ]

  // console.log(attributes)

  const result = AdminAPI.Presentations.requestPresentation(
    connectionID,
    attributes,
  )

  return result
}

const adminMessage = async (message) => {
  console.log('Received Presentations Message', message)

  let endorserDID = null
  const agentDID = await Governance.getDID()

  // Get cred def id if has one
  if (message.presentation && message.presentation.identifiers.length) {
    endorserDID = message.presentation.identifiers[0].cred_def_id
      .split(':', 1)
      .toString()
  }

  if (message.state === 'verified') {
    let values = ''

    // (mikekebert) Check to see if we received the presentation of a verified credential (Medical_Release) and the DID is recognized
    if (
      ((message.presentation.requested_proof.revealed_attrs &&
        Object.keys(message.presentation.requested_proof.revealed_attrs)
          .length > 0) ||
        (message.presentation.requested_proof.revealed_attr_groups &&
          Object.keys(message.presentation.requested_proof.revealed_attr_groups)
            .length > 0)) &&
      (message.presentation.requested_proof.revealed_attrs.medical_release_id !=
        null ||
        message.presentation.requested_proof.revealed_attr_groups
          .medical_release_id != null) &&
      endorserDID === agentDID
    ) {
      console.log('')
      console.log('Participant was successfully validated')
      console.log('=================================================')
      console.log('MEDICAL RELEASE PROOF')
      console.log('=================================================')
      console.log('')
      // (mikekebert) Check the data format to see if the presentation requires the referrant pattern
      if (message.presentation.requested_proof.revealed_attr_groups) {
        values =
          message.presentation.requested_proof.revealed_attr_groups[
            Object.keys(
              message.presentation.requested_proof.revealed_attr_groups,
            )[0] // Get first group available
          ].values // TODO: this needs to be a for-in loop or similar later
      } else {
        values = message.presentation.requested_proof.revealed_attrs
      }

      let contact = await Contacts.getContactByConnection(
        message.connection_id,
        [],
      )

      // (eldersonar) Create demographics
      await Demographics.updateOrCreateDemographic(
        contact.contact_id,
        values.patient_surnames.raw,
        values.patient_given_names.raw,
        values.patient_date_of_birth.raw,
        values.patient_gender_legal.raw,
        values.patient_street_address.raw,
        values.patient_city.raw,
        values.patient_state_province_region.raw,
        values.patient_postalcode.raw,
        values.patient_country.raw,
        values.patient_phone.raw,
        values.patient_email.raw,
        values.medical_release_id.raw,
      )

      // (eldersonar) First, get connection current state name by id
      const currentState = await ConnectionStates.getConnectionStates(
        message.connection_id,
        'action',
      )

      // (eldersonar) Writing connection state to DB
      await ConnectionStates.updateOrCreateConnectionState(
        message.connection_id,
        'action',
        {
          step_name: currentState.value.step_name,
          data: {
            presentationMessageState: message.state,
            // (eldersonar) TODO: Remove after development and testing
            // Add test decision here and change the next step on the "request-presentation" action in the governance file
            // We can handle strings, numbers and booleans
            // decision: 55.123
          },
        },
      )

      // (eldersonar) Trigger next step in rules engine
      ActionProcessor.actionComplete(message.connection_id)
    }
    // (mikekebert) Check to see if we received the presentation of a verified credential (Medical_Release) but the DID is not recognized
    else if (
      ((message.presentation.requested_proof.revealed_attrs &&
        Object.keys(message.presentation.requested_proof.revealed_attrs)
          .length > 0) ||
        (message.presentation.requested_proof.revealed_attr_groups &&
          Object.keys(message.presentation.requested_proof.revealed_attr_groups)
            .length > 0)) &&
      (message.presentation.requested_proof.revealed_attrs.medical_release_id !=
        null ||
        message.presentation.requested_proof.revealed_attr_groups
          .medical_release_id != null) &&
      endorserDID !== agentDID
    ) {
      // (eldersonar) Send a basic message
      await AdminAPI.Connections.sendBasicMessage(message.connection_id, {
        content:
          "We're sorry, but we don't currently recognize the issuer of your credential and cannot approve it at this time.",
      })
    } else {
      console.log('')
      console.log('=================================================')
      console.log('MEDICAL RELEASE PRESENTATION')
      console.log('=================================================')
      console.log('')
      // (mikekebert) We received self-attested demographic data
      values = {}
      values = Object.assign(
        values,
        message.presentation.requested_proof.self_attested_attrs,
      )
      // (kimebert) in some cases data may come from other credentials
      for (var key in message.presentation.requested_proof.revealed_attrs) {
        values[key] =
          message.presentation.requested_proof.revealed_attrs[key].raw
      }

      let contact = await Contacts.getContactByConnection(
        message.connection_id,
        [],
      )

      medical_release_id = uuid()

      // (eldersonar) Create demographics
      await Demographics.updateOrCreateDemographic(
        contact.contact_id,
        values.patient_surnames,
        values.patient_given_names,
        values.patient_date_of_birth,
        values.patient_gender_legal,
        values.patient_street_address,
        values.patient_city,
        values.patient_state_province_region,
        values.patient_postalcode,
        values.patient_country,
        values.patient_phone,
        values.patient_email,
        medical_release_id,
      )

      // (mikekebert) For self-attested presentation, we also need to issue the Medical_Release credential
      medical_release_signed_date = new Date()
      medical_release_signed_date = Math.floor(
        medical_release_signed_date.getTime() / 1000,
      ).toString()

      const attributes = [
        {
          name: 'mpid',
          value: '',
        },
        {
          name: 'patient_local_id',
          value: '',
        },
        {
          name: 'patient_surnames',
          value: values.patient_surnames,
        },
        {
          name: 'patient_given_names',
          value: values.patient_given_names,
        },
        {
          name: 'patient_date_of_birth',
          value: values.patient_date_of_birth,
        },
        {
          name: 'patient_gender_legal',
          value: values.patient_gender_legal,
        },
        {
          name: 'patient_street_address',
          value: values.patient_street_address,
        },
        {
          name: 'patient_city',
          value: values.patient_city,
        },
        {
          name: 'patient_state_province_region',
          value: values.patient_state_province_region,
        },
        {
          name: 'patient_postalcode',
          value: values.patient_postalcode,
        },
        {
          name: 'patient_country',
          value: values.patient_country,
        },
        {
          name: 'patient_phone',
          value: values.patient_phone,
        },
        {
          name: 'patient_email',
          value: values.patient_email,
        },
        {
          name: 'medical_release_id',
          value: medical_release_id,
        },
        {
          name: 'medical_release_signed_date',
          value: medical_release_signed_date,
        },
        {
          name: 'medical_release_form_location',
          value: '',
        },
        {
          name: 'medical_release_covered_data',
          value: '',
        },
        {
          name: 'medical_release_covered_party',
          value: '',
        },
        {
          name: 'medical_release_purposes',
          value: '',
        },
        {
          name: 'medical_release_requestor',
          value: '',
        },
        {
          name: 'medical_release_requestor_relationship',
          value: '',
        },
        {
          name: 'credential_issuer_name',
          value: 'Cardea Lab',
        },
        {
          name: 'credential_issue_date',
          value: medical_release_signed_date,
        },
      ]

      // console.log(attributes)

      let newCredential = {
        connectionID: message.connection_id,
        schemaID: 'RuuJwd3JMffNwZ43DcJKN1:2:Medical_Release:1.1',
        schemaVersion: '1.1',
        schemaName: 'Medical_Release',
        schemaIssuerDID: 'RuuJwd3JMffNwZ43DcJKN1',
        comment: '',
        attributes: attributes,
      }

      // // (mikekebert) Request issuance of the Medical_Release credential
      // await Credentials.autoIssueCredential(
      //   newCredential.connectionID,
      //   undefined,
      //   undefined,
      //   newCredential.schemaID,
      //   newCredential.schemaVersion,
      //   newCredential.schemaName,
      //   newCredential.schemaIssuerDID,
      //   newCredential.comment,
      //   newCredential.attributes,
      // )

      // (eldersonar) First, get connection current state name by id
      const currentState = await ConnectionStates.getConnectionStates(
        message.connection_id,
        'action',
      )

      // (eldersonar) Writing connection state to DB
      await ConnectionStates.updateOrCreateConnectionState(
        message.connection_id,
        'action',
        {
          step_name: currentState.value.step_name,
          data: {
            presentationMessageState: message.state,
          },
        },
      )

      // (eldersonar) Writing connection data to DB
      await ConnectionStates.updateOrCreateConnectionState(
        message.connection_id,
        'form_data',
        {
          credential: newCredential,
        },
      )

      // (eldersonar) Trigger next step in rules engine
      ActionProcessor.actionComplete(message.connection_id)
    }
  } else if (message.state === null) {
    // (mikekebert) Send a basic message saying the verification failed for technical reasons
    console.log('Validation failed for technical reasons')
    await AdminAPI.Connections.sendBasicMessage(message.connection_id, {
      content: 'UNVERIFIED',
    })
  }
}

const createPresentationReports = async (presentation) => {
  try {
    const presentationReport = await Presentations.createPresentationReports(
      presentation.presentation_exchange_id,
      presentation.trace,
      presentation.connection_id,
      presentation.role,
      presentation.created_at,
      presentation.updated_at,
      JSON.stringify(presentation.presentation_request_dict),
      presentation.initiator,
      JSON.stringify(presentation.presentation_request),
      presentation.state,
      presentation.thread_id,
      presentation.auto_present,
      JSON.stringify(presentation.presentation),
    )

    // Broadcast the message to all connections
    Websockets.sendMessageToAll('PRESENTATIONS', 'PRESENTATION_REPORTS', {
      presentation_reports: [presentationReport],
    })
  } catch (error) {
    console.log('Error creating presentation reports:')
    throw error
  }
}

const updatePresentationReports = async (presentation) => {
  try {
    const presentationReport = await Presentations.updatePresentationReports(
      presentation.presentation_exchange_id,
      presentation.trace,
      presentation.connection_id,
      presentation.role,
      presentation.created_at,
      presentation.updated_at,
      JSON.stringify(presentation.presentation_request_dict),
      presentation.initiator,
      JSON.stringify(presentation.presentation_request),
      presentation.state,
      presentation.thread_id,
      presentation.auto_present,
      JSON.stringify(presentation.presentation),
    )

    // Broadcast the message to all connections
    Websockets.sendMessageToAll('PRESENTATIONS', 'PRESENTATION_REPORTS', {
      presentation_reports: [presentationReport],
    })
  } catch (error) {
    console.log('Error updating presentation reports:')
    throw error
  }
}

const getAll = async () => {
  try {
    console.log('Fetching presentation reports!')
    const presentationReports = await Presentations.readPresentations()

    return presentationReports
  } catch (error) {
    console.log('Error fetching presentation reports:')
    throw error
  }
}

module.exports = {
  adminMessage,
  requestPresentation,
  requestIdentityPresentation,
  createPresentationReports,
  updatePresentationReports,
  getAll,
}
