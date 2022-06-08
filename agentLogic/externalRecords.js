const Config = require('../config.js')

const logger = Config.logger

var externalModule = null
var schemas = null

const init = async (app) => {
  var time = Date.now()

  logger.info({msg: 'Init externalRecords...'})

  // Do init...
  try {
    if (Config.externalRecords.module != null) {
      externalModule = require(Config.externalRecords.module)

      schemas = Config.externalRecords.schemas

      await externalModule.init(
        app,
        module.exports,
        Config.externalRecords.moduleConf,
        Config.externalRecords.schemas,
      )
    }
  } catch (error) {
    logger.error({msg: 'init()', error: error, time: Date.now() - time})
  } finally {
    logger.info({msg: 'init()', time: Date.now() - time})
  }
}

const matchRequest = async (demographics) => {
  var time = Date.now()

  try {
    if (externalModule != null) {
      /**
      A function to retrieve a contact ID (cid) given a set of demographics
      @param demographics A collection of contact demographics
      @returns A contact ID (cid)
      @throws MatchingError Throws a MatchingError in matching demographics to a contact ID (cid), most often thrown if no match or multiple matches are found
      */

      return await externalModule.matchRequest(demographics)
    } else {
      return null
    }
  } catch (error) {
    logger.error({
      msg: 'matchRequest()',
      error: error,
      time: Date.now() - time,
      demographics: demographics,
    })
  } finally {
    logger.info({
      msg: 'matchRequest()',
      time: Date.now() - time,
      demographics: demographics,
    })
  }
}

const recordsRequest = async (cid, schema, recordID) => {
  var time = Date.now()

  try {
    if (externalModule != null) {
      /**
      A function to retrieve the most recent health record belonging to a contact ID (cid) based off of a given schema or a provided recordID
      @param cid A contact ID (cid)
      @param schemaID A schema ID to identify the health record being requested
      @param recordID An optional parameter to specify the specific record being requested
      @returns A record, or null if no record is found
      */

      return await externalModule.recordsRequest(cid, schema, recordID)
    } else {
      return null
    }
  } catch (error) {
    logger.error({
      msg: 'recordsRequest()',
      error: error,
      time: Date.now() - time,
      cid: cid,
      schema: schema,
      recordID: recordID,
    })
  } finally {
    logger.info({
      msg: 'recordsRequest()',
      time: Date.now() - time,
      cid: cid,
      schema: schema,
      recordID: recordID,
    })
  }
}

const recordsSubscribe = async (cid, schema, returnURL, returnAPIKey) => {
  var time = Date.now()

  try {
    if (externalModule != null) {
      /**
      A function to subscribe to all new health records that match a given schema ID. This function will also supply a return API route for new records to be posted to.
      @param cid A contact ID (cid)
      @param schemaID A schema ID to identify the health records to subscribe to
      @param returnURL A URL to specify where to post new records to
      @param ReturnAPIKey An API Key to authenticate new record postings
      @returns Subscription creation success
      @throws NotImplemented Throws Nconsole.log("externalRecords...")
  console.log(externalModule)otImplemented if subscription features are not implemented
      */

      return await externalModule.recordsSubscribe(
        cid,
        schema,
        returnURL,
        returnAPIKey,
      )
    } else {
      return false
    }
  } catch (error) {
    logger.error({
      msg: 'recordsSubscribe()',
      error: error,
      time: Date.now() - time,
      cid: cid,
      schema: schema,
      returnURL: returnURL,
      returnAPIKey: returnAPIKey,
    })
  } finally {
    logger.info({
      msg: 'recordsSubscribe()',
      time: Date.now() - time,
      cid: cid,
      schema: schema,
      returnURL: returnURL,
      returnAPIKey: returnAPIKey,
    })
  }
}

const recordsUnsubscribe = async (cid, schema) => {
  var time = Date.now()

  try {
    if (externalModule != null) {
      /**
      A function to unsubscribe to all new health records that match a given schema ID.
      @param cid A contact ID (cid)
      @param schemaID A schema ID to identify the health records to subscribe to
      @returns Subscription removal success
      @throws NotImplemented Throws NotImplemented if subscription features are not implemented
      */

      return await externalModule.recordsUnsubscribe(cid, schema)
    } else {
      return false
    }
  } catch (error) {
    logger.error({
      msg: 'recordsUnsubscribe()',
      error: error,
      time: Date.now() - time,
      cid: cid,
      schema: schema,
    })
  } finally {
    logger.info({
      msg: 'recordsUnsubscribe()',
      time: Date.now() - time,
      cid: cid,
      schema: schema,
    })
  }
}

