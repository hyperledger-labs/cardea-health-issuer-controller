const server = require('./index.js').server
const ControllerError = require('./errors.js')
const WebSocket = require('ws')

// All you need for CanUser to work
const check = require('./canUser')
const rules = require('./rbac-rules')
const cookie = require('cookie')
const cookieParser = require('cookie-parser')

let userRoles = []

wss = new WebSocket.Server({ server: server, path: '/api/ws' })
console.log('Websockets Setup')

// Send a message to all connected clients
const sendMessageToAll = (context, type, data = {}) => {
  try {
    console.log(`Sending Message to all websocket clients of type: ${type}`)

    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        console.log('Sending Message to Client')
        client.send(JSON.stringify({ context, type, data }))
      } else {
        console.log('Client Not Ready')
      }
    })
  } catch (error) {
    console.error('Error Sending Message to All Clients')
    throw error
  }
}

// (JamesKEbert) TODO: Add a connection timeout to gracefully exit versus nginx configuration closing abrubtly
wss.on('connection', async (ws, req) => {
  console.log('New Websocket Connection')

  const cookies = cookie.parse(req.headers.cookie)
  // Getting the user data from the cookie
  try {
    //console.log("Getting session cookie from headers")
    const sid = cookieParser.signedCookie(
      cookies['sessionId'],
      process.env.SESSION_SECRET,
    )
    const DBSession = await Sessions.getSessionById(sid)
    const clientOrigin = req.headers.origin

    // (eldersonar) When in a live environment, we check to make sure the client origin matches our server
    // and we ensure the connection has a valid session ID
    if (process.env.NODE_ENV !== 'development') {
      if (process.env.WEB_ROOT === clientOrigin) {
        const check_sid = cookieParser.signedCookie(
          cookies['sessionId'],
          process.env.SESSION_SECRET,
        )
        const check_sid_in_db = await Sessions.getSessionById(check_sid)

        if (!check_sid_in_db) {
          ws.terminate()
        }
      } else {
        //sendMessage(ws, 'ERROR', 'WEBSOCKET_ERROR', { error: "Origin validation failed" })
        ws.terminate()
      }
    } else {
      const check_sid = cookieParser.signedCookie(
        cookies['sessionId'],
        process.env.SESSION_SECRET,
      )
      const check_sid_in_db = await Sessions.getSessionById(check_sid)

      if (!check_sid_in_db) {
        ws.terminate()
      }
    }

    const parsedSession = JSON.parse(DBSession.dataValues.data)
    const userBySession = await Users.getUser(parsedSession.passport.user)

    userRoles = []
    userBySession.dataValues.Roles.forEach((element) =>
      userRoles.push(element.role_name),
    )
  } catch (error) { }

  ws.on('message', async (message) => {
    const clientOrigin = req.headers.origin

    if (ws.readyState === 1) {
      // (eldersonar) When in a live environment, we check to make sure the client origin matches our server
      // and we ensure the connection has a valid session ID
      if (process.env.NODE_ENV !== 'development') {
        if (process.env.WEB_ROOT === clientOrigin) {
          const check_sid = cookieParser.signedCookie(
            cookies['sessionId'],
            process.env.SESSION_SECRET,
          )
          const check_sid_in_db = await Sessions.getSessionById(check_sid)

          if (!check_sid_in_db) {
            ws.terminate()
          }
        } else {
          //sendMessage(ws, 'ERROR', 'WEBSOCKET_ERROR', { error: "Origin validation failed" })
          ws.terminate()
        }
      } else {
        const check_sid = cookieParser.signedCookie(
          cookies['sessionId'],
          process.env.SESSION_SECRET,
        )
        const check_sid_in_db = await Sessions.getSessionById(check_sid)

        if (!check_sid_in_db) {
          ws.terminate()
        }
      }
    }

    try {
      const parsedMessage = JSON.parse(message)
      console.log('New Websocket Message:', parsedMessage)

      messageHandler(
        ws,
        parsedMessage.context,
        parsedMessage.type,
        parsedMessage.data,
      )
    } catch (error) {
      console.error(error)
    }
  })

  ws.on('close', (code, reason) => {
    console.log('Websocket Connection Closed', code, reason)
  })

  ws.on('ping', (data) => {
    console.log('Ping')
  })
  ws.on('pong', (data) => {
    console.log('Pong')
  })

  sendMessage(ws, 'SERVER', 'WEBSOCKET_READY')
})

