const ConnectionsState = require('../agentLogic/connectionStates')
const Governance = require('../agentLogic/governance')
const AdminAPI = require('../adminAPI')
const Util = require('../util')
const Settings = require('../agentLogic/settings')

const updateConnectionState = async (connection_id, key, step_name, data) => {
  await ConnectionsState.updateOrCreateConnectionState(connection_id, key, {
    step_name,
    data: data ? data : {},
  })
}

const updateConnectionData = async (connection_id, key, data) => {
  await ConnectionsState.updateOrCreateConnectionState(connection_id, key, {
    credential: data,
  })
}

// Proccesing action start phase
const actionStart = async (connection_id, stepName) => {
  let governance = null
  let role = null
  let publicDID = null

  // Get roles for potential extra validation
  try {
    const selectedGovernance = await Settings.getSelectedGovernance()
    governance = selectedGovernance.value.governance_file

    if (governance) {
      role = await Governance.getPermissionsByDID()
      console.log('AP actionStart ROLE: ', role)
      publicDID = await Governance.getDID()
      console.log('AP actionStart PUBLIC DID: ', publicDID)
    }
  } catch (err) {
    console.log(err)
  }

  console.log(' ')
  console.log('-----------------> ACTION START <----------------------')
  console.log('connection id: ', connection_id) // connection_id
  console.log('Step name: ', stepName) // Step name

  console.log('Getting current connection state by connection ID')
  const currentState = await ConnectionsState.getConnectionStates(
    connection_id,
    'action',
  )

  if (currentState) {
    console.log(' ')
    console.log(currentState.dataValues)
    console.log(' ')
  }

  console.log('Getting current connection data by connection ID')
  const currentData = await ConnectionsState.getConnectionStates(
    connection_id,
    'form_data',
  )

  if (currentData) {
    console.log(' ')
    console.log(currentData.dataValues)
    console.log(' ')
  }

  // Get the proper step based on the stepName
  let step = []

  if (stepName) {
    console.log('Just action')

    for (i = 0; i < governance.actions.length; i++) {
      if (governance.actions[i].name === stepName) {
        step.push(governance.actions[i])
      }
    }
  } else if (currentState) {
    console.log('Just currentState')

    for (i = 0; i < governance.actions.length; i++) {
      // Get the initial block for the proper role
      if (
        governance.actions[i].name === currentState.dataValues.value.step_name
      ) {
        step.push(governance.actions[i])
      }
    }
  } else {
    console.log('ERROR: No data was passed to action processor')
  }

  if (step[0]) {
    console.log('WE ARE ON STEP --------> ' + step[0].name + ' <---------')
    // (eldersonar) this will work with a single role
    if (step[0].role[0] !== role[0]) {
      console.log('Not enough permissions...')
      return {error: 'ERROR: Not enough permissions...'}
    } else {
      console.log('')
      console.log('Enough permissions')
      console.log('')
    }
  } else {
    console.log('action not found')
    return {error: 'ERROR: Action not found'}
  }

  console.log('Step')
  console.log(step)

  // Handling actions here
  if (step[0]) {
    let invitation = null
    if (step[0].type === 'protocol') {
      console.log(' ')
      console.log('THIS IS AN ACTION BLOCK')

      switch (step[0].data.protocol) {
        case 'https://didcomm.org/basic-message/1.0/':
          console.log('basic message')
          await AdminAPI.Connections.sendBasicMessage(connection_id, {
            content: step[0].data.content,
          })
          break

        case 'https://didcomm.org/outofband/1.1/':
          console.log('oob invitation')
          invitation = await AgentLogic.Invitations.createOutOfBandInvitation()

          console.log('222222222 Log of invitation from actionProcessor:', invitation);
          // (eldersonar) Writing connection state to DB
          await updateConnectionState(
            invitation.connection_id,
            'action',
            stepName,
          )
          return invitation.invitation_url

        case 'https://didcomm.org/connections/1.0/':
          console.log('invitation')
          invitation = await AgentLogic.Invitations.createSingleUseInvitation()

          // (eldersonar) Writing connection state to DB
          await updateConnectionState(
            invitation.connection_id,
            'action',
            stepName,
          )
          console.log('this is invitation', invitation)
          return invitation

        case 'https://didcomm.org/questionAnswer/1.0/':
          console.log('question')
          await AgentLogic.QuestionAnswer.askQuestion(
            connection_id,
            step[0].data.question_answer[0].question,
            step[0].data.question_answer[1].question_detail,
            step[0].data.question_answer[2].valid_responses,
          )
          break

        case 'https://didcomm.org/present-proof/1.0/':
          if (step[0].name === 'request-presentation') {
            console.log('request-presentation')
            await AgentLogic.Presentations.requestPresentation(connection_id)
          } else if (step[0].name === 'request-identity-presentation') {
            console.log('request-identity-presentation')
            await AgentLogic.Presentations.requestIdentityPresentation(
              connection_id,
            )
          } else {
            console.log('This presentation request is not supported.')
          }
          break

        case 'https://didcomm.org/issue-credential/1.0/':
          if (publicDID) {
            await AgentLogic.Credentials.autoIssueCredential(
              connection_id,
              undefined,
              undefined,
              currentData.dataValues.value.credential.schemaID,
              currentData.dataValues.value.credential.schemaVersion,
              currentData.dataValues.value.credential.schemaName,
              currentData.dataValues.value.credential.schemaIssuerDID,
              currentData.dataValues.value.credential.comment,
              currentData.dataValues.value.credential.attributes,
            )
          } else {
            return {error: 'ERROR: Public DID Not Set'}
          }
          break

        default:
          console.log('this action is not handled yet')
          break
      }
      // Handling decisions here
    } else if (step[0].type === 'decision') {
      // else if check for decision type
      if (typeof currentState.dataValues.value.data.decision !== 'boolean') {
        console.log('Decision is not a boolean')
        if (currentState.dataValues.value.data.decision) {
          console.log(' ')
          console.log('THIS IS A DECISION BLOCK')

          actionComplete(connection_id)
        } else {
          console.log(' ')
          console.log('Waiting for the decision to be made by the holder')
        }
      } else {
        console.log('Decision is a boolean')
        console.log(' ')
        console.log('THIS IS A DECISION BLOCK')

        actionComplete(connection_id)
      }
    }
  } else {
    console.log(' ')
    console.log('SOMETHING WENT WRONG. NO STEP WAS FOUND')
  }
}

