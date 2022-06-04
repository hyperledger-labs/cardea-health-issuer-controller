const bcrypt = require('bcryptjs')
require('dotenv').config()

const jwt = require('jsonwebtoken')
const NodeMailer = require('../nodeMailer')
const SMTP = require('./settings')
const Util = require('../util')
const Images = require('./images')

const Websockets = require('../websockets.js')
let Users = require('../orm/users')

// New Account Email
const sendEmailNewAccount = async function (from, to, organization, token) {
  const link = process.env.WEB_ROOT + `/account-setup/#${token}`

  const emailNewAccount = `
  <style type="text/css">
    .tg  {border:none;border-collapse:collapse;border-spacing:0;margin:0px auto;}
    .tg td{border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:1vw;overflow:hidden;
      padding:10px 5px;word-break:normal;}
    .tg th{border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:1vw;font-weight:normal;
      overflow:hidden;padding:10px 5px;word-break:normal;}
    .tg .tg-zv4m{border-color:#ffffff;text-align:left;vertical-align:top}
    .tg .tg-n3mx{border-color:#ffffff;color:#333333;font-size:1vw;text-align:left;vertical-align:top}
    .tg .tg-b5gb{border-color:#ffffff;font-size:1vw;text-align:left;vertical-align:top}
    .tg .tg-vpu8{border-color:#ffffff;font-family:Arial, Helvetica, sans-serif !important;;font-size:1vw;text-align:left;
      vertical-align:top}
    .tg .tg-0pky{border-color:inherit;text-align:left;vertical-align:top}
    .tg .tg-bq5v{border-color:inherit;font-size:1vw;text-align:left;vertical-align:top}
    .tg .tg-il3a{border-color:#ffffff;color:#ffffff;text-align:left;vertical-align:top}
    @media screen and (max-width: 767px) {.tg {width: auto !important;}.tg col {width: auto !important;}.tg-wrap {overflow-x: auto;-webkit-overflow-scrolling: touch;margin: auto 0px;}}
  </style>
  <div class="tg-wrap">
    <table class="tg" style="undefined;table-layout: fixed; width: 1144px">
      <colgroup>
        <col style="width: 147px">
        <col style="width: 832px">
        <col style="width: 165px">
      </colgroup>
      <tbody>
        <tr>
          <td class="tg-zv4m"></td>
          <td class="tg-b5gb"><br><br><br></td>
          <td class="tg-zv4m"></td>
        </tr>
        <tr>
          <td class="tg-zv4m"></td>
          <td class="tg-b5gb" style="font-size:1.5vw">Welcome!<br><br></td>
          <td class="tg-zv4m"></td>
        </tr>
        <tr>
          <td class="tg-0pky"></td>
          <td class="tg-bq5v" style="font-size:1vw">You've been invited to create an account on the ${organization} system. <br><br></td>
          <td class="tg-0pky"></td>
        </tr>
        <tr>
          <td class="tg-il3a"></td>
          <td class="tg-n3mx" style="font-size:1vw">Please click <a href="${link}">here</a> to choose your settings and get started (or copy and paste the link below).<br><br></td>
          <td class="tg-il3a"></td>
        </tr>
        <tr>
          <td class="tg-zv4m"></td>
          <td class="tg-b5gb" style="font-size:1vw">${link}<br><br></td>
          <td class="tg-zv4m"></td>
        </tr>
        <tr>
          <td class="tg-zv4m"></td>
          <td class="tg-b5gb" style="font-size:1vw">This link will expire in 24 hours.<br><br></td>
          <td class="tg-zv4m"></td>
        </tr>
        <tr>
          <td class="tg-0pky"></td>
          <td class="tg-bq5v" style="font-size:1vw">Thank you,<br></td>
          <td class="tg-0pky"></td>
        </tr>
        <tr>
          <td class="tg-0pky"></td>
          <td class="tg-bq5v" style="font-size:1.5vw;font-weight:bold">${organization}<br></td>
          <td class="tg-0pky"></td>
        </tr>
        <tr>
          <td class="tg-zv4m"></td>
          <td class="tg-b5gb"><br><br></td>
          <td class="tg-zv4m"></td>
        </tr>
      </tbody>
    </table>
  </div>`

  await NodeMailer.sendMail({
    from: from,
    to: to,
    subject: `${organization} Enterprise Agent Account Registration`,
    html: emailNewAccount,
  })
}

