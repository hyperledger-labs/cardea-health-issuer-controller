const bcrypt = require('bcryptjs')
const localStrategy = require('passport-local').Strategy

const User = require('./agentLogic/users')

module.exports = function (passport) {
  passport.use(
    new localStrategy(async (username, password, done) => {
      const user = await User.getUserByUsername(username)
      if (!user) {
        return done(null, false, {message: 'No user with this email'})
      }
      try {
        if (await bcrypt.compare(password, user.password)) {
          result = user
          return done(null, user)
        } else {
          return done(null, false, {message: 'Incorrect password'})
        }
      } catch (error) {
        console.error('Error Loggin-In User')
        throw error
      }
    }),
  )

  passport.serializeUser((user, done) => {
    done(null, user.user_id)
  })

  passport.deserializeUser((id, done) => {
    User.getUserByUsername({user_id: id}, (err, user) => {
      const userInformation = {
        username: user.username,
      }
      done(err, userInformation)
    })
  })
}
