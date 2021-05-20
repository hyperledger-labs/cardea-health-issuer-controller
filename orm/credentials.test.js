const credentials = require('./credentials')

afterAll((done) => {
  sequelize.close()
  done()
})

const test_credential = {
  credential_exchange_id: 'asdfasdfsdfdsf',
  credential_id: '2fa85f64-5717-4562-b3fc-2c963f66b0b7',
  credential: {},
  raw_credential: {},
  revocation_id: 'lasjadsfasdfe',
  connection_id: 'asfasfsadfsdfsa',
  state: 'active',
  role: 'issuer',
  initiator: 'self',
  thread_id: 'asdfasdfsafsdf',
  parent_thread_id: 'asdfffadsfsdfs',
  schema_id: '2fa85f64-5717-4562-b3fc-2c963f66b0b7:schema_name:1.0',
  credential_definition_id:
    '2fa85f64-5717-4562-b3fc-2c963f66b0b7:credential_definition:1.0',
  revoc_reg_id: '2342342343',
  credential_proposal_dict: {},
  credential_offer: {},
  credential_offer_dict: {},
  credential_request: {},
  credential_request_metadata: {},
  auto_issue: true,
  auto_offer: true,
  auto_remove: true,
  error_msg: 'Sample error message goes here',
  trace: true,
}
const test_update_credential = {
  credential_exchange_id: 'asdfasdfsdfdsf',
  credential_id: '2fa85f64-5717-4562-b3fc-2c963f66b0b8',
  credential: {},
  raw_credential: {},
  revocation_id: 'fffffffffffffff',
  connection_id: 'asfasfsadfsdfsa',
  state: 'active',
  role: 'issuer',
  initiator: 'self',
  thread_id: 'asdfasdfsafsdf',
  parent_thread_id: 'asdfffadsfsdfs',
  schema_id: '2fa85f64-5717-4562-b3fc-2c963f66b0b7:schema_name:1.0',
  credential_definition_id:
    '2fa85f64-5717-4562-b3fc-2c963f66b0b7:credential_definition:1.0',
  revoc_reg_id: '2342342343',
  credential_proposal_dict: {},
  credential_offer: {},
  credential_offer_dict: {},
  credential_request: {},
  credential_request_metadata: {},
  auto_issue: false,
  auto_offer: false,
  auto_remove: false,
  error_msg: 'Sample error message goes here',
  trace: true,
}

it('should createCredential', async () => {
  const {
    credential_exchange_id,
    credential_id,
    credential,
    raw_credential,
    revocation_id,
    connection_id,
    state,
    role,
    initiator,
    thread_id,
    parent_thread_id,
    schema_id,
    credential_definition_id,
    revoc_reg_id,
    credential_proposal_dict,
    credential_offer,
    credential_offer_dict,
    credential_request,
    credential_request_metadata,
    auto_issue,
    auto_offer,
    auto_remove,
    error_msg,
    trace,
  } = test_credential
  await credentials.createCredential(
    credential_exchange_id,
    credential_id,
    credential,
    raw_credential,
    revocation_id,
    connection_id,
    state,
    role,
    initiator,
    thread_id,
    parent_thread_id,
    schema_id,
    credential_definition_id,
    revoc_reg_id,
    credential_proposal_dict,
    credential_offer,
    credential_offer_dict,
    credential_request,
    credential_request_metadata,
    auto_issue,
    auto_offer,
    auto_remove,
    error_msg,
    trace,
  )
  const data = await credentials.readCredential(credential_exchange_id)
  expect(data).toMatchObject(test_credential)
})

it('should readCredentials and retrieve all credentials', async () => {
  const data = await credentials.readCredentials()
  expect(data).toEqual(
    expect.arrayContaining([expect.objectContaining(test_credential)]),
  )
})

it('should updateCredential', async () => {
  const {
    credential_exchange_id,
    credential_id,
    credential,
    raw_credential,
    revocation_id,
    connection_id,
    state,
    role,
    initiator,
    thread_id,
    parent_thread_id,
    schema_id,
    credential_definition_id,
    revoc_reg_id,
    credential_proposal_dict,
    credential_offer,
    credential_offer_dict,
    credential_request,
    credential_request_metadata,
    auto_issue,
    auto_offer,
    auto_remove,
    error_msg,
    trace,
  } = test_update_credential
  await credentials.updateCredential(
    credential_exchange_id,
    credential_id,
    credential,
    raw_credential,
    revocation_id,
    connection_id,
    state,
    role,
    initiator,
    thread_id,
    parent_thread_id,
    schema_id,
    credential_definition_id,
    revoc_reg_id,
    credential_proposal_dict,
    credential_offer,
    credential_offer_dict,
    credential_request,
    credential_request_metadata,
    auto_issue,
    auto_offer,
    auto_remove,
    error_msg,
    trace,
  )
  const data = await credentials.readCredential(credential_exchange_id)
  expect(data).toMatchObject(test_update_credential)
})

it('deleteCredential', async () => {
  const {credential_exchange_id} = test_credential
  await expect(
    credentials.deleteCredential(credential_exchange_id),
  ).resolves.toBeUndefined()
})