// Password Reset Email
const sendEmailPasswordReset = async function (
  from,
  to,
  username,
  organization,
  token,
) {
  const link = process.env.WEB_ROOT + `/password-reset/#${token}`

  const emailPasswordReset = `
  <style type="text/css">
    .tg  {border:none;border-collapse:collapse;border-spacing:0;margin:0px auto;}
    .tg td{border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:1vw;overflow:hidden;
      padding:10px 5px;word-break:normal;}
    .tg th{border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:1vw;font-weight:normal;
      overflow:hidden;padding:10px 5px;word-break:normal;}
    .tg .tg-zv4m{border-color:#ffffff;text-align:left;vertical-align:top}
    .tg .tg-n3mx{border-color:#ffffff;color:#333333;font-size:1vw;text-align:left;vertical-align:top}
    .tg .tg-b5gb{border-color:#ffffff;font-size:1vw;text-align:left;vertical-align:top}
    .tg .tg-vpu8{border-color:#ffffff;font-family:Arial, Helvetica, sans-serif !important;;font-size:1vw;text-align:left;
      vertical-align:top}
    .tg .tg-0pky{border-color:inherit;text-align:left;vertical-align:top}
    .tg .tg-bq5v{border-color:inherit;font-size:1vw;text-align:left;vertical-align:top}
    .tg .tg-il3a{border-color:#ffffff;color:#ffffff;text-align:left;vertical-align:top}
    @media screen and (max-width: 767px) {.tg {width: auto !important;}.tg col {width: auto !important;}.tg-wrap {overflow-x: auto;-webkit-overflow-scrolling: touch;margin: auto 0px;}}
  </style>
  <div class="tg-wrap">
    <table class="tg" style="undefined;table-layout: fixed; width: 1144px">
      <colgroup>
        <col style="width: 147px">
        <col style="width: 832px">
        <col style="width: 165px">
      </colgroup>
      <tbody>
        <tr>
          <td class="tg-zv4m"></td>
          <td class="tg-b5gb"><br><br><br></td>
          <td class="tg-zv4m"></td>
        </tr>
        <tr>
          <td class="tg-zv4m"></td>
          <td class="tg-b5gb" style="font-size:1.5vw">Welcome ${username}!<br><br></td>
          <td class="tg-zv4m"></td>
        </tr>
        <tr>
          <td class="tg-0pky"></td>
          <td class="tg-bq5v" style="font-size:1vw">We received a request to reset your password on the ${organization} system. <br><br></td>
          <td class="tg-0pky"></td>
        </tr>
        <tr>
          <td class="tg-il3a"></td>
          <td class="tg-n3mx" style="font-size:1vw">Please click <a href="${link}">here</a> to reset your password (or copy and paste the link below).<br><br></td>
          <td class="tg-il3a"></td>
        </tr>
        <tr>
          <td class="tg-zv4m"></td>
          <td class="tg-b5gb" style="font-size:1vw">${link}<br><br></td>
          <td class="tg-zv4m"></td>
        </tr>
        <tr>
          <td class="tg-zv4m"></td>
          <td class="tg-b5gb" style="font-size:1vw">This link will expire in 10 minutes. <br><br></td>
          <td class="tg-zv4m"></td>
        </tr>
        <tr>
          <td class="tg-zv4m"></td>
          <td class="tg-b5gb" style="font-size:1vw">If you did not request this service, you can safely ignore this email and your password will remain the same. <br><br></td>
          <td class="tg-zv4m"></td>
        </tr>
        <tr>
          <td class="tg-0pky"></td>
          <td class="tg-bq5v" style="font-size:1vw">Thank you,<br></td>
          <td class="tg-0pky"></td>
        </tr>
        <tr>
          <td class="tg-0pky"></td>
          <td class="tg-bq5v" style="font-size:1.5vw;font-weight:bold">${organization}<br></td>
          <td class="tg-0pky"></td>
        </tr>
        <tr>
          <td class="tg-zv4m"></td>
          <td class="tg-b5gb"><br><br></td>
          <td class="tg-zv4m"></td>
        </tr>
      </tbody>
    </table>
  </div>`

  await NodeMailer.sendMail({
    from: from,
    to: to,
    subject: `${organization} Enterprise Agent Password Reset Request`,
    html: emailPasswordReset,
  })
}

// Perform Agent Business Logic

// Verify SMTP connection and return an error message witht the prompt to set up SMTP server.
async function smtpCheck() {
  // Accessing transporter
  const transporter = await NodeMailer.emailService()
  // Verifying SMTP configs
  return new Promise((resolve, reject) => {
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error)
        reject(false)
      } else {
        console.log('Server is ready to take our messages')
        resolve(success)
      }
    })
  })
}

