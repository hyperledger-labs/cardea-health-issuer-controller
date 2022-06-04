const crypto = require('crypto')
const Settings = require('../orm/settings')
const fs = require('fs')
const Util = require('../util')

// Perform Agent Business Logic

// Theme
const setTheme = async (data = {}) => {
  try {
    await Settings.updateTheme(data)
    const updatedTheme = await Settings.readTheme()
    return updatedTheme
  } catch (error) {
    console.error('Error updating settings')
    throw error
  }
}

const getTheme = async () => {
  try {
    const currentTheme = await Settings.readTheme()
    return currentTheme
  } catch (error) {
    console.error('Error getting Theme')
    throw error
  }
}

// SMTP
const getSMTP = async () => {
  try {
    const currentSMTP = await Settings.readSMTP()
    return currentSMTP
  } catch (error) {
    console.error('Error getting SMTP')
    throw error
  }
}

const setSMTP = async (data = {}) => {
  try {
    if (
      !data.auth.email ||
      !data.auth.pass ||
      !data.auth.mailUsername ||
      !data.host
    ) {
      return false
    }
    
    const IV = crypto.randomBytes(8).toString('hex')
    const encryptedPassword = Util.encrypt(data.auth.pass, IV)

    data.IV = IV
    data.auth.pass = encryptedPassword

    await Settings.updateSMTP(data)
    const updatedSMTP = await Settings.readSMTP()
    return updatedSMTP
  } catch (error) {
    console.error('Error updating SMTP')
    throw error
  }
}

// Organization
const getOrganization = async () => {
  try {
    const currentOrganization = await Settings.readOrganization()
    return currentOrganization
  } catch (error) {
    console.error('Error getting Organization')
    throw error
  }
}

const setOrganization = async (data = {}) => {
  try {
    await Settings.updateOrganization(data)
    const updatedOrganization = await Settings.readOrganization()
    return updatedOrganization
  } catch (error) {
    console.error('Error updating organization name')
    throw error
  }
}

const setManifest = async (short_name, name, theme_color, bg_color) => {
  try {
    const manifest = {
      short_name: short_name,
      name: name,
      icons: [
        {
          src: 'favicon.ico',
          sizes: '64x64 32x32 24x24 16x16',
          type: 'image/x-icon',
        },
        {
          src: 'logo192.png',
          type: 'image/png',
          sizes: '192x192',
        },
        {
          src: 'logo512.png',
          type: 'image/png',
          sizes: '512x512',
        },
      ],
      start_url: '.',
      display: 'standalone',
      theme_color: theme_color,
      background_color: bg_color,
    }

    fs.writeFile(
      'web/manifest.json',
      JSON.stringify(manifest, 'utf8', '\t'),
      function (err) {
        if (err) throw err
        console.log('complete')
      },
    )

    return 'success'
  } catch (error) {
    console.error('Error updating manifest.json')
    throw error
  }
}

const getSchemas = async () => {
  return {
    SCHEMA_LAB_ORDER: process.env.SCHEMA_LAB_ORDER,
    SCHEMA_LAB_RESULT: process.env.SCHEMA_LAB_RESULT,
    SCHEMA_VACCINATION: process.env.SCHEMA_VACCINATION,
    SCHEMA_VACCINE_EXEMPTION: process.env.SCHEMA_VACCINE_EXEMPTION,
    SCHEMA_MEDICAL_RELEASE: process.env.SCHEMA_MEDICAL_RELEASE,
  }
}

module.exports = {
  getTheme,
  setTheme,
  getSMTP,
  setSMTP,
  getOrganization,
  setOrganization,
  setManifest,
  getSchemas,
}
