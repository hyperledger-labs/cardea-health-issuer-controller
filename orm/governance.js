const { Sequelize, DataTypes, Model, Op } = require('sequelize')

const init = require('./init.js')
sequelize = init.connect()

class GovernanceFiles extends Model { }

GovernanceFiles.init(
    {
        governance_path: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        governance_file: {
            type: DataTypes.JSON,
            defaultValue: {},
            allowNull: true,
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
        modelName: 'GovernanceFiles',
        tableName: 'governance_files', // Our table names don't follow the sequelize convention and thus must be explicitly declared
        timestamps: false,
    },
)

const createOrUpdateGovernanceFile = async function (
    governance_path,
    governance_file,
) {
    try {
        await sequelize.transaction(
            {
                isolationLevel: Sequelize.Transaction.SERIALIZABLE,
            },
            async (t) => {
                let governanceFile = await GovernanceFiles.findOne({
                    where: {
                        governance_path,
                    },
                })

                const timestamp = Date.now()

                // (JamesKEbert) TODO: Change upsert for a better mechanism, such as locking potentially.
                if (!governanceFile) {
                    console.log('Creating governance file')
                    await GovernanceFiles.upsert({
                        governance_path,
                        governance_file,
                        created_at: timestamp,
                        updated_at: timestamp,
                    })
                } else {
                    console.log('Updating governance file')
                    await GovernanceFiles.update(
                        {
                            governance_file,
                            updated_at: timestamp,
                        },
                        {
                            where: {
                                governance_path,
                            },
                        },
                    )
                }
            },
        )
        console.log('Governance file saved successfully.')
        return true
    } catch (error) {
        console.error('Error saving governance file to the database: ', error)
    }
}

const readGovernanceFile = async function (governance_path) {
    try {
        const governanceFile = await GovernanceFiles.findAll({
            where: {
                governance_path,
            },
        })
        return governanceFile[0]
    } catch (error) {
        console.error('Could not find governance file in the database: ', error)
    }
}

const readGovernanceFiles = async function () {
    try {
        const governanceFiles = await GovernanceFiles.findAll()

        return governanceFiles
    } catch (error) {
        console.error('Could not find governance files in the database: ', error)
    }
}

const deleteGovernanceFile = async function (governance_path) {
    try {
        await GovernanceFiles.destroy({
            where: {
                governance_path,
            },
        })

        console.log('Successfully deleted governance file')
    } catch (error) {
        console.error('Error while deleting governance file: ', error)
    }
}

module.exports = {
    createOrUpdateGovernanceFile,
    readGovernanceFile,
    readGovernanceFiles,
    deleteGovernanceFile
}