const getUser = async (userID) => {
  try {
    const user = await Users.readUser(userID)
    return user
  } catch (error) {
    console.error('Error Fetching User')
    throw error
  }
}
const getUserByToken = async (userToken) => {
  try {
    const user = await Users.readUserByToken(userToken)
    return user
  } catch (error) {
    console.error('Error Fetching User by Token')
    throw error
  }
}

const getUserByEmail = async (userEmail) => {
  try {
    const user = await Users.readUserByEmail(userEmail)
    return user
  } catch (error) {
    console.error('Error Fetching User by Email')
    throw error
  }
}

const getUserByUsername = async (username) => {
  try {
    const user = await Users.readUserByUsername(username)
    return user
  } catch (error) {
    console.error('Error Fetching User by Email')
    throw error
  }
}

const getAll = async () => {
  try {
    const users = await Users.readUsers()
    // Trim password and jwt
    for (let i = 0; i < users.length; i++) {
      delete users[i].dataValues.password
      delete users[i].dataValues.token
    }

    return users
  } catch (error) {
    console.error('Error Fetching Users')
    throw error
  }
}

const createUser = async function (email, roles) {
  // Resolving SMTP check promise
  try {
    await smtpCheck()
  } catch (error) {
    console.error(
      'USER ERROR: Cannot verify SMTP configurations. Error code: ',
      error,
    )
    return {
      error:
        "USER ERROR: The confirmation email can't be sent. Please, check your SMTP configurations.",
    }
  }

  // Empty/data checks
  if (!email || !Array.isArray(roles) || !roles.length)
    return { error: 'USER ERROR: All fields must be filled out.' }

  if (!Util.validateEmail(email))
    return { error: 'USER ERROR: Must be a valid email.' }

  try {
    // Checking for duplicate email
    const duplicateUser = await Users.readUserByEmail(email)
    if (duplicateUser)
      return { error: 'USER ERROR: A user with this email already exists.' }

    const user = await Users.createUser(email)

    for (let i = 0; i < roles.length; i++) {
      await Users.linkRoleAndUser(roles[i], user.user_id)
    }

    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    })

    const userID = user.user_id
    const username = ''
    const password = ''

    const newUser = await Users.updateUserInfo(
      userID,
      username,
      email,
      password,
      token,
    )

    // Get email from SMTP config
    const currentSMTP = await SMTP.getSMTP()
    const currentOrganization = await SMTP.getOrganization()
    // const currentLogo = await Images.getImagesByType('logo')
    // console.log(currentLogo[0].dataValues.image, 'logo dig')

    // Send new account email
    await sendEmailNewAccount(
      currentSMTP.dataValues.value.auth.email,
      user.email,
      currentOrganization.value.organizationName,
      token,
    )

    // Broadcast the message to all connections
    Websockets.sendMessageToAll('USERS', 'USER_CREATED', { user: [newUser] })

    // Return true to trigger the success message
    return true
  } catch (error) {
    console.error('Error Fetching User')
    // throw error
    return {
      error:
        'Was not able to send a confirmation email. Please, make sure that you set user email in the SMTP configurations properly.',
    }
  }
}

