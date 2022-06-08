const sendAdminMessage = require('./transport')

// Generate operations and requests to be sent to the Cloud Agent Adminstration API

// Auto issue a credential to a connection via the admin API
const sendQuestion = async (
  connectionID,
  question_text,
  question_detail,
  valid_responses,
) => {
  try {
    console.log('Ask to choose from health options')

    const response = await sendAdminMessage(
      'post',
      `/qa/${connectionID}/send-question`,
      {},
      {
        question_text,
        question_detail,
        valid_responses,
        connectionID,
      },
    )
    return response
  } catch (error) {
    console.error('Error while asking a question')
    throw error
  }
}

module.exports = {
  sendQuestion,
}
