const axios = require('axios')
const DIDs = require('../adminAPI/dids.js')
const GovernanceFiles = require('../orm/governance')
// const Settings = require('./settings')

// (eldersonar) Set up the ssl check flag for testing if SSL cert is expired during live test
// If not set, this code will use default settings for axios calls
const https = require('https')
let agent = new https.Agent({
  rejectUnauthorized: true,
})
console.log('SSL check is enabled')

if (process.env.DISABLE_SSL_CHECK === 'true') {
  agent = new https.Agent({
    rejectUnauthorized: false,
  })
  console.log('SSL check is disabled')
}

// Get the machine readable governance file from the external source
const getGovernance = async (path) => {
  try {
    const response = await axios({
      method: 'GET',
      // url: `${process.env.GOVERNANCE_PATH}`,
      url: path,
      httpsAgent: agent,
    }).then((res) => {
      return res.data
    })

    return response
  } catch (error) {
    console.error('Governance Document Request Error')
    console.log(error)

    // (eldersonar) Doesn't always have a response. Do we handle specific codes or handle all errors as one?
    // if (error.response.status) return undefined
    // (eldersonar) This will ensure that we set our response to undefined
    if (error) return undefined
  }
}

// (eldersonar) Get Presentation Definition file
const getPresentationDefinition = async () => {
  try {
    // const governance = await getGovernance()
    const governance = await Settings.getSelectedGovernance()

    // Presentation definition file
    const pdfLink = governance.actions.find(
      (item) => item.name === 'issue_trusted_traveler',
    ).details.presentation_definition

    const response = await axios({
      method: 'GET',
      url: pdfLink,
      httpsAgent: agent,
    }).then((res) => {
      return res.data
    })

    return response
  } catch (error) {
    console.error('Presentation Definition File Request Error')
    // console.log(error.response.status)
    console.log(error)

    // (eldersonar) Do we handle specific codes or handle all errors as one?
    // if (error.response.status)
    return undefined

    // throw error
  }
}

// Get DID
const getDID = async () => {
  try {
    // Validate Public DID
    const publicDID = await DIDs.fetchPublicDID()

    if (!publicDID) {
      console.error('Public DID Not Set')
      return null
    }

    return publicDID.did
  } catch (error) {
    console.error('Error finding public did')
    throw error
  }
}

// Get participant
const getParticipantByDID = async () => {
  try {
    const did = await getDID()
    if (!did) return { error: 'noDID' }
    else {
      const selectedGovernance = await Settings.getSelectedGovernance()
      const governance = selectedGovernance.value.governance_file

      if (!governance || Object.keys(governance).length === 0) {
        console.log("the file is empty or doesn't exist")
        return { error: 'noGov' }
      } else if (
        // (eldersonar) Are we still doing this???

        // Handle the case where we check for participants if roles are missing. Allow to act, but give the warning message (working with unknown participant.)

        // or participants or privileges or do whatever you want (no governance, empty gov, no privileges (no roles, no permissions), no participants, ... no actions)

        !governance.hasOwnProperty('roles') ||
        !governance.hasOwnProperty('permissions') ||
        !governance.hasOwnProperty('privileges')
      ) {
        // (eldersonar) TODO: rename the return value
        console.log('the file is not empty, but lacks core data')
        return { error: 'limitedGov' }
      } else {
        let participant = governance.participants.find((o) => o.id === did)

        return participant
      }
    }
  } catch (error) {
    console.error('Error fetching participant')
    throw error
  }
}

// Get permissions
const getPermissionsByDID = async () => {
  try {
    const did = await getDID()

    const selectedGovernance = await Settings.getSelectedGovernance()
    const governance = selectedGovernance.value.governance_file

    let permissions = []

    // Get permissions
    for (i = 0; i < governance.permissions.length; i++) {
      if (governance.permissions[i].when.any.find((item) => item.id === did)) {
        permissions.push(governance.permissions[i].grant[0])
      }
    }

    // (eldersonar) If no public DID is anchored or no permissions were given to this DID 
    if ((did && permissions.length === 0) || !did) {
      for (j = 0; j < governance.permissions.length; j++) {
        if (governance.permissions[j].grant[0] === "any") {
          permissions.push(governance.permissions[j].grant[0])
        } else {
          console.log('No permissions was found associated with this agent\'s DID. "any" role is also not supported by currently selected governance file...')
        }
      }
    }

    return permissions
  } catch (error) {
    console.error('Error fetching permissions')
    throw error
  }
}

