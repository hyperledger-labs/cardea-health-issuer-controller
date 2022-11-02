// Utilities:

const crypto = require('crypto')

// Encode and decode Base64
const decodeBase64 = (encodedMessage) => {
  console.log('Decoding encoded Base64 message')
  return Buffer.from(encodedMessage, 'base64').toString('ascii')
}

const encodeBase64 = (message) => {
  console.log('Encoding message to Base64')
  return Buffer.from(message).toString('base64')
}

const encodeBase64Image = (image) => {
  console.log('Encoding image to Base64')
  return Buffer.from(image.substring(image.indexOf(',') + 1), 'base64')
}

// Regular expressions

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ // Regular x@x.xx email
  return re.test(String(email).toLowerCase())
}

function validateAlphaNumeric(username) {
  const re = /^[a-zA-Z0-9\.].{2,}$/ // Alphanumeric, at least 3 characters
  console.log(re.test(username))
  return re.test(String(username))
}

function validatePassword(password) {
  // const re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/ // At least 1 digit, 1 lowercase, 1 uppercase, 1 special characters, 8 characters
  const re = /^.{15,}$/ // At least 15 characters
  return re.test(String(password))
}

function validateLogo(logo) {
  const re = /\.(jpe?g|png|gif|webp)$/gi // Only .png, .jpeg, .jpg, .webp
  return re.test(String(logo))
}

function validateFavIcon(favicon) {
  const re = /\.(ico)$/gi // Only .ico
  return re.test(String(favicon))
}

function validateLogo192And512(logo) {
  const re = /\.(png)$/gi // Only .png
  return re.test(String(logo))
}

// String AES256 (cbc) encryption
const encrypt = (val, IV) => {
  let cipher = crypto.createCipheriv('aes-256-cbc', process.env.ENC_KEY, IV)
  let encrypted = cipher.update(val, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  return encrypted
}

// String AES256 (cbc) decryption
const decrypt = (encrypted, IV) => {
  let decipher = crypto.createDecipheriv('aes-256-cbc', process.env.ENC_KEY, IV)
  let decrypted = decipher.update(encrypted, 'base64', 'utf8')
  return decrypted + decipher.final('utf8')
}

module.exports = {
  decodeBase64,
  encodeBase64,
  encodeBase64Image,
  validateEmail,
  validateAlphaNumeric,
  validatePassword,
  validateLogo,
  validateFavIcon,
  validateLogo192And512,
  encrypt,
  decrypt,
}
