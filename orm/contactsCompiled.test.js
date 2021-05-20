const connections = require('./connections')
const contacts = require('./contacts')
const demographics = require('./demographics')
const passports = require('./passports')
const contactsCompiled = require('./contactsCompiled')
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

const test_label = 'Jon Doe'
const test_meta_data = {
  first_name: 'John',
  last_name: 'Doe',
  mud: '1234098765',
}
const test_demographic = {
  email: 'test1@test.com',
  phone: '+1 208-710-0000',
  address: {
    address_1: '1234 Lane St.',
    address_2: '',
    city: 'Rexburg',
    state: 'Idaho',
    zip_code: '83440',
    country: 'United States',
  },
}
const test_passport = {
  passport_number: '31195855',
  surname: 'Gupta',
  given_names: 'Rahul',
  sex: 'M',
  date_of_birth: '22 Jan 1973',
  place_of_birth: 'Mumbai, India',
  nationality: 'United States of America',
  date_of_issue: '18 Sep 2009',
  date_of_expiration: '17 Sep 2018',
  type: 'P',
  code: 'USA',
  authority: 'United States Department of State',
  photo:
    'data:image/jpeg;base64,R0lGODlhDAAMAKIFAF5LAP/zxAAAANyuAP/gaP///wAAAAAAACH5BAEAAAUALAAAAAAMAAwAAAMlWLPcGjDKFYi9lxKBOaGcF35DhWHamZUW0K4mAbiwWtuf0uxFAgA7',
}
it('should createConnection for contactsCompiled', async () => {
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
it('createContact for contactsCompiled', async () => {
  const contact = await contacts.createContact(test_label, test_meta_data)
  const data = await contacts.readBaseContact(contact.contact_id)
  expect(data.meta_data).toStrictEqual(test_meta_data)
  return (contact_id = contact.contact_id)
})

it('should linkContactAndConnection for contactsCompiled', async () => {
  const {connection_id} = test_connection
  await connections.linkContactAndConnection(contact_id, connection_id)
  const data = await connections.readConnection(connection_id)
  console.log('Connection linked: ', data)
  expect(data.Contacts[0]).toHaveProperty('contact_id', contact_id)
})
it('createDemographic for contactsCompiled', async () => {
  const {email, phone, address} = test_demographic
  await demographics.createDemographic(contact_id, email, phone, address)
  const data = await demographics.readDemographic(contact_id)
  expect(data).toMatchObject(test_demographic)
})
it('createPassport for contactsCompiled', async () => {
  const {
    passport_number,
    surname,
    given_names,
    sex,
    date_of_birth,
    place_of_birth,
    nationality,
    date_of_issue,
    date_of_expiration,
    type,
    code,
    authority,
    photo,
  } = test_passport
  const blob = await passports.createBlob(photo)
  await passports.createPassport(
    contact_id,
    passport_number,
    surname,
    given_names,
    sex,
    date_of_birth,
    place_of_birth,
    nationality,
    date_of_issue,
    date_of_expiration,
    type,
    code,
    authority,
    blob,
  )
  const passport = await passports.readPassport(contact_id)
  const new_photo = await passports.blobToBase64(passport.photo)
  expect(passport).toHaveProperty('passport_number', passport_number)
  expect(new_photo).toEqual(test_passport.photo)
})

it('should readContacts from contactsCompiled', async () => {
  const {connection_id} = test_connection
  const data = await contactsCompiled.readContacts()
  console.log('read contactsCompiled: ', data)
  expect(data[0].Connections).toEqual(
    expect.arrayContaining([
      expect.objectContaining({connection_id: connection_id}),
    ]),
  )
})

it('should readContact by id from contactsCompiled', async () => {
  const data = await contactsCompiled.readContact(contact_id)
  const {connection_id} = test_connection
  console.log(data)
  expect(data.Connections).toEqual(
    expect.arrayContaining([
      expect.objectContaining({connection_id: connection_id}),
    ]),
  )
})

it('should readContactByConnection', async () => {
  const {connection_id} = test_connection
  const data = await contactsCompiled.readContactByConnection(connection_id)
  expect(data.Connections).toEqual(
    expect.arrayContaining([
      expect.objectContaining({connection_id: connection_id}),
    ]),
  )
})

it('deletePassport from contactsCompiled', async () => {
  await expect(passports.deletePassport(contact_id)).resolves.toBeUndefined()
})
it('deleteDemographic from contactsCompiled', async () => {
  await expect(
    demographics.deleteDemographic(contact_id),
  ).resolves.toBeUndefined()
})
it('should deleteConnection from contactsCompiled', async () => {
  const {connection_id} = test_connection
  await expect(
    connections.deleteConnection(connection_id),
  ).resolves.toBeUndefined()
})
it('deleteContact from contactsCompiled', async () => {
  await expect(contacts.deleteContact(contact_id)).resolves.toBeUndefined()
})
