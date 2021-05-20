const demographics = require('./demographics')
const contacts = require('./contacts')
afterAll((done) => {
  sequelize.close()
  done()
})
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
const test_update_demographic = {
  email: 'test2@test.com',
  phone: '+1 208-710-1234',
  address: {
    address_1: '4321 Lane St.',
    address_2: '',
    city: 'Rexburg',
    state: 'Idaho',
    zip_code: '83440',
    country: 'United States',
  },
}
it('createContact for demographics', async () => {
  const contact = await contacts.createContact(test_label, test_meta_data)
  const data = await contacts.readBaseContact(contact.contact_id)
  expect(data.meta_data).toStrictEqual(test_meta_data)
  return (contact_id = contact.contact_id)
})
it('createDemographic on created contact', async () => {
  const {email, phone, address} = test_demographic
  await demographics.createDemographic(contact_id, email, phone, address)
  const data = await demographics.readDemographic(contact_id)
  expect(data).toMatchObject(test_demographic)
})
it('updateDemographic that was created', async () => {
  const {email, phone, address} = test_update_demographic
  await demographics.updateDemographic(contact_id, email, phone, address)
  const data = await demographics.readDemographic(contact_id)
  expect(data).toMatchObject(test_update_demographic)
})
it('createOrUpdateDemographic on created contact', async () => {
  const {email, phone, address} = test_demographic
  await demographics.createOrUpdateDemographic(
    contact_id,
    email,
    phone,
    address,
  )
  const data = await demographics.readDemographic(contact_id)
  expect(data).toMatchObject(test_demographic)
})
it('should readDemographics', async () => {
  const data = await demographics.readDemographics()
  expect(data).toEqual(
    expect.arrayContaining([expect.objectContaining(test_demographic)]),
  )
})
it('deleteDemographic from contact', async () => {
  await expect(
    demographics.deleteDemographic(contact_id),
  ).resolves.toBeUndefined()
})
it('deleteContact from demographics', async () => {
  await expect(contacts.deleteContact(contact_id)).resolves.toBeUndefined()
})
