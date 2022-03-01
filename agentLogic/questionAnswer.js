const AdminAPI = require('../adminAPI')
const Presentations = require('./presentations')

// Perform Agent Business Logic

// Retrieve Credential Definition IDs
const askQuestion = async (
  connection_id,
  question_text,
  question_detail,
  valid_responses,
) => {
  try {
    const answer = await AdminAPI.QuestionAnswer.sendQuestion(
      connection_id,
      question_text,
      question_detail,
      valid_responses,
    )

    return answer
  } catch (error) {
    console.error('Error Sending a Question')
    throw error
  }
}

const adminMessage = async (message) => {
  console.log('New Q&A Message')

  console.log(message)

  switch (message.response) {
    case 'I need a new credential':
      console.log('Passenger needs to self attest')

      Presentations.requestIdentityPresentation(message.connection_id)
      break

    case 'I already have a credential':
      console.log('Passenger has a Medical_Release')

      Presentations.requestPresentation(message.connection_id)
      break

    default:
      console.warn('Answer Message:', message.response)
      return
  }
}

module.exports = {
  askQuestion,
  adminMessage,
}
