const check = (rules, userRoles, actions) => {
  console.log(rules)
  console.log(userRoles)
  console.log(actions)

  // Get user roles
  if (!userRoles) {
    return false
  }

  let roles = userRoles

  // Handle multiple roles by casting roles into array
  roles = roles instanceof Array ? roles : [roles]

  let permissions = []

  // Combine roles, throw duplicate roles
  for (let i = 0; i < Object.keys(roles).length; i++) {
    permissions = permissions.concat(
      rules[roles[i]].filter((item) => permissions.indexOf(item) < 0),
    )
  }
  console.log(permissions)

  if (!permissions) {
    return false
  }

  // Assign all permissions required by the component
  if (permissions) {
    const actionsList = actions.split(', ')

    console.log(actionsList)

    // Check if the user has all required permissions
    for (const action in actionsList) {
      if (permissions.includes(actionsList[action])) {
        return true
      }
    }
  }
  return false
}

module.exports = check