// Proccesing action complete phase
const actionComplete = async (connection_id) => {
  let governance = null
  let role = null

  try {
    const selectedGovernance = await Settings.getSelectedGovernance()
    governance = selectedGovernance.value.governance_file

    if (governance) {
      role = await Governance.getPermissionsByDID()
      console.log('AP actionComplete ROLE: ', role)
    }
  } catch (err) {
    console.log(err)
  }

  console.log(' ')
  console.log('-----------------> ACTION COMPLETE <----------------------')
  console.log('connection_id: ', connection_id) // connection_id

  console.log('Getting current connection state by connection ID')
  const currentState = await ConnectionsState.getConnectionStates(
    connection_id,
    'action',
  )

  if (currentState) {
    console.log(' ')
    console.log(currentState.dataValues)
    console.log(' ')
  }

  // Get the proper step based on the stepName
  let step = []
  for (i = 0; i < governance.actions.length; i++) {
    // Get the initial block for the proper role
    if (
      governance.actions[i].name === currentState.dataValues.value.step_name
    ) {
      step.push(governance.actions[i])
    }
  }

  console.log(
    'WE ARE ON STEP --------> ' +
      currentState.dataValues.value.step_name +
      ' <---------',
  )

  console.log('Step')
  console.log(step)

  // Action block - make a decision based on the step result
  if (step[0].type === 'protocol') {
    console.log(' ')
    console.log('THIS IS AN ACTION BLOCK')

    let stepResult = null

    if (currentState.dataValues.value.data.connectionMessageState) {
      console.log('connectionMessageState')
      if (
        currentState.dataValues.value.data.connectionMessageState === 'active'
      ) {
        stepResult = 'success'
      } else {
        stepResult = 'error'
        console.log('connectionMessageState is not active. Unhappy path here.')
      }
    } else if (currentState.dataValues.value.data.questionAnswerMessageState) {
      if (
        currentState.dataValues.value.data.questionAnswerMessageState ===
        'answered'
      ) {
        stepResult = 'success'
      } else {
        stepResult = 'error'
        console.log(
          'questionAnswerMessageState is not answered. Unhappy path here.',
        )
      }
    } else if (currentState.dataValues.value.data.presentationMessageState) {
      if (
        currentState.dataValues.value.data.presentationMessageState ===
        'verified'
      ) {
        stepResult = 'success'
      } else {
        stepResult = 'error'
        console.log(
          'presentationMessageState is not answered. Unhappy path here.',
        )
      }
    } else if (
      currentState.dataValues.value.data.credentialIssuanceMessageState
    ) {
      if (
        currentState.dataValues.value.data.credentialIssuanceMessageState ===
        'credential_acked'
      ) {
        stepResult = 'success'
      } else {
        stepResult = 'error'
        console.log(
          'credentialIssuanceMessageState is not answered. Unhappy path here.',
        )
      }
    } else {
      console.log('This reponse is absent or not handled at the moment.')
      return
    }

    console.log('stepResult')
    console.log(stepResult)

    let nextStep = null

    Object.keys(step[0].next).forEach((key) => {
      if (key === stepResult) {
        console.log(step[0].next[key])
        nextStep = step[0].next[key]
      }
    })

    console.log(' ')
    console.log('CALLING ACTIONSTART TO TRIGGER NEXT STEP : ' + nextStep)

    if (!nextStep) {
      console.log(' ')
      console.log('This is the end of the scripted flow.')
    } else {
      // (eldersonar) Writing connection state to DB
      await updateConnectionState(
        connection_id,
        'action',
        nextStep,
        currentState.dataValues.value.data,
      )

      actionStart(currentState.dataValues.connection_id)
    }
  }
  // (eldersonar) Handle decision block
  else if (step[0].type === 'decision') {
    console.log(' ')
    console.log('THIS IS A DECISION BLOCK')

    console.log(
      'the decision value is: ' + currentState.dataValues.value.data.decision,
    )

    // (eldersonar) Figuring out the next step
    let valuesMatch = null
    let nextStep = null
    let operatorChecked = false
    let patternChecked = false

    console.log('Validating type')

    const typeChecked = await validateType(
      currentState.dataValues.value.data.decision,
      step[0].data.input_type,
    )

    // (eldersonar) Handle string
    if (typeChecked) {
      console.log('Type passed')

      for (let i = 0; i < step[0].data.options.length; i++) {
        console.log(step[0].data.options[i])
        console.log('Validating pattern')

        patternChecked = await validatePattern(
          currentState.dataValues.value.data.decision,
          step[0].data.options[i].regex,
        )

        if (!patternChecked) {
          console.log('The pattern failed')
        } else {
          console.log('Validating operator')

          operatorChecked = validateOperator(
            currentState.dataValues.value.data.decision,
            step[0].data.options[i].values,
            step[0].data.options[i].operator,
            step[0].data.input_type,
            typeChecked,
          )

          console.log('++++++++++++++++++++++++++++')
          console.log('Here is the operator checked result: ', operatorChecked)
          console.log('++++++++++++++++++++++++++++')

          if (!operatorChecked) {
            console.log('The operator failed')
          } else {
            valuesMatch = step[0].data.options[i]
            break
          }
        }
      }
    } else {
      console.log(currentState.dataValues.value.data.decision)
      console.log(
        "The datatype '" +
          typeof currentState.dataValues.value.data.decision +
          "' is not supported at the moment",
      )
    }

    console.log('')
    console.log('Type passed: ' + typeChecked)
    console.log('Pattern passed: ' + patternChecked)
    console.log('Operator passed: ' + operatorChecked)
    console.log('')

    if (typeChecked && patternChecked && operatorChecked) {
      console.log('Happy path for the rules validation')
      nextStep = valuesMatch.next
    } else {
      console.log('Unhappy path for the rules validation')
      nextStep = step[0].next.error
    }

    console.log('nextStep')
    console.log(nextStep)

    console.log(' ')
    console.log('CALLING ACTIONSTART TO TRIGGER NEXT STEP: ' + nextStep)

    // (eldersonar) Remove decision from the data object
    if (currentState.dataValues.value.data.decision) {
      delete currentState.dataValues.value.data.decision
    }

    if (!nextStep) {
      console.log(' ')
      console.log('This is the end of the scripted flow.')
    } else {
      // (eldersonar) Writing connection state to DB
      await updateConnectionState(
        connection_id,
        'action',
        nextStep,
        currentState.dataValues.value.data,
      )

      actionStart(connection_id)
    }
  }
}

