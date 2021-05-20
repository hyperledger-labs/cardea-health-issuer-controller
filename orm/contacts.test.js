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

const second_test_label = 'Jill Dill'
const second_test_meta_data = {
  first_name: 'Jill',
  last_name: 'Dill',
  mud: '1234098766',
}

it('createContact with test label and test meta data', async () => {
  const contact = await contacts.createContact(test_label, test_meta_data)
  const data = await contacts.readBaseContact(contact.contact_id)
  expect(data.meta_data).toStrictEqual(test_meta_data)
  return (contact_id = contact.contact_id)
})

it('readBaseContacts to retrieve all contacts', async () => {
  const data = await contacts.readBaseContacts()
  expect(data).toEqual(
    expect.arrayContaining([expect.objectContaining({label: 'Jon Doe'})]),
  )
  expect(data).toEqual(
    expect.arrayContaining([expect.objectContaining({contact_id: contact_id})]),
  )
})

it('updateContact to second_test_contact and second_test_meta_data', async () => {
  await contacts.updateContact(
    contact_id,
    second_test_label,
    second_test_meta_data,
  )
  const data = await contacts.readBaseContact(contact_id)
  expect(data.meta_data).toStrictEqual(second_test_meta_data)
})

it('deleteContact using contact_id', async () => {
  await expect(contacts.deleteContact(contact_id)).resolves.toBeUndefined()
})
