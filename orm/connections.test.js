const connections = require('./connections')
const contacts = require('./contacts')

afterAll((done) => {
  sequelize.close()
  done()
})

const test_connection = {
  connection_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  state: 'invitation',
  my_did: 'WgWxqztrNooG92RXvxSTWv',
  alias: 'John Doe',
  request_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  invitation_key: 'H3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV',
  invitation_mode: 'once',
  invitation_url: 'http://192.168.56.101:8020/invite?c_i=eyJAdHlwZSI6Li4ufQ==',
  invitation: {},
  accept: 'auto',
  initiator: 'self',
  their_role: 'Patient',
  their_did: 'WgWxqztrNooG92RXvxSTWv',
  their_label: 'John Doe',
  routing_state: 'active',
  inbound_connection_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  error_msg: 'No DIDDoc provided; cannot connect to public DID',
}

const test_update_connection = {
  connection_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  state: 'active',
  my_did: 'WgWxqztrNooG92RXvxSTWv',
  alias: 'John J. Doe',
  request_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  invitation_key: 'H3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV',
  invitation_mode: 'once',
  invitation_url: 'http://192.168.56.101:8020/invite?c_i=eyJAdHlwZSI6Li4ufQ==',
  invitation: {},
  accept: 'auto',
  initiator: 'self',
  their_role: 'Patient',
  their_did: 'WgWxqztrNooG92RXvxSTWv',
  their_label: 'John J. Doe',
  routing_state: 'active',
  inbound_connection_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  error_msg: 'Updated error message just for fun',
}

const test_label = 'Jon Doe'
const test_meta_data = {
  first_name: 'John',
  last_name: 'Doe',
  mud: '1234098765',
}

it('should createConnection', async () => {
  const {
    connection_id,
    state,
    my_did,
    alias,
    request_id,
    invitation_key,
    invitation_mode,
    invitation_url,
    invitation,
    accept,
    initiator,
    their_role,
    their_did,
    their_label,
    routing_state,
    inbound_connection_id,
    error_msg,
  } = test_connection
  await connections.createConnection(
    connection_id,
    state,
    my_did,
    alias,
    request_id,
    invitation_key,
    invitation_mode,
    invitation_url,
    invitation,
    accept,
    initiator,
    their_role,
    their_did,
    their_label,
    routing_state,
    inbound_connection_id,
    error_msg,
  )
  const data = await connections.readConnection(connection_id)
  expect(data).toMatchObject(test_connection)
})

it('should createOrUpdateConnection', async () => {
  const {
    connection_id,
    state,
    my_did,
    alias,
    request_id,
    invitation_key,
    invitation_mode,
    invitation_url,
    invitation,
    accept,
    initiator,
    their_role,
    their_did,
    their_label,
    routing_state,
    inbound_connection_id,
    error_msg,
  } = test_update_connection
  await connections.createOrUpdateConnection(
    connection_id,
    state,
    my_did,
    alias,
    request_id,
    invitation_key,
    invitation_mode,
    invitation_url,
    invitation,
    accept,
    initiator,
    their_role,
    their_did,
    their_label,
    routing_state,
    inbound_connection_id,
    error_msg,
  )
  const data = await connections.readConnection(connection_id)
  expect(data).toMatchObject(test_update_connection)
})

it('should updateConnection', async () => {
  const {
    connection_id,
    state,
    my_did,
    alias,
    request_id,
    invitation_key,
    invitation_mode,
    invitation_url,
    invitation,
    accept,
    initiator,
    their_role,
    their_did,
    their_label,
    routing_state,
    inbound_connection_id,
    error_msg,
  } = test_connection
  await connections.updateConnection(
    connection_id,
    state,
    my_did,
    alias,
    request_id,
    invitation_key,
    invitation_mode,
    invitation_url,
    invitation,
    accept,
    initiator,
    their_role,
    their_did,
    their_label,
    routing_state,
    inbound_connection_id,
    error_msg,
  )
  const data = await connections.readConnection(connection_id)
  expect(data).toMatchObject(test_connection)
})

it('createContact for connections', async () => {
  const contact = await contacts.createContact(test_label, test_meta_data)
  const data = await contacts.readBaseContact(contact.contact_id)
  expect(data.meta_data).toStrictEqual(test_meta_data)
  return (contact_id = contact.contact_id)
})

it('should linkContactAndConnection', async () => {
  const {connection_id} = test_connection
  await connections.linkContactAndConnection(contact_id, connection_id)
  const data = await connections.readConnection(connection_id)
  expect(data.Contacts[0]).toHaveProperty('contact_id', contact_id)
})

it('should readConnections to retrieve all connections', async () => {
  const {connection_id} = test_connection
  const data = await connections.readConnections()
  expect(data).toEqual(
    expect.arrayContaining([
      expect.objectContaining({connection_id: connection_id}),
    ]),
  )
})

it('should readInvitations and retrieve all invitations', async () => {
  const {connection_id} = test_connection
  const data = await connections.readInvitations()
  expect(data).toEqual(
    expect.arrayContaining([
      expect.objectContaining({connection_id: connection_id}),
    ]),
  )
})

it('should deleteConnection', async () => {
  const {connection_id} = test_connection
  await expect(
    connections.deleteConnection(connection_id),
  ).resolves.toBeUndefined()
})
it('should deleteConnection', async () => {
  const {connection_id} = test_connection
  await expect(
    connections.deleteConnection(connection_id),
  ).resolves.toBeUndefined()
})

it('deleteContact from connections', async () => {
  await expect(contacts.deleteContact(contact_id)).resolves.toBeUndefined()
})