const updateUser = async function (
  userID,
  username,
  email,
  password,
  token,
  roles,
  flag,
) {
  try {
    // Checks for updating the user by admin
    if (!email) {
      console.log('ERROR: email is empty.')
      return { error: 'USER ERROR: All fields must be filled out.' }
    }

    if (roles) {
      if (!Array.isArray(roles) || !roles.length) {
        console.log('ERROR: All fields must be filled out.')
        return { error: 'USER ERROR: Roles are empty.' }
      }
    }

    if (!Util.validateEmail(email)) {
      console.log('ERROR: Must be a valid email.')
      return { error: 'USER ERROR: Must be a valid email.' }
    }

    if (username)
      if (!Util.validateAlphaNumeric(username)) {
        console.log(
          'Username must be at least 3 character long and consist of alphanumeric values.',
        )
        return {
          error:
            'Username must be at least 3 character long and consist of alphanumeric values.',
        }
      }

    // Checking for duplicate email
    const duplicateEmail = await Users.readUserByEmail(email)
    if (duplicateEmail && duplicateEmail.user_id !== userID) {
      return { error: 'USER ERROR: A user with this email already exists.' }
    }

    // Checking for duplicate username
    const duplicateUsername = await Users.readUserByUsername(username)
    if (
      duplicateUsername &&
      username !== '' &&
      duplicateUsername.user_id !== userID
    ) {
      return { error: 'USER ERROR: A user with this username already exists.' }
    }

    const userToUpdate = await Users.readUser(userID)

    // Update user on user account setup
    if (password && userToUpdate.password !== password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      const emptyToken = ''
      await Users.updateUserInfo(
        userID,
        username,
        email,
        hashedPassword,
        emptyToken,
      )
    } else {
      // Update user on user password forgot password/admin user edit

      // Check if updating the user by adding the token from forgot-password component
      console.log(token)
      if (flag === 'password reset') {
        // Resolving SMTP check promise
        try {
          await smtpCheck()
        } catch (error) {
          console.error(
            'USER ERROR: Cannot verify SMTP configurations. Error code: ',
            error,
          )
          return {
            error:
              "USER ERROR: The password reset email can't be sent. Talk to your administrator.",
          }
        }

        try {
          const newToken = jwt.sign({ id: userID }, process.env.JWT_SECRET, {
            expiresIn: '10m',
          })

          await Users.updateUserInfo(userID, username, email, password, newToken)

          // Get email from SMTP config
          const currentSMTP = await SMTP.getSMTP()
          const currentOrganization = await SMTP.getOrganization()

          if (username) {
            await sendEmailPasswordReset(
              currentSMTP.dataValues.value.auth.email,
              email,
              username,
              currentOrganization.value.organizationName,
              newToken,
            )
          } else {
            // This user isn't set up yet, so resend the new account email
            await sendEmailNewAccount(
              currentSMTP.dataValues.value.auth.email,
              email,
              currentOrganization.value.organizationName,
              newToken,
            )
          }
        } catch (error) {
          console.error('Error Reseting Password')
          // throw error
          return {
            error:
              'Was not able to send a confirmation email. Please, make sure that you set user email in the SMTP configurations properly.',
          }
        }
      } else {
        // User update by admin
        await Users.updateUserInfo(userID, username, email, password, token)
      }
    }

    if (roles) {
      // If roles need to get updated (user edit by admin) clear old roles-user connections
      await Users.deleteRolesUserConnection(userID)

      // Loop roles and create connections with the user
      for (let i = 0; i < roles.length; i++) {
        await Users.linkRoleAndUser(roles[i], userID)
      }
    }

    const updatedUser = await Users.readUser(userID)

    // Broadcast the message to all connections
    Websockets.sendMessageToAll('USERS', 'USER_UPDATED', { updatedUser })

    console.log('Updated user')

    // Return true to trigger a success message
    return true
  } catch (error) {
    console.error('Error Fetching User update')
    throw error
  }
}

const updatePassword = async function (id, password) {
  try {
    const userToUpdate = await Users.readUser(id)

    if (userToUpdate.password !== password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      await Users.updateUserPassword(id, hashedPassword)
    } else {
      await Users.updateUserPassword(id, password)
    }
    const user = await Users.readUser(id)
    return user
  } catch (error) {
    console.error('Error Fetching Password update')
    throw error
  }
}

const deleteUser = async function (userID) {
  try {
    const deletedUser = await Users.deleteUser(userID)

    // Broadcast the message to all connections
    Websockets.sendMessageToAll('USERS', 'USER_DELETED', deletedUser)

    // Return true to trigger a success message
    return true
  } catch (error) {
    console.error('Error Fetching User')
    throw error
  }
}

const resendAccountConfirmation = async function (email) {
  // Resolving SMTP check promise
  try {
    await smtpCheck()
  } catch (error) {
    console.error(
      "USER ERROR: can't verify SMTP configurations. Error code: ",
      error,
    )
    return {
      error:
        "USER ERROR: The confirmation email can't be sent. Please, check your SMTP configurations.",
    }
  }

  try {
    const user = await Users.readUserByEmail(email)

    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    })

    const userID = user.user_id
    const username = ''
    const password = ''

    const updatedUser = await Users.updateUserInfo(
      userID,
      username,
      email,
      password,
      token,
    )

    if (!updatedUser)
      return {
        error:
          "USER ERROR: The confirmation email can't be re-sent. Try again later.",
      }

    // Get email from SMTP config
    const currentSMTP = await SMTP.getSMTP()
    const currentOrganization = await SMTP.getOrganization()

    // Send new account email
    await sendEmailNewAccount(
      currentSMTP.dataValues.value.auth.email,
      email,
      currentOrganization.value.organizationName,
      token,
    )

    // Return true to trigger the success message
    return true
  } catch (error) {
    console.error('Error Fetching User')
    // throw error
    return {
      error:
        'Was not able to send a confirmation email. Please, make sure that you set user email in the SMTP configurations properly.',
    }
  }
}

module.exports = {
  createUser,
  getUser,
  getUserByToken,
  getUserByEmail,
  getUserByUsername,
  getAll,
  updateUser,
  updatePassword,
  deleteUser,
  resendAccountConfirmation,
}
