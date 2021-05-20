const settings = require('./settings')

afterAll((done) => {
  sequelize.close()
  done()
})

const key = 'test_theme'
const value = {
  primary_color: '#0068B6',
  secondary_color: '#00B0F1',
  neutral_color: '#808080',
  negative_color: '#e33636',
  warning_color: '#ff8c42',
  positive_color: '#4CB944',
  text_color: '#555',
  text_light: '#fff',
  border: '#e3e3e3',
  drop_shadow: '3px 3px 3px rgba(0, 0, 0, 0.3)',
  background_primary: '#fff',
  background_secondary: '#f5f5f5',
}

const new_key = 'second_test_theme'
const new_value = {
  primary_color: 'red',
  secondary_color: 'green',
  neutral_color: '#808080',
  negative_color: '#e33636',
  warning_color: '#ff8c42',
  positive_color: '#4CB944',
  text_color: '#555',
  text_light: '#fff',
  border: '#e3e3e3',
  drop_shadow: '3px 3px 3px rgba(0, 0, 0, 0.3)',
  background_primary: '#fff',
  background_secondary: '#f5f5f5',
}

it('first createSetting key with key, value', async () => {
  await settings.createSetting(key, value)
  const data = await settings.readSetting('test_theme')
  expect(data.value).toStrictEqual(value)
})

it('updateSettingKey using new_key, checking with readSetting', async () => {
  await settings.updateSettingKey(key, new_key)
  const data = await settings.readSetting('second_test_theme')
  expect(data.value).toStrictEqual(value)
})

it('updateSetting of new_key to new_value, checked with readSetting', async () => {
  await settings.updateSetting(new_key, new_value)
  const data = await settings.readSetting('second_test_theme')
  expect(data.value).toStrictEqual(new_value)
})

it('createSetting key with key, value', async () => {
  await settings.createSetting(key, value)
  const data = await settings.readSetting('test_theme')
  expect(data.value).toStrictEqual(value)
})

it('readSettings should return both key and new_key ', async () => {
  const data = await settings.readSettings()
  expect(data).toEqual(
    expect.arrayContaining([expect.objectContaining({key: 'test_theme'})]),
  )
  expect(data).toEqual(
    expect.arrayContaining([
      expect.objectContaining({key: 'second_test_theme'}),
    ]),
  )
})

it('deleteSetting at key', async () => {
  await expect(settings.deleteSetting(key)).resolves.toBeUndefined()
})

it('deleteSetting at new_key', async () => {
  await expect(settings.deleteSetting(new_key)).resolves.toBeUndefined()
})
