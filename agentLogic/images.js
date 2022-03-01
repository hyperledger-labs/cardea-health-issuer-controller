const fs = require('fs')
const Util = require('../util')

let Images = require('../orm/images')

// Perform Agent Business Logic

const getAll = async () => {
  try {
    const images = await Images.readImages()
    console.log('Images:', images)
    return images
  } catch (error) {
    console.error('Error Fetching Images')
    throw error
  }
}

const getLogo = async () => {
  try {
    const logo = await Images.readImagesByType('logo')
    console.log('Images:', logo)
    return logo
  } catch (error) {
    console.error('Error Fetching Logo')
    throw error
  }
}

const getImagesByType = async (type) => {
  try {
    const images = await Images.readImagesByType(type)
    console.log('Images:', images)
    return images
  } catch (error) {
    console.error('Error Fetching Images by Type')
    throw error
  }
}

// Update the logo image
const setLogo = async (name, type, image) => {
  // Checking file extension
  if (!Util.validateLogo(name)) {
    console.log('the type NOT passed')
    return {
      error:
        'ERROR: must be a valid image with .png, .jpeg, .jpg or .webp extension.',
    }
  }

  // Checking image MIME.
  if (
    !image.includes('data:image/png;base64,') &&
    !image.includes('data:image/jpeg;base64,') &&
    !image.includes('data:image/gif;base64,') &&
    !image.includes('data:image/webp;base64,')
  ) {
    console.log('This is not an image.')
    return {error: 'ERROR: must be a valid image.'}
  }

  // Checking image size.
  const buffer = Buffer.from(image.substring(image.indexOf(',') + 1))
  if (buffer.length > 670000) {
    console.log('Image buffer byte length: ' + buffer.length)
    return {error: 'ERROR: the image is over 0.5Mb.'}
  }

  try {
    await Images.updateImage(name, type, image)
    const updatedImage = await Images.readImagesByType('logo')
    return updatedImage
  } catch (error) {
    console.error('Error updating logo')
    throw error
  }
}

// Update the faicon image
const setFavicon = async (name, type, image) => {
  // Checking file extension
  if (!Util.validateFavIcon(name)) {
    console.log('the type NOT passed')
    return {error: 'ERROR: must be a valid icon with .ico extension.'}
  }

  // Checking image MIME.
  if (
    !image.includes('data:image/x-icon;base64,') &&
    !image.includes('data:image/vnd.microsoft.icon;base64,')
  ) {
    console.log('This is not an .ico image.')
    return {error: 'ERROR: must be a valid ico file format.'}
  }

  // Checking image size.
  const buffer = Buffer.from(image.substring(image.indexOf(',') + 1))
  if (buffer.length > 268000) {
    console.log('Image buffer byte length: ' + buffer.length)
    return {error: 'ERROR: the icon is over 200KB.'}
  }

  try {
    // Decode and write the file

    const decodedImage = Util.encodeBase64Image(image)
    fs.writeFileSync('web/favicon.ico', decodedImage)

    return 'success'
  } catch (error) {
    console.error('Error updating favicon')
    throw error
  }
}

// Update the logo192 image
const setLogo192 = async (name, type, image) => {
  // Checking file extension
  if (!Util.validateLogo192And512(name)) {
    console.log('the type NOT passed')
    return {error: 'ERROR: must be a valid image with .png extension.'}
  }

  // Checking image MIME.
  if (!image.includes('data:image/png;base64,')) {
    console.log('This is not a png type image.')
    return {error: 'ERROR: must be a valid png image.'}
  }

  // Checking image size.
  const buffer = Buffer.from(image.substring(image.indexOf(',') + 1))
  if (buffer.length > 134000) {
    console.log('Image buffer byte length: ' + buffer.length)
    return {error: 'ERROR: the image is over 100KB.'}
  }

  try {
    // Decode and write the file

    const decodedImage = Util.encodeBase64Image(image)
    fs.writeFileSync('web/logo192.png', decodedImage)

    return 'success'
  } catch (error) {
    console.error('Error updating logo192')
    throw error
  }
}

// Update the logo512 image
const setLogo512 = async (name, type, image) => {
  // Checking file extension
  if (!Util.validateLogo192And512(name)) {
    console.log('the type NOT passed')
    return {error: 'ERROR: must be a valid image with .png extension.'}
  }

  // Checking image MIME.
  if (!image.includes('data:image/png;base64,')) {
    console.log('This is not a .png type image.')
    return {error: 'ERROR: must be a valid png image.'}
  }

  // Checking image size.
  const buffer = Buffer.from(image.substring(image.indexOf(',') + 1))
  if (buffer.length > 268000) {
    console.log('Image buffer byte length: ' + buffer.length)
    return {error: 'ERROR: the image is over 100KB.'}
  }

  try {
    // Decode and write the file

    const decodedImage = Util.encodeBase64Image(image)
    fs.writeFileSync('web/logo512.png', decodedImage)

    return 'success'
  } catch (error) {
    console.error('Error updating logo512')
    throw error
  }
}

module.exports = {
  getAll,
  getLogo,
  setLogo,
  setFavicon,
  setLogo192,
  setLogo512,
  getImagesByType,
}