module.exports = {
  actionStart,
  actionComplete,
  updateConnectionState,
  updateConnectionData,
}

const AgentLogic = require('../agentLogic')

// (eldersonar) Type validation
const validateType = (value, type) => {
  let typePass = false
  switch (type) {
    case 'string':
      if (typeof value === 'string') {
        console.log('The type check (STRING) have passed')
        typePass = true
      } else {
        console.log('This is NOT A STRING or STRING IS EMPTY')
        typePass = false
      }
      break

    case 'number':
      if (!isNaN(value)) {
        console.log('The type check (NUMBER) have passed')
        typePass = true
      } else {
        console.log('This is NOT A NUMBER')
        typePass = false
      }
      break

    case 'boolean':
      if (value === true || value === false) {
        console.log('The type check (BOOLEAN) have passed')
        typePass = true
      } else {
        console.log('This is NOT A BOOLEAN')
        typePass = false
      }
      break

    default:
      console.log('Error: The type check failed')
      typePass = false
      break
  }
  return typePass
}

// (eldersonar) Operator validation
const validateOperator = (
  value,
  option_values,
  operator,
  type,
  type_passed,
) => {
  let operatorPass = false

  if (operator) {
    if (type === 'string' && type_passed) {
      console.log("It's a string")
      operatorPass = true

      if (operator === 'equal') {
        console.log("Operator is: 'equal'")

        if (option_values[0] === value) {
          console.log('Value equaled, pass')
          operatorPass = true
        } else {
          console.log("Value didn't equal, failed")
          operatorPass = false
        }
      } else if (operator === 'not_equal') {
        console.log("Operator is: 'not equal'")

        if (option_values[0] !== value) {
          console.log("Value didn't equal, pass")
          operatorPass = true
        } else {
          console.log('Value equaled, failed')
          operatorPass = false
        }
      } else {
        console.log('wrong operator on a string')
      }
    } else if (type === 'number' && type_passed) {
      console.log("It's a number")
      switch (operator) {
        case 'equal':
          console.log("Operator is: 'equal'")

          if (option_values[0] === value) {
            console.log('Value equaled, pass')
            operatorPass = true
          } else {
            console.log("Value didn't equal, failed")
            operatorPass = false
          }
          break

        case 'not_equal':
          console.log("Operator is: 'not equal'")

          if (option_values[0] !== value) {
            console.log("Value didn't equal, pass")
            operatorPass = true
          } else {
            console.log('Value equaled, failed')
            operatorPass = false
          }
          break

        case 'less_than':
          console.log("Operator is: 'less than'")

          if (value < option_values[0]) {
            console.log('Value less than, pass')
            operatorPass = true
          } else {
            console.log('Value is: not less than, failed')
            operatorPass = false
          }
          break

        case 'less_than_equal_to':
          console.log("Operator is: 'less than or equal to'")

          if (value <= option_values[0]) {
            console.log('Value is: less than or equal to, pass')
            operatorPass = true
          } else {
            console.log('Value is: not less than or equal to, failed')
            operatorPass = false
          }
          break

        case 'greater_than':
          console.log("Operator is: 'greater than'")

          if (value > option_values[0]) {
            console.log('Value is: greater than, pass')
            operatorPass = true
          } else {
            console.log('Value is: not greater than, failed')
            operatorPass = false
          }
          break

        case 'greater_than_equal_to':
          console.log("Operator is: 'greater than or equal to'")

          if (value >= option_values[0]) {
            console.log('Value is: greater than or equal to, pass')
            operatorPass = true
          } else {
            console.log('Value is: not greater than or equal to, failed')
            operatorPass = false
          }
          break

        default:
          console.log(`The operator '` + operator + "' is not supported")
          operatorPass = false
          break
      }
    } else if (type === 'boolean' && type_passed) {
      console.log("It's a boolean")
      operatorPass = true

      if (operator === 'equal') {
        console.log("Operator is: 'equal'")

        if (option_values[0] === value) {
          console.log('Value equaled, pass')
          operatorPass = true
        } else {
          console.log("Value didn't equal, failed")
          operatorPass = false
        }
      } else if (operator === 'not_equal') {
        console.log("Operator is: 'not equal'")

        if (option_values[0] !== value) {
          console.log("Value didn't equal, pass")
          operatorPass = true
        } else {
          console.log('Value equaled, failed')
          operatorPass = false
        }
      } else {
        console.log('wrong operator on a boolean')
      }
    }
  } else {
    console.log('No operator provided')
    console.log('operator passed')
    operatorPass = true
  }

  return operatorPass
}

// (eldersonar) Pattern validation
const validatePattern = (value, regex) => {
  let patternPass = false
  if (regex) {
    // Check for an empty object
    if (Object.keys(regex).length === 0) {
      console.log('no pattern provided')
      console.log('pattern passed')
      patternPass = true
    } else {
      const reconstructedRegex = new RegExp(regex.source, regex.flags)

      const re = new RegExp(reconstructedRegex)

      // (eldersonar) Test pattern
      if (re.test(value)) {
        console.log('pattern passed')
        patternPass = true
      } else {
        console.log('pattern failed')
        patternPass = false
      }
    }
  } else {
    console.log('no pattern was found for this attribute')
    patternPass = true
  }
  return patternPass
}
