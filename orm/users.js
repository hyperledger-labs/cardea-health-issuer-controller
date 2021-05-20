const {Sequelize, DataTypes, Model} = require('sequelize')

const init = require('./init.js')
sequelize = init.connect()

class User extends Model {}
exports.User = User

User.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    username: {
      type: DataTypes.TEXT,
    },
    email: {
      type: DataTypes.TEXT,
    },
    password: {
      type: DataTypes.TEXT,
    },
    token: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
    },
    updated_at: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize, // Pass the connection instance
    modelName: 'User',
    tableName: 'users', // Our table names don't follow the sequelize convention and thus must be explicitly declared
    timestamps: false,
  },
)

class Role extends Model {}

Role.init(
  {
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    role_name: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize, // Pass the connection instance
    modelName: 'Role',
    tableName: 'roles', // Our table names don't follow the sequelize convention and thus must be explicitly declared
    timestamps: false,
  },
)

// ROLES
const User_Role = sequelize.define(
  'roles_to_users',
  {
    user_id: DataTypes.INTEGER,
    role_id: DataTypes.INTEGER,
  },
  {
    timestamps: false,
  },
)
User.belongsToMany(Role, {
  through: User_Role,
  foreignKey: 'user_id',
  otherKey: 'role_id',
})

Role.belongsToMany(User, {
  through: User_Role,
  foreignKey: 'role_id',
  otherKey: 'user_id',
})

const linkRoleAndUser = async function (role_id, user_id) {
  try {
    const role = await readRole(role_id)
    const user = await readUser(user_id)

    await user.addRole(role, {})
    console.log('Successfully linked user and role')
  } catch (error) {
    console.error('Error linking user and role', error)
  }
}

const createRole = async function (role_name) {
  try {
    const timestamp = Date.now()

    const role = await Role.create({
      role_name,
    })

    console.log('Role saved successfully.')
    return role
  } catch (error) {
    console.error('Error saving role to the database: ', error)
  }
}

const readRole = async function (role_id) {
  try {
    const role = await Role.findAll({
      where: {
        role_id,
      },
    })

    return role[0]
  } catch (error) {
    console.error('Could not find role in the database: ', error)
  }
}

const readRoles = async function () {
  try {
    const roles = await Role.findAll()

    return roles
  } catch (error) {
    console.error('Could not find roles in the database: ', error)
  }
}

const updateRole = async function (role_id) {
  try {
    const timestamp = Date.now()

    await Role.update(
      {
        role_id,
        role_name,
      },
      {
        where: {
          role_id,
        },
      },
    )

    console.log('Role updated successfully.')
  } catch (error) {
    console.error('Error updating the Role: ', error)
  }
}

const deleteRole = async function (role_id) {
  try {
    await Role.destroy({
      where: {
        role_id,
      },
    })

    console.log('Successfully deleted role')
  } catch (error) {
    console.error('Error while deleting role: ', error)
  }
}

// USERS
const createUser = async function (email) {
  try {
    const timestamp = Date.now()

    await User.create({
      email,
      created_at: timestamp,
      updated_at: timestamp,
    })
    const user = await readUserByEmail(email)
    return user
  } catch (error) {
    console.error('Error saving user to the database: ', error)
  }
}

const readUser = async function (user_id) {
  try {
    const user = await User.findAll({
      where: {
        user_id,
      },
      include: [
        {
          model: Role,
        },
      ],
    })

    return user[0]
  } catch (error) {
    console.error('Could not find user by id in the database: ', error)
  }
}

const readUserByToken = async function (token) {
  try {
    const user = await User.findAll({
      where: {
        token,
      },
      include: [
        {
          model: Role,
        },
      ],
    })

    return user[0]
  } catch (error) {
    console.error('Could not find user by token in the database: ', error)
  }
}

const readUserByEmail = async function (email) {
  try {
    const user = await User.findAll({
      where: {
        email,
      },
      include: [
        {
          model: Role,
        },
      ],
    })

    return user[0]
  } catch (error) {
    console.error('Could not find user by email in the database: ', error)
  }
}

const readUserByUsername = async function (username) {
  try {
    const user = await User.findAll({
      where: {
        username,
      },
      include: [
        {
          model: Role,
        },
      ],
    })

    return user[0]
  } catch (error) {
    console.error('Could not find user by username in the database: ', error)
  }
}

const readUsers = async function () {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Role,
        },
      ],
    })

    return users
  } catch (error) {
    console.error('Could not find users in the database: ', error)
  }
}

const updateUserInfo = async function (
  user_id,
  username,
  email,
  password,
  token,
) {
  try {
    const timestamp = Date.now()

    await User.update(
      {
        username,
        email,
        password,
        token,
        updated_at: timestamp,
      },
      {
        where: {
          user_id,
        },
      },
    )

    const user = readUser(user_id)

    console.log(`User updated successfully.`)
    return user
  } catch (error) {
    console.error('Error updating the User: ', error)
  }
}

const updateUserPassword = async function (user_id, password) {
  try {
    const timestamp = Date.now()

    await User.update(
      {
        password,
        updated_at: timestamp,
        token: '',
      },
      {
        where: {
          user_id,
        },
      },
    )

    console.log('Password updated successfully.')
  } catch (error) {
    console.error('Error updating the password: ', error)
  }
}

const deleteUser = async function (user_id) {
  try {
    await User.destroy({
      where: {
        user_id,
      },
    })

    console.log('User was successfully deleted')
    return user_id
  } catch (error) {
    console.error('Error while deleting user: ', error)
  }
}

const deleteRolesUserConnection = async function (user_id) {
  try {
    await User_Role.destroy({
      where: {
        user_id,
      },
    })

    console.log('User roles connection was successfully deleted')
  } catch (error) {
    console.error('Error while deleting user: ', error)
  }
}

module.exports = {
  User,
  createUser,
  readUser,
  readUserByToken,
  readUserByEmail,
  readUserByUsername,
  readUsers,
  updateUserInfo,
  updateUserPassword,
  deleteUser,

  Role,
  linkRoleAndUser,
  createRole,
  readRole,
  readRoles,
  updateRole,
  deleteRole,

  deleteRolesUserConnection,
}