// Send an outbound message to a websocket client
const sendMessage = (ws, context, type, data = {}) => {
  console.log(`Sending Message to websocket client of type: ${type}`)
  try {
    ws.send(JSON.stringify({ context, type, data }))
  } catch (error) {
    console.error(error)
    throw error
  }
}

// Send an Error Message to a websocket client
const sendErrorMessage = (ws, errorCode, errorReason) => {
  try {
    console.log('Sending Error Message')

    sendMessage(ws, 'ERROR', 'SERVER_ERROR', { errorCode, errorReason })
  } catch (error) {
    console.error('Error Sending Error Message to Client')
    console.error(error)
  }
}

// Handle inbound messages
const messageHandler = async (ws, context, type, data = {}) => {
  try {
    console.log(`New Message with context: '${context}' and type: '${type}'`)
    switch (context) {
      case 'USERS':
        switch (type) {
          case 'GET_ALL':
            if (check(rules, userRoles, 'users:read')) {
              const users = await Users.getAll()
              sendMessage(ws, 'USERS', 'USERS', { users })
            } else {
              sendMessage(ws, 'USERS', 'USER_ERROR', {
                error: 'ERROR: You are not authorized to fetch users.',
              })
            }
            break

          case 'GET':
            const user = await Users.getUser(data.user_id)
            sendMessage(ws, 'USERS', 'USERS', { users: [user] })
            break

          case 'GET_USER_BY_TOKEN':
            const userByToken = await Users.getUserByToken(data)
            sendMessage(ws, 'USERS', 'USER', { user: [userByToken] })
            break

          case 'GET_USER_BY_EMAIL':
            const userByEmail = await Users.getUserByEmail(data)
            sendMessage(ws, 'USERS', 'USER', { user: [userByEmail] })
            break

          case 'CREATE':
            if (check(rules, userRoles, 'users:create')) {
              const newUser = await Users.createUser(data.email, data.roles)
              if (newUser.error) {
                console.log(newUser.error)
                sendMessage(ws, 'USERS', 'USER_ERROR', newUser)
              } else if (newUser === true) {
                sendMessage(
                  ws,
                  'USERS',
                  'USER_SUCCESS',
                  'User was successfully added!',
                )
              }
            } else {
              sendMessage(ws, 'USERS', 'USER_ERROR', {
                error: 'ERROR: You are not authorized to create users.',
              })
            }
            break

          case 'UPDATE':
            if (check(rules, userRoles, 'users:update, users:updateRoles')) {
              const updatedUser = await Users.updateUser(
                data.user_id,
                data.username,
                data.email,
                data.password,
                data.token,
                data.roles,
              )

              if (updatedUser.error) {
                sendMessage(ws, 'USERS', 'USER_ERROR', updatedUser)
              } else if (updatedUser === true) {
                sendMessage(
                  ws,
                  'USERS',
                  'USER_SUCCESS',
                  'User was successfully updated!',
                )
              }
            } else {
              sendMessage(ws, 'USERS', 'USER_ERROR', {
                error: 'ERROR: You are not authorized to update users.',
              })
            }
            break

          case 'PASSWORD_UPDATE':
            if (check(rules, userRoles, 'users:updatePassword')) {
              const updatedUserPassword = await Users.updatePassword(
                data.id,
                data.password,
              )
              sendMessage(ws, 'USERS', 'PASSWORD_UPDATED', {
                updatedUserPassword,
              })
            } else {
              sendMessage(ws, 'USERS', 'USER_ERROR', {
                error:
                  'ERROR: You are not authorized to update user passwords.',
              })
            }
            break

          case 'DELETE':
            if (check(rules, userRoles, 'users:delete')) {
              const deletedUser = await Users.deleteUser(data)
              if (deletedUser === true) {
                sendMessage(
                  ws,
                  'USERS',
                  'USER_SUCCESS',
                  'User was successfully deleted!',
                )
              } else
                sendMessage(ws, 'USERS', 'USER_ERROR', {
                  error: "ERROR: the user can't be deleted. Try again.",
                })
            } else {
              sendMessage(ws, 'USERS', 'USER_ERROR', {
                error: 'ERROR: You are not authorized to delete users.',
              })
            }
            break

          case 'RESEND_CONFIRMATION':
            if (check(rules, userRoles, 'users:create')) {
              const email = await Users.resendAccountConfirmation(data)
              if (email.error) {
                sendMessage(ws, 'USERS', 'USER_ERROR', email)
              } else if (email === true) {
                sendMessage(
                  ws,
                  'USERS',
                  'USER_SUCCESS',
                  'Confirmation email was successfully re-sent!',
                )
              }
            } else {
              sendMessage(ws, 'USERS', 'USER_ERROR', {
                error:
                  'ERROR: You are not authorized to re-send confirmation emails.',
              })
            }
            break

          default:
            console.error(`Unrecognized Message Type: ${type}`)
            sendErrorMessage(ws, 1, 'Unrecognized Message Type')
            break
        }
        break

      case 'ROLES':
        switch (type) {
          case 'GET_ALL':
            if (check(rules, userRoles, 'roles:read')) {
              const roles = await Roles.getAll()
              sendMessage(ws, 'ROLES', 'ROLES', { roles })
            } else {
              sendMessage(ws, 'USERS', 'USER_ERROR', {
                error: 'ERROR: You are not authorized to fetch roles.',
              })
            }
            break

          case 'GET':
            const role = await Roles.getRole(data.role_id)
            sendMessage(ws, 'ROLES', 'ROLES', { roles: [role] })
            break

          default:
            console.error(`Unrecognized Message Type: ${type}`)
            sendErrorMessage(ws, 1, 'Unrecognized Message Type')
            break
        }
        break

      case 'INVITATIONS':
        switch (type) {
          case 'CREATE_SINGLE_USE':
            if (check(rules, userRoles, 'invitations:create')) {
              let invitation
              if (data.workflow) {
                invitation = await Invitations.createPersistentSingleUseInvitation(
                  data.workflow,
                )
              } else {
                invitation = await Invitations.createSingleUseInvitation()
              }
              sendMessage(ws, 'INVITATIONS', 'INVITATION', {
                invitation_record: invitation,
              })
            } else {
              sendMessage(ws, 'INVITATIONS', 'INVITATIONS_ERROR', {
                error: 'ERROR: You are not authorized to create invitations.',
              })
            }
            break

          case 'ACCEPT_INVITATION':
            if (check(rules, userRoles, 'invitations:accept')) {
              let invitation = await Invitations.acceptInvitation(data)

              // sendMessage(ws, 'INVITATIONS', 'INVITATION', {
              //   invitation_record: invitation,
              // })
            } else {
              sendMessage(ws, 'INVITATIONS', 'INVITATIONS_ERROR', {
                error: 'ERROR: You are not authorized to accept invitations.',
              })
            }
            break

          default:
            console.error(`Unrecognized Message Type: ${type}`)
            sendErrorMessage(ws, 1, 'Unrecognized Message Type')
            break
        }
        break

      case 'CONTACTS':
        switch (type) {
          case 'GET_ALL':
            if (check(rules, userRoles, 'contacts:read')) {
              const contacts = await Contacts.getAll(data.additional_tables)
              sendMessage(ws, 'CONTACTS', 'CONTACTS', { contacts })
            } else {
              sendMessage(ws, 'CONTACTS', 'CONTACTS_ERROR', {
                error: 'ERROR: You are not authorized to fetch contacts.',
              })
            }
            break

          case 'GET':
            const contact = await Contacts.getContact(
              data.contact_id,
              data.additional_tables,
            )
            sendMessage(ws, 'CONTACTS', 'CONTACTS', { contacts: [contact] })
            break

          default:
            console.error(`Unrecognized Message Type: ${type}`)
            sendErrorMessage(ws, 1, 'Unrecognized Message Type')
            break
        }
        break

      case 'DEMOGRAPHICS':
        switch (type) {
          case 'UPDATE_OR_CREATE':
            if (
              check(
                rules,
                userRoles,
                'demographics:create, demographics:update',
              )
            ) {
              await Demographics.updateOrCreateDemographic(
                data.contact_id,
                data.surnames,
                data.given_names,
                data.date_of_birth,
                data.gender_legal,
                data.street_address,
                data.city,
                data.state_province_region,
                data.postalcode,
                data.country,
                data.phone,
                data.email,
                data.medical_release_id,
              )
              console.log(data)

              //ExternalRecords.internalContactUpdate(data.contact_id)
            } else {
              sendMessage(ws, 'DEMOGRAPHICS', 'DEMOGRAPHICS_ERROR', {
                error:
                  'ERROR: You are not authorized to create or update demographics.',
              })
            }
            break

          default:
            console.error(`Unrecognized Message Type: ${type}`)
            sendErrorMessage(ws, 1, 'Unrecognized Message Type')
            break
        }
        break

      case 'OUT_OF_BAND':
        switch (type) {
          case 'CREATE_INVITATION':
            if (check(rules, userRoles, 'invitations:create')) {
              let invitation = await Invitations.createOutOfBandInvitation()

              sendMessage(ws, 'OUT_OF_BAND', 'INVITATION', {
                invitation_record: invitation,
              })
            } else {
              sendMessage(ws, 'OUT_OF_BAND', 'INVITATIONS_ERROR', {
                error: 'ERROR: You are not authorized to create invitations.',
              })
            }
            break

          case 'ACCEPT_INVITATION':
            if (check(rules, userRoles, 'invitations:accept')) {
              await Invitations.acceptOutOfBandInvitation(data)
            } else {
              sendMessage(ws, 'OUT_OF_BAND', 'INVITATIONS_ERROR', {
                error: 'ERROR: You are not authorized to accept invitations.',
              })
            }
            break

          default:
            console.error(`Unrecognized Message Type: ${type}`)
            sendErrorMessage(ws, 1, 'Unrecognized Message Type')
            break
        }
        break

      case 'SETTINGS':
        switch (type) {
          case 'SET_THEME':
            if (check(rules, userRoles, 'settings:update')) {
              const updatedTheme = await Settings.setTheme(data)
              if (updatedTheme) {
                sendMessage(ws, 'SETTINGS', 'SETTINGS_THEME', updatedTheme)
                sendMessage(
                  ws,
                  'SETTINGS',
                  'SETTINGS_SUCCESS',
                  'Theme was successfully updated!',
                )
              } else
                sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                  error: "ERROR: theme can't be updated.",
                })
            } else {
              sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                error: 'ERROR: You are not authorized to update the theme.',
              })
            }
            break

          case 'GET_THEME':
            const currentTheme = await Settings.getTheme()
            if (currentTheme)
              sendMessage(ws, 'SETTINGS', 'SETTINGS_THEME', currentTheme)
            else
              sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                error: "ERROR: UI theme couldn't be fetched.",
              })
            break

          case 'GET_SCHEMAS':
            console.log('GET_SCHEMAS')
            const currentSchemas = await Settings.getSchemas()
            if (currentSchemas)
              sendMessage(ws, 'SETTINGS', 'SETTINGS_SCHEMAS', currentSchemas)
            else
              sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                error: "ERROR: Credential schemas couldn't be fetched.",
              })
            break

          case 'SET_SMTP':
            if (check(rules, userRoles, 'settings:update')) {
              const updatedSMTP = await Settings.setSMTP(data)
              if (updatedSMTP)
                sendMessage(
                  ws,
                  'SETTINGS',
                  'SETTINGS_SUCCESS',
                  'SMTP was successfully updated!',
                )
              else
                sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                  error: "ERROR: SMTP can't be updated.",
                })
            } else {
              sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                error:
                  'ERROR: You are not authorized to update SMTP configurations.',
              })
            }
            break

          case 'GET_SMTP':
            if (check(rules, userRoles, 'settings:update')) {
              const smtpConfigs = await Settings.getSMTP()
              if (smtpConfigs)
                sendMessage(ws, 'SETTINGS', 'SETTINGS_SMTP', smtpConfigs)
              else
                sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                  error: "ERROR: SMTP can't be fetched.",
                })
            } else {
              sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                error:
                  'ERROR: You are not authorized to fetch SMTP configurations.',
              })
            }
            break

          case 'SET_ORGANIZATION':
            if (check(rules, userRoles, 'settings:update')) {
              console.log('SET_ORGANIZATION')
              const updatedOrganization = await Settings.setOrganization(data)
              if (updatedOrganization) {
                sendMessage(
                  ws,
                  'SETTINGS',
                  'SETTINGS_ORGANIZATION',
                  updatedOrganization.value,
                )
                sendMessage(
                  ws,
                  'SETTINGS',
                  'SETTINGS_SUCCESS',
                  'Organization name was successfully updated!',
                )
              } else
                sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                  error: "ERROR: organization name can't be updated.",
                })
            } else {
              sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                error:
                  'ERROR: You are not authorized to update the organization name.',
              })
            }
            break

          case 'GET_ORGANIZATION':
            console.log('GET_ORGANIZATION')
            const currentOrganization = await Settings.getOrganization()

            if (currentOrganization)
              sendMessage(
                ws,
                'SETTINGS',
                'SETTINGS_ORGANIZATION',
                currentOrganization.value,
              )
            else
              sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                error: "ERROR: organization name couldn't be fetched.",
              })
            break

          case 'SET_MANIFEST':
            if (check(rules, userRoles, 'settings:update')) {
              console.log('SET_MANIFEST')
              console.log(data)
              const manifest = await Settings.setManifest(
                data.short_name,
                data.name,
                data.theme_color,
                data.background_color,
              )
              if (manifest.error) {
                sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', manifest)
              } else {
                // sendMessage(ws, 'SETTINGS', 'MANIFEST', newImage)
                sendMessage(
                  ws,
                  'SETTINGS',
                  'SETTINGS_SUCCESS',
                  'Manifest was successfully updated!',
                )
              }
            } else {
              sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                error: 'ERROR: You are not authorized to update the manifest.',
              })
            }
            break

          case 'SET_SELECTED_GOVERNANCE':
            if (check(rules, userRoles, 'settings:update')) {
              console.log('SET_SELECTED_GOVERNANCE')
              const selectedGovernance = await Settings.setSelectedGovernance(data)
              if (selectedGovernance) {
                sendMessageToAll('GOVERNANCE', 'SELECTED_GOVERNANCE', {
                  selected_governance: { label: selectedGovernance.value, value: selectedGovernance.value }
                })
                sendMessageToAll(
                  'SETTINGS',
                  'SETTINGS_SUCCESS',
                  'Selected governance path was successfully updated!',
                )
              } else
                sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                  error: "ERROR: couldn't update selected governance.",
                })
            } else {
              sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                error:
                  'ERROR: You are not authorized to update the selected governance path.',
              })
            }
            break

          case 'GET_SELECTED_GOVERNANCE':
            console.log('GET_SELECTED_GOVERNANCE')
            const selectedGovernance = await Settings.getSelectedGovernance()

            if (selectedGovernance)
              sendMessageToAll('GOVERNANCE', 'SELECTED_GOVERNANCE', {
                selected_governance: { label: selectedGovernance.value, value: selectedGovernance.value }
              })
            else
              sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                error: "ERROR: selected governance path couldn't be fetched.",
              })
            break
        }
        break

      case 'IMAGES':
        switch (type) {
          case 'SET_LOGO':
            if (check(rules, userRoles, 'settings:update')) {
              const newImage = await Images.setLogo(
                data.name,
                data.type,
                data.image,
              )
              if (newImage.error) {
                sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', newImage)
              } else {
                sendMessage(ws, 'SETTINGS', 'LOGO', newImage[0])
                sendMessage(
                  ws,
                  'SETTINGS',
                  'SETTINGS_SUCCESS',
                  'Logo was successfully updated!',
                )
              }
            } else {
              sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                error: 'ERROR: You are not authorized to update the logo.',
              })
            }
            break

          case 'SET_FAVICON':
            if (check(rules, userRoles, 'settings:update')) {
              console.log('SET_FAVICON')
              console.log(data)
              const newImage = await Images.setFavicon(
                data.name,
                data.type,
                data.image,
              )
              if (newImage.error) {
                sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', newImage)
              } else {
                sendMessage(
                  ws,
                  'SETTINGS',
                  'SETTINGS_SUCCESS',
                  'Favicon was successfully updated!',
                )
              }
            } else {
              sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                error: 'ERROR: You are not authorized to update the favicon.',
              })
            }
            break

          case 'SET_LOGO192':
            if (check(rules, userRoles, 'settings:update')) {
              console.log('SET_LOGO192')
              console.log(data)
              const newImage = await Images.setLogo192(
                data.name,
                data.type,
                data.image,
              )
              if (newImage.error) {
                sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', newImage)
              } else {
                sendMessage(
                  ws,
                  'SETTINGS',
                  'SETTINGS_SUCCESS',
                  'Logo192.png was successfully updated!',
                )
              }
            } else {
              sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                error:
                  'ERROR: You are not authorized to update the logo192.png.',
              })
            }
            break

          case 'SET_LOGO512':
            if (check(rules, userRoles, 'settings:update')) {
              console.log('SET_LOGO512')
              console.log(data)
              const newImage = await Images.setLogo512(
                data.name,
                data.type,
                data.image,
              )
              if (newImage.error) {
                sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', newImage)
              } else {
                sendMessage(
                  ws,
                  'SETTINGS',
                  'SETTINGS_SUCCESS',
                  'Logo512.png was successfully updated!',
                )
              }
            } else {
              sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                error:
                  'ERROR: You are not authorized to update the logo512.png.',
              })
            }
            break

          default:
            const images = await Images.getAll()
            if (images) sendMessage(ws, 'SETTINGS', 'LOGO', images[0])
            else
              sendMessage(ws, 'SETTINGS', 'SETTINGS_ERROR', {
                error: "ERROR: images couldn't be fetched.",
              })
            break
        }
        break

      case 'CREDENTIALS':
        switch (type) {
          case 'ISSUE_USING_SCHEMA':
            // TODO Kim process Test ID
            if (check(rules, userRoles, 'credentials:issue')) {
              await Credentials.autoIssueCredential(
                data.connectionID,
                data.issuerDID,
                data.credDefID,
                data.schemaID,
                data.schemaVersion,
                data.schemaName,
                data.schemaIssuerDID,
                data.comment,
                data.attributes,
              )
            } else {
              sendMessage(ws, 'CREDENTIALS', 'CREDENTIALS_ERROR', {
                error: 'ERROR: You are not authorized to issue credentials.',
              })
            }
            break

          case 'GET':
            const credentialRecord = await Credentials.getCredential(
              data.credential_exchange_id,
            )
            sendMessage(ws, 'CREDENTIALS', 'CREDENTIALS', {
              credential_records: [credentialRecord],
            })
            break

          case 'GET_ALL':
            const credentialRecords = await Credentials.getAll()
            sendMessage(ws, 'CREDENTIALS', 'CREDENTIALS', {
              credential_records: credentialRecords,
            })
            break

          default:
            console.error(`Unrecognized Message Type: ${type}`)
            sendErrorMessage(ws, 1, 'Unrecognized Message Type')
            break
        }
        break

      case 'PRESENTATIONS':
        switch (type) {
          case 'GET_ALL':
            const presentationReports = await Presentations.getAll()

            sendMessage(ws, 'PRESENTATIONS', 'PRESENTATION_REPORTS', {
              presentation_reports: presentationReports,
            })
            break

          case 'REQUEST':
            await Presentations.requestPresentation(
              data.connectionID,
              data.type,
            )
            break

          default:
            console.error(`Unrecognized Message Type: ${type}`)
            sendErrorMessage(ws, 1, 'Unrecognized Message Type')
            break
        }
        break

      case 'GOVERNANCE':
        switch (type) {
          case 'GET_PRIVILEGES':
            console.log('GET_PRIVILEGES')
            if (check(rules, userRoles, 'invitations:create')) {
              const privileges = await Governance.getPrivilegesByRoles()
              if (privileges.error === 'noDID') {
                console.log('No public did anchored')
                sendMessage(ws, 'GOVERNANCE', 'PRIVILEGES_ERROR', {
                  error: 'ERROR: You need to anchor your DID',
                })
              } else if (privileges.error === 'noPermissions') {
                console.log('No permissions set')
                sendMessage(ws, 'GOVERNANCE', 'PRIVILEGES_ERROR', {
                  error: 'ERROR: Governance permissions are not set',
                })
              } else if (privileges.error === 'noPrivileges') {
                console.log('No privileges set')
                sendMessage(ws, 'GOVERNANCE', 'PRIVILEGES_ERROR', {
                  error: 'ERROR: Governance privileges are not set',
                })
              } else if (!privileges) {
                console.log('ERROR: privileges undefined error')
                sendMessage(ws, 'GOVERNANCE', 'PRIVILEGES_ERROR', {
                  error: 'ERROR: privileges undefined error',
                })
              } else {
                sendMessage(ws, 'GOVERNANCE', 'PRIVILEGES_SUCCESS', {
                  privileges,
                })
              }
            } else {
              sendMessage(ws, 'GOVERNANCE', 'PRIVILEGES_ERROR', {
                error: 'ERROR: You are not authorized to create invitations.',
              })
            }
            break

          case 'ADD_GOVERNANCE':
            console.log('ADD_GOVERNANCE')
            const newGovernance = await Governance.updateOrCreateGovernanceFile(data)

            if (newGovernance) {
              sendMessage(ws, 'GOVERNANCE', 'GOVERNANCE_OPTION_ADDED', {
                governance_path: newGovernance
              })
            } else {
              sendMessage(ws, 'GOVERNANCE', 'PRIVILEGES_ERROR', {
                error: 'ERROR: New governance couldn\'t be added.',
              })
            }
            break

          case 'GET_ALL':
            const governancePaths = await Governance.getAll()
            sendMessage(ws, 'GOVERNANCE', 'GOVERNANCE_OPTIONS', {
              governance_paths: governancePaths,
            })
            break

          default:
            console.error(`Unrecognized Message Type: ${type}`)
            sendErrorMessage(ws, 1, 'Unrecognized Message Type')
            break
        }
        break

      default:
        console.error(`Unrecognized Message Context: ${context}`)
        sendErrorMessage(ws, 1, 'Unrecognized Message Context')
        break
    }
  } catch (error) {
    if (error instanceof ControllerError) {
      console.error('Controller Error in Message Handling', error)
      sendErrorMessage(ws, error.code, error.reason)
    } else {
      console.error('Error In Websocket Message Handling', error)
      sendErrorMessage(ws, 0, 'Internal Error')
    }
  }
}

module.exports = {
  sendMessageToAll,
}

const Invitations = require('./agentLogic/invitations')
const Demographics = require('./agentLogic/demographics')
const Contacts = require('./agentLogic/contacts')
const Credentials = require('./agentLogic/credentials')
const Governance = require('./agentLogic/governance')
const Images = require('./agentLogic/images')
const Presentations = require('./agentLogic/presentations')
const Settings = require('./agentLogic/settings')
const Sessions = require('./agentLogic/sessions')
const Users = require('./agentLogic/users')
const Roles = require('./agentLogic/roles')
const ExternalRecords = require('./agentLogic/externalRecords.js')
