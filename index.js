require('dotenv').config()
const bodyParser = require('body-parser')
const express = require('express')
const http = require('http')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const session = require('express-session')
const Util = require('./util')

const Images = require('./agentLogic/images')

// Import environment variables for use via an .env file in a non-containerized context
const dotenv = require('dotenv')
dotenv.config()

let app = express()
let server = http.createServer(app)

module.exports.server = server

// Websockets required to make APIs work and avoid circular dependency
let Websocket = require('./websockets.js')
const Users = require('./agentLogic/users')

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(passport.initialize())
require('./passport-config')(passport)

server.listen(process.env.CONTROLLERPORT || 3100, () =>
  console.log(
    `Server listening at http://localhost:${
      process.env.CONTROLLERPORT || 3100
    }`,
    `\n Agent Address: ${process.env.AGENTADDRESS || 'localhost:8150'}`,
  ),
)

const agentWebhookRouter = require('./agentWebhook')

// Send all cloud agent webhooks posting to the agent webhook router
app.use('/api/controller-webhook', agentWebhookRouter)

// Present only in development to catch the secondary agent webhooks for ease of development
app.use('/api/second-controller', (req, res) => {
  console.log('Second ACA-Py Agent Webhook Message')
  res.status(200).send()
})

app.use(
  '/api/governance-framework',
  express.static('governance-framework.json'),
)

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {maxAge: 3600 * 1000, httpOnly: false},
    name: 'sessionId',
    resave: true, // Forces the session to be saved back to the session store, even if the session was never modified during the request.
    rolling: true, // keep updating the session on new requests
    saveUninitialized: false, // don't create a session on any API call where the session is not modified
    secure: true, // only use cookie over https
    ephemeral: false, // delete this cookie while browser close
  }),
)

app.use(passport.session())

// Authentication
app.post('/api/user/log-in', (req, res, next) => {
  // Empty/data checks
  if (!req.body.username || !req.body.password)
    res.json({error: 'All fields must be filled out.'})

  if (!Util.validateAlphaNumeric(req.body.username))
    res.json({
      error:
        'Username must be at least 3 character long and consist of alphanumeric values.',
    })

  if (!Util.validatePassword(req.body.password))
    res.json({
      error:
        'Must be at least: 1 digit, 1 lowercase, 1 uppercase, 1 special characters, 8 characters.',
    })

  if (!req.body.password || !req.body.username)
    res.json({error: 'All fields must be filled out.'})
  passport.authenticate('local', (err, user, info) => {
    if (err) throw err
    if (!user) res.json({error: 'Username or password is wrong.'})
    else {
      req.logIn(user, (err) => {
        if (err) throw err

        // Put roles in the array
        const userRoles = []
        req.user.Roles.forEach((element) => userRoles.push(element.role_name))

        res.cookie(
          'user',
          {id: req.user.user_id, username: req.user.username, roles: userRoles},
          {httpOnly: false},
        )

        res.json({
          id: req.user.user_id,
          username: req.user.username,
          roles: userRoles,
        })
        console.log(req.user)
      })
    }
  })(req, res, next)
})

// Logging out
app.post('/api/user/log-out', (req, res) => {
  req.logout()
  req.session.destroy(function (err) {
    if (!err) {
      res
        .status(200)
        .clearCookie('sessionId', {path: '/'})
        .clearCookie('user', {path: '/'})
        .json({status: 'Session destroyed.'})
    } else {
      res.send("Couldn't destroy the session.")
    }
  })
})

// Validate JWT
app.post('/api/user/token/validate', async (req, res) => {
  try {
    const verify = jwt.verify(req.body.token, process.env.JWT_SECRET)
    console.log(verify)
    res.status(200).json({status: 'The link is valid.'})
  } catch (err) {
    console.error(err)
    res.json({error: 'The link has expired.'})
  }
})

app.post('/api/user/password/update', async (req, res) => {
  try {
    jwt.verify(req.body.token, process.env.JWT_SECRET)
    console.log('The token is valid.')
  } catch (err) {
    console.error(err)
    console.log('The token has expired.')
    res.json({error: 'The link has expired.'})
  }

  let user = undefined

  if (!req.body.password)
    res.status(200).json({error: 'All fields must be filled out.'})
  else if (!Util.validatePassword(req.body.password)) {
    res.json({
      error:
        'Must be at least: 1 digit, 1 lowercase, 1 uppercase, 1 special characters, 8+ characters.',
    })
  } else {
    try {
      const validToken = await Users.getUserByToken(req.body.token)
      if (validToken.user_id !== req.body.id)
        res.json({error: 'The token did not match the user.'})
    } catch (error) {
      throw error
    }

    user = await Users.updatePassword(req.body.id, req.body.password)
    if (!user)
      res.status(200).json({error: "The password couldn't be updated."})
    else res.status(200).json({status: 'Password updated.'})
  }
})

app.post('/api/user/update', async (req, res) => {
  let userByEmail = undefined
  let user = undefined
  if (req.body.flag && req.body.flag === 'set-up user') {
    // Updating the user during the user setup process

    // Check for the valid token
    try {
      const verify = jwt.verify(req.body.token, process.env.JWT_SECRET)
      console.log('The token is valid.')
    } catch (error) {
      res.json({error: 'The link has expired.'})
      throw error
    }

    // Empty/data checks
    if (!req.body.email || !req.body.username || !req.body.password)
      res.json({error: 'All fields must be filled out.'})

    if (!Util.validateEmail(req.body.email))
      res.json({error: 'Must be a valid email.'})

    if (!Util.validateAlphaNumeric(req.body.username))
      res.json({
        error:
          'Username must be at least 3 character long and consist of alphanumeric values.',
      })

    if (!Util.validatePassword(req.body.password))
      res.json({
        error:
          'Must be at least: 1 digit, 1 lowercase, 1 uppercase, 1 special characters, 8 characters.',
      })

    userByEmail = await Users.getUserByEmail(req.body.email)
    if (!userByEmail) res.json({error: 'The user was not found.'})

    user = await Users.updateUser(
      userByEmail.user_id,
      req.body.username,
      req.body.email,
      req.body.password,
      req.body.token,
      null,
      req.body.flag,
    )
  } else {
    // Updating the token for the user (from password forgot screen)

    // Empty/data checks
    if (!req.body.email) res.json({error: 'All fields must be filled out.'})

    if (!Util.validateEmail(req.body.email))
      res.json({error: 'Must be a valid email.'})

    userByEmail = await Users.getUserByEmail(req.body.email)
    if (!userByEmail) res.json({error: 'The user was not found.'})
    user = await Users.updateUser(
      userByEmail.user_id,
      userByEmail.username,
      userByEmail.email,
      userByEmail.password,
      null,
      null,
      req.body.flag,
    )
  }

  // If SMTP is not set up or broken
  if (user.error) res.send(user.error)

  if (!user) res.json({error: "The user couldn't be updated."})
  else res.status(200).json({status: 'User updated.'})
})

// Logo retrieval
app.get('/api/logo', async (req, res) => {
  try {
    const logo = await Images.getImagesByType('logo')
    if (!logo) res.json({error: 'The logo was not found.'})
    console.log(logo)
    res.send(logo)
  } catch (err) {
    console.error(err)
  }
})

// Session expiration reset
app.get('/api/session', async (req, res) => {
  res.status(200).json({status: 'session'})
})

app.use('/', (req, res) => {
  console.log('Request outside of normal paths', req.url)
  console.log(req.body)
  res.status(404).send()
})