const issueCredential = async (cid, externalRecordId, schemaId, data) => {
  var time = Date.now()

  try {
    var externalContacts = await ExternalContact.ExternalContact.findAll({
      where: {
        external_contact_id: cid,
      },
    })

    if (externalContacts == null) {
      logger.info({
        msg: 'No contact found!',
        cid: cid,
        externalRecordId: externalRecordId,
        schemaId: schemaId,
      })

      return
    }

    for (i = 0; i < externalContacts.length; i++) {
      var externalContact = externalContacts[i]

      const contact = await ContactsCompiled.readContact(
        externalContact.contact_id,
        ['Demographic'],
      )

      if (contact == null) {
        logger.info({
          msg: 'Contact is null!',
          cid: cid,
          externalRecordId: externalRecordId,
          schemaId: schemaId,
        })

        continue
      }

      for (j = 0; j < contact.Connections.length; j++) {
        var connection = contact.Connections[j]

        try {
          var externalContactCredential = await ExternalContactCredential.ExternalContactCredential.findOne(
            {
              where: {
                external_contact_id: cid,
                connection_id: connection.connection_id,
                external_record_id: externalRecordId,
                schema_id: schemaId,
              },
            },
          )

          if (externalContactCredential != null) {
            continue
          }

          var cred = await Credentials.autoIssueCredential(
            connection.connection_id,
            undefined,
            undefined,
            schemaId,
            schemaId.split(':')[3],
            schemaId.split(':')[2],
            schemaId.split(':')[0],
            'Auto generated credential',
            data['result_attributes'],
          )

          var external_contact_credential = {
            external_contact_id: cid,
            connection_id: connection.connection_id,
            external_record_id: externalRecordId,
            schema_id: schemaId,
            credential_exchange_id: cred.credential_definition_id,
          }

          await ExternalContactCredential.ExternalContactCredential.create(
            external_contact_credential,
          )
        } catch (error) {
          logger.error({
            msg: error,
            cid: cid,
            externalRecordId: externalRecordId,
            schemaId: schemaId,
            connection_id: connection.connection_id,
          })
        }
      }
    }
  } catch (error) {
    logger.error({
      msg: 'issueCredential()',
      error: error,
      time: Date.now() - time,
      cid: cid,
      externalRecordId: externalRecordId,
      schemaId: schemaId,
    })
  } finally {
    logger.info({
      msg: 'issueCredential()',
      time: Date.now() - time,
      cid: cid,
      externalRecordId: externalRecordId,
      schemaId: schemaId,
    })
  }
}

const internalContactUpdateSchema = async (
  contact,
  contact_id,
  cid,
  schema,
) => {
  // Subscribe to future records
  await recordsSubscribe(cid, schema['schema_id'], null, null)

  // Check for existing records
  var record_results = await recordsRequest(cid, schema['schema_id'])

  if (record_results == null) {
    logger.info({msg: 'No record_result!', contact_id: contact_id})
    return
  }

  for (var j = 0; j < record_results.length; j++) {
    var record_result = record_results[j]

    var connection = contact.Connections[0]

    var attributes = []

    for (var i = 0; i < schema['attributes'].length; i++) {
      var name = schema['attributes'][i]
      attributes.push({
        name: name,
        value: record_result['result_attributes'][name],
      })
    }

    try {
      var cred = await Credentials.autoIssueCredential(
        connection.connection_id,
        undefined,
        undefined,
        schema['schema_id'],
        schema['schema_id'].split(':')[3],
        schema['schema_id'].split(':')[2],
        schema['schema_id'].split(':')[0],
        'Auto generated credential',
        attributes,
      )

      var external_contact_credential = {
        external_contact_id: cid,
        connection_id: connection.connection_id,
        external_record_id:
          record_result['result_attributes'][schema['record_id']],
        schema_id: schema['schema_id'],
        credential_exchange_id: cred.credential_definition_id,
      }

      await ExternalContactCredential.ExternalContactCredential.create(
        external_contact_credential,
      )
    } catch (error) {
      // TODO something interesting with this error
      logger.error({
        msg: error,
        contact_id: contact_id,
        connection_id: connection.connection_id,
      })
    }
  }
}

const internalContactUpdate = async (contact_id) => {
  logger.info({msg: 'internalContactUpdate', contact_id: contact_id})

  if (externalModule == null) {
    logger.info({msg: 'External module not configured!'})

    return
  }

  if (contact_id == null) {
    logger.info({msg: 'contact_id is null!'})

    return
  }

  const contact = await ContactsCompiled.readContact(contact_id, [
    'Demographic',
  ])

  if (contact == null) {
    logger.info({msg: 'contact is null!'})

    return
  }
  var externalContact = await ExternalContact.ExternalContact.findOne({
    where: {
      contact_id: contact_id,
    },
  })

  if (externalContact != null) {
    logger.info({msg: 'Already registered contact!', contact_id: contact_id})
    return
  }

  if (contact.Demographic == null) {
    logger.info({msg: 'No demographic!', contact_id: contact_id})

    return
  }

  demographics = {
    first_name: contact.Demographic.dataValues['given_names'],
    middle_name: '',
    last_name: contact.Demographic.dataValues['surnames'],
    date_of_birth: contact.Demographic.dataValues['date_of_birth'],
    gender: contact.Demographic.dataValues['gender_legal'],
    address: {
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
    },
    phone: contact.Demographic.dataValues['phone'],
  }

  // Do a matchRequest
  cid = await matchRequest(demographics)

  externalContact = {
    contact_id: contact_id,
    external_contact_id: cid,
  }

  await ExternalContact.ExternalContact.create(externalContact)

  var schema_keys = Object.keys(schemas)

  for (var i = 0; i < schema_keys.length; i++) {
    await internalContactUpdateSchema(
      contact,
      contact_id,
      cid,
      schemas[schema_keys[i]],
    )
  }
}

module.exports = {
  init,
  matchRequest,
  recordsRequest,
  recordsSubscribe,
  recordsUnsubscribe,
  internalContactUpdate,
  issueCredential,
  logger,
}

const Contacts = require('./contacts.js')
const Credentials = require('./credentials.js')

let ContactsCompiled = require('../orm/contactsCompiled.js')
let ExternalContact = require('../orm/externalContacts.js')
let ExternalContactCredential = require('../orm/externalContactCredentials.js')
