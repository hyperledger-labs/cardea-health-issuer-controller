const sendAdminMessage = require('./transport')

// Fetch existing Credential Definitions IDs request message to be sent to the Cloud Agent Adminstration API
const createdCredDefIDs = async (
  cred_def_id,
  issuer_did,
  schema_id,
  schema_issuer_did,
  schema_name,
  schema_version,
) => {
  try {
    console.log('Fetching Created Credential Definition IDs')

    const credDefs = await sendAdminMessage(
      'get',
      `/credential-definitions/created`,
      {
        cred_def_id,
        issuer_did,
        schema_id,
        schema_issuer_did,
        schema_name,
        schema_version,
      },
      {},
    )

    return credDefs.credential_definition_ids
  } catch (error) {
    console.error('Fetching Credential Definitions Error')
    throw error
  }
}

// Fetch a Credential Definition via the Admin API
const fetchCredDef = async (cred_def_id) => {
  try {
    console.log('Fetching Credential Definition')

    const credDef = await sendAdminMessage(
      'get',
      `/credential-definitions/${cred_def_id}`,
      {},
      {},
    )

    return credDef.credential_definition
  } catch (error) {
    console.error('Fetching Credential Definitions Error')
    throw error
  }
}

// Create a Credential Definition based off a schema via the Admin API
const createCredDef = async (
  tag,
  schema_id,
  revocation_registry_size = 0, // value must be integer between 4 and 32768 inclusively. Send only if support_revocation is set to true. We would want to select a size probably somewhere in the range of 100 but it's highly dependent on how many credentials the issuer intends to issue
  support_revocation = false, // Send only if support_revocation is set to true
) => {
  try {
    console.log('Creating Credential Definition')

    const credDefID = await sendAdminMessage(
      'post',
      `/credential-definitions`,
      {},
      {tag, schema_id}, // revocation_registry_size, support_revocation
    )

    return credDefID.credential_definition_id
  } catch (error) {
    console.error('Creating Credential Definitions Error')
    throw error
  }
}

module.exports = {
  createCredDef,
  createdCredDefIDs,
  fetchCredDef,
}