// Get privileges by roles
const getPrivilegesByRoles = async () => {
  try {
    const did = await getDID()

    if (!did) return {error: 'noDID'}
    else {
      const governance = await getGovernance()

      // (eldersonar) missing or empty governance
      if (!governance || Object.keys(governance).length === 0) {
        console.log("the file is empty or doesn't exist")
        return {error: 'noGov'}
        // (eldersonar) partial governance
      } else if (
        // !governance.hasOwnProperty('participants') ||
        !governance.hasOwnProperty('roles') ||
        !governance.hasOwnProperty('permissions') ||
        // !governance.hasOwnProperty('actions') ||
        !governance.hasOwnProperty('privileges')
      ) {
        console.log('the file is not empty, but lacks core data')
        // return { error: "limitedGov" }
        return {error: 'noPrivileges'}
        // (eldersonar) You have a pass
      } else {
        const permissions = await getPermissionsByDID()

        if (!permissions || permissions.length == 0)
          // return { error: 'noPermissions' }
          return {error: 'noPrivileges'}
        else {
          let privileges = []

          // (eldersonar) Get a list of privileges by roles
          for (let i = 0; i < permissions.length; i++) {
            for (j = 0; j < governance.privileges.length; j++) {
              if (
                governance.privileges[j].when.any.find(
                  (item) => item.role === permissions[i],
                )
              ) {
                privileges.push(governance.privileges[j].grant[0])
              }
            }
          }

          if (!privileges || privileges.length == 0)
            return {error: 'noPrivileges'}
          else {
            const uniquePrivileges = [...new Set(privileges)]

            return uniquePrivileges
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching privileges')
    throw error
  }
}

// Get actions by privileges
const getActionsByPrivileges = async () => {
  try {
    const did = await getDID()

    if (!did) return { error: 'noDID' }
    else {
      const selectedGovernance = await Settings.getSelectedGovernance()
      const governance = selectedGovernance.value.governance_file

      // (eldersonar) missing or empty governance
      if (!governance || Object.keys(governance).length === 0) {
        console.log("the file is empty or doesn't exist")
        return { error: 'noGov' }
        // (eldersonar) partial governance
      } else if (
        // !governance.hasOwnProperty('participants') ||
        !governance.hasOwnProperty('roles') ||
        !governance.hasOwnProperty('permissions') ||
        !governance.hasOwnProperty('actions') ||
        !governance.hasOwnProperty('privileges')
      ) {
        console.log('the file is not empty, but lacks core data')
        // return { error: "limitedGov" }
        return { error: 'noPrivileges' }
        // (eldersonar) Pass granted
      } else {
        const privileges = await getPrivilegesByRoles()
        const actionsArr = await getActions()

        if (!privileges || privileges.length == 0) {
          return { error: 'noPrivileges' }
        } else if (!actionsArr || actionsArr.length == 0) {
          return { error: 'noActionsArr' }
        } else {
          let actions = []

          // Get a list of actions by privileges
          for (let i = 0; i < privileges.length; i++) {
            for (j = 0; j < actionsArr.length; j++) {
              if (actionsArr[j].name === privileges[i]) {
                actions.push(actionsArr[j])
              }
            }
          }

          // (eldersonar) Filter unique actions
          if (!actions || actions.length == 0) return { error: 'noActions' }
          else {
            const uniqueActions = [...new Set(actions)]
            return uniqueActions
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching actions by privileges')
    throw error
  }
}

// Get actions
const getActions = async () => {
  try {
    const selectedGovernance = await Settings.getSelectedGovernance()
    const governance = selectedGovernance.value.governance_file

    if (!governance || Object.keys(governance).length === 0) {
      console.log("the file is empty or doesn't exist")
      return { error: 'noGov' }
    } else if (!governance.hasOwnProperty('actions')) {
      console.log('the are no actions')
      return { error: 'noActions' }
    } else {
      return governance.actions
    }
  } catch (error) {
    console.error('Error fetching actions')
    throw error
  }
}

// Get participants
const getParticipants = async () => {
  try {
    const did = await getDID()
    if (!did) return { error: 'noDID' }
    else {
      // const governance = await getGovernance()
      const governance = Settings.getSelectedGovernance()

      if (!governance || Object.keys(governance).length === 0) {
        console.log("the file is empty or doesn't exist")
        return { error: 'noGov' }
      } else if (!governance.hasOwnProperty('participants')) {
        console.log('the are no participants')
        return { error: 'noParticipants' }
      } else {
        return governance.participants
      }
    }
  } catch (error) {
    console.error('Error fetching participants')
    throw error
  }
}

const updateOrCreateGovernanceFile = async function (
  governance_path,
  // governance_file = {},
) {
  try {

    const governance_file = await getGovernance(governance_path)

    if (governance_file) {
      await GovernanceFiles.createOrUpdateGovernanceFile(
        governance_path,
        governance_file,
      )

      const governanceFile = await GovernanceFiles.readGovernanceFile(
        governance_path,
      )

      return governanceFile
    } else {
      return { error: "ERROR: no JSON object was found at this url" }
    }

  } catch (error) {
    console.error('Error Fetching Governance File')
    throw error
  }
}

const getGovernanceFile = async (governance_path) => {
  try {
    const governanceFile = await GovernanceFiles.readGovernanceFile(
      governance_path,
    )

    return governanceFile
  } catch (error) {
    console.error('Error Fetching Governance File')
    throw error
  }
}

const getAll = async () => {
  try {
    const governanceOptions = await GovernanceFiles.readGovernanceFiles()

    // (eldersonar) This removes governance-framework object from return
    governanceOptions.forEach(function (governanceOption) { governanceOption.governance_file = {} })

    return governanceOptions
  } catch (error) {
    console.error('Error Fetching Governance Files')
    throw error
  }
}

const removeGovernanceFile = async function (governance_path) {
  try {
    await GovernanceFiles.deleteGovernanceFile(governance_path)
  } catch (error) {
    console.error('Error Removing Governance File')
    throw error
  }
}

module.exports = {
  getGovernance,
  getPresentationDefinition,
  getParticipantByDID,
  getPermissionsByDID,
  getPrivilegesByRoles,
  getParticipants,
  getActionsByPrivileges,
  getActions,
  getDID,

  updateOrCreateGovernanceFile,
  getGovernanceFile,
  getAll,
  removeGovernanceFile
}

const Settings = require('./settings')