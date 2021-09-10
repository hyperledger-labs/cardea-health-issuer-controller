const Settings = require('../orm/settings')

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

const getSchemas = async () => {
  return {
    SCHEMA_LAB_ORDER: process.env.SCHEMA_LAB_ORDER,
    SCHEMA_LAB_RESULT: process.env.SCHEMA_LAB_RESULT,
    SCHEMA_VACCINATION: process.env.SCHEMA_VACCINATION,
    SCHEMA_VACCINE_EXEMPTION: process.env.SCHEMA_VACCINE_EXEMPTION,
  }
}

module.exports = {
  getTheme,
  setTheme,
  getSMTP,
  setSMTP,
  getOrganization,
  setOrganization,
  getSchemas,
}
