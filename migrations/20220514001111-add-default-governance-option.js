'use strict'

var dbm
var type
var seed

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate
  type = dbm.dataType
  seed = seedLink
}

exports.up = function (db) {
  // If there is a theme, we need to delete it anyway
  const sql = 'DELETE FROM governance_files'
  db.runSql(sql, function (err) {
    if (err) return console.log(err)
  })

  return db
    .insert(
      'governance_files',
      ['governance_path', 'governance_file'],
      [
        'http://localhost:3100/api/governance-framework-atomic-actions',
        JSON.stringify({
          "@context": [
            "https://github.com/hyperledger/aries-rfcs/blob/main/concepts/0430-machine-readable-governance-frameworks/context.jsonld"
          ],
          "name": "Cardea Governance",
          "version": "0.1",
          "format": "1.0",
          "id": "<uuid>",
          "description": "This document describes COVID health governance in a machine readable way.",
          "last_updated": "2022-05-25",
          "docs_uri": "need_to_create",
          "data_uri": "need_to_create",
          "topics": [
            "medical"
          ],
          "jurisdictions": [
            "US>NY>New York City",
            "AW"
          ],
          "geos": [
            "USA",
            "Ukraine"
          ],
          "schemas": [
            {
              "id": "4CLG5pU5v294VdkMWxSByu:2:Email:1.0",
              "name": "Validated Email"
            },
            {
              "id": "4CLG5pU5v294VdkMWxSByu:2:SMS:1.0",
              "name": "SMS"
            },
            {
              "id": "4CLG5pU5v294VdkMWxSByu:2:Medical_Release:1.0",
              "name": "Medical Release"
            },
            {
              "id": "RuuJwd3JMffNwZ43DcJKN1:2:Lab_Order:1.4",
              "name": "Lab Order"
            },
            {
              "id": "RuuJwd3JMffNwZ43DcJKN1:2:Lab_Result:1.4",
              "name": "Lab Result"
            },
            {
              "id": "RuuJwd3JMffNwZ43DcJKN1:2:Vaccination:1.4",
              "name": "Vaccine"
            },
            {
              "id": "RuuJwd3JMffNwZ43DcJKN1:2:Vaccine_Exemption:1.4",
              "name": "Vaccine Exemption"
            },
            {
              "id": "RuuJwd3JMffNwZ43DcJKN1:2:Trusted_Traveler:1.4",
              "name": "Trusted Traveler"
            }
          ],
          "participants": [
            {
              "name": "Government",
              "id": "8ovm21fXr1qZHoSuDcBtmb",
              "describe": {
                "label": "Government",
                "sublabel": "Government",
                "website": "issuinggovernmentsite.org",
                "email": "credential_manager@issuinggovernmentsite.org"
              }
            },
            {
              "name": "General Hospital",
              "id": "3pTbxYsKQq3qitvnJyZeYJ",
              "describe": {
                "label": "General Hospital",
                "sublabel": "General Hospital",
                "website": "issuinglabsite.com",
                "email": "credential_manager@issuinglabsite.com"
              }
            },
            {
              "name": "Hilton Casino",
              "id": "did:example:casino",
              "describe": {
                "label": "Hilton Resort and Casino",
                "sublabel": "Verifying Org",
                "website": "verifyingorgsite.com",
                "email": "verifying_manager@verifyingorgsite.com"
              }
            }
          ],
          "roles": [
            "holder",
            "health_issuer",
            "travel_issuer",
            "health_verifier",
            "travel_verifier",
            "hospitality_verifier",
            "any"
          ],
          "permissions": [
            {
              "grant": [
                "health_issuer"
              ],
              "when": {
                "any": [
                  {
                    "id": "did:example:hospital"
                  },
                  {
                    "id": "3pTbxYsKQq3qitvnJyZeYJ"
                  }
                ]
              }
            },
            {
              "grant": [
                "travel_issuer"
              ],
              "when": {
                "any": [
                  {
                    "id": "8ovm21fXr1qZHoSuDcBtmb"
                  }
                ]
              }
            },
            {
              "grant": [
                "health_verifier"
              ],
              "when": {
                "any": [
                  {
                    "id": "8ovm21fXr1qZHoSuDcBtmb"
                  }
                ]
              }
            },
            {
              "grant": [
                "travel_verifier"
              ],
              "when": {
                "any": [
                  {
                    "id": "8ovm21fXr1qZHoSuDcBtmb"
                  }
                ]
              }
            },
            {
              "grant": [
                "hospitality_verifier"
              ],
              "when": {
                "any": [
                  {
                    "id": "did:example:casino"
                  }
                ]
              }
            },
            {
              "grant": [
                "any"
              ],
              "when": {
                "any": [
                  {
                    "id": ""
                  }
                ]
              }
            }
          ],
          "protocols": [
            {
              "name": "connect",
              "protocol": "https://didcomm.org/connections/1.0/",
              "startmessage": "invitation",
              "details": {}
            },
            {
              "name": "issue_lab_order",
              "protocol": "https://didcomm.org/issue-credential/1.0/",
              "startmessage": "offer-credential",
              "details": {
                "schema": "RuuJwd3JMffNwZ43DcJKN1:2:Lab_Order:1.4",
                "presentation_definition": "hl:zm9YZpCjPLPJ4Epc:z3TSgaEFFHxY2tsArhUreJ4ixgw9NW7DYuQ9QTPUJFDD"
              }
            },
            {
              "name": "issue_lab_result",
              "protocol": "https://didcomm.org/issue-credential/1.0/",
              "startmessage": "offer-credential",
              "details": {
                "schema": "RuuJwd3JMffNwZ43DcJKN1:2:Lab_Result:1.4",
                "presentation_definition": "hl:zm9YZpCjPLPJ4Epc:z3TSgXTuaHxY2tsArhUreJ4ixgw9NW7DYuQ9QTPQOPPS"
              }
            },
            {
              "name": "issue_vaccine",
              "protocol": "https://didcomm.org/issue-credential/1.0/",
              "startmessage": "offer-credential",
              "details": {
                "schema": "RuuJwd3JMffNwZ43DcJKN1:2:Vaccination:1.4",
                "presentation_definition": "hl:zm9YZpCjPLPJ4Epc:z3TSgXTuaHxY2tsArhUreJ4ixgw9NW7DYuQ9QTPQJKDe"
              }
            },
            {
              "name": "issue_vaccine_exemption",
              "protocol": "https://didcomm.org/issue-credential/1.0/",
              "startmessage": "offer-credential",
              "details": {
                "schema": "RuuJwd3JMffNwZ43DcJKN1:2:Vaccine_Exemption:1.4",
                "presentation_definition": "hl:zm9YZpCjPLPJ4Epc:z3TSgXTuaHxY2tsArhUreJ4ixgw9NW7DYuQ9QTPQMJQd"
              }
            },
            {
              "name": "issue_trusted_traveler",
              "protocol": "https://didcomm.org/issue-credential/1.0/",
              "startmessage": "offer-credential",
              "details": {
                "schema": "RuuJwd3JMffNwZ43DcJKN1:2:Trusted_Traveler:1.4",
                "presentation_definition": "http://localhost:3100/api/presentation-exchange"
              }
            },
            {
              "name": "verify_identity",
              "protocol": "https://didcomm.org/present-proof/1.0/",
              "startmessage": "request-presentation",
              "details": {}
            },
            {
              "name": "verify_lab_order",
              "protocol": "https://didcomm.org/present-proof/1.0/",
              "startmessage": "request-presentation",
              "details": {
                "schema": "RuuJwd3JMffNwZ43DcJKN1:2:Lab_Order:1.4"
              }
            },
            {
              "name": "verify_lab_result",
              "protocol": "https://didcomm.org/present-proof/1.0/",
              "startmessage": "request-presentation",
              "details": {
                "schema": "RuuJwd3JMffNwZ43DcJKN1:2:Lab_Result:1.4"
              }
            },
            {
              "name": "verify_vaccine",
              "protocol": "https://didcomm.org/present-proof/1.0/",
              "startmessage": "request-presentation",
              "details": {
                "schema": "RuuJwd3JMffNwZ43DcJKN1:2:Vaccination:1.4"
              }
            },
            {
              "name": "verify_vaccine_exemption",
              "protocol": "https://didcomm.org/present-proof/1.0/",
              "startmessage": "request-presentation",
              "details": {
                "schema": "RuuJwd3JMffNwZ43DcJKN1:2:Vaccine_Exemption:1.4"
              }
            },
            {
              "name": "verify_trusted_traveler",
              "protocol": "https://didcomm.org/present-proof/1.0/",
              "startmessage": "request-presentation",
              "details": {
                "schema": "RuuJwd3JMffNwZ43DcJKN1:2:Trusted_Traveler:1.4",
                "presentation_definition": [
                  {
                    "travel_verifier": "hl:zm9YZpCjPLPJ4Epc:z3TSgXTuaHxY2tsArhUreJ4ixgw9NW7DYuQ9QTPQyLHy"
                  },
                  {
                    "hospitality_verifier": "hl:zm9YZpCjPLPJ4Epc:z3TSgXTuaHxY2tsArhUreJ4ixgw9NW7DYuQ9QTPQyLHy"
                  }
                ]
              }
            }
          ],
          "privileges": [
            {
              "grant": [
                "issue_lab_order"
              ],
              "when": {
                "any": [
                  {
                    "role": "any"
                  }
                ]
              }
            },
            {
              "grant": [
                "issue_lab_result"
              ],
              "when": {
                "any": [
                  {
                    "role": "any"
                  }
                ]
              }
            },
            {
              "grant": [
                "issue_vaccine"
              ],
              "when": {
                "any": [
                  {
                    "role": "any"
                  }
                ]
              }
            },
            {
              "grant": [
                "issue_vaccine_exemption"
              ],
              "when": {
                "any": [
                  {
                    "role": "any"
                  },
                  {
                    "role": "holder"
                  }
                ]
              }
            },
            {
              "grant": [
                "issue_trusted_traveler"
              ],
              "when": {
                "any": [
                  {
                    "role": "travel_issuer"
                  }
                ]
              }
            },
            {
              "grant": [
                "verify_identity"
              ],
              "when": {
                "any": [
                  {
                    "role": "any"
                  },
                  {
                    "role": "travel_issuer"
                  },
                  {
                    "role": "health_verifier"
                  },
                  {
                    "role": "travel_verifier"
                  },
                  {
                    "role": "hospitality_verifier"
                  }
                ]
              }
            },
            {
              "grant": [
                "verify_lab_order"
              ],
              "when": {
                "any": [
                  {
                    "role": "health_verifier"
                  }
                ]
              }
            },
            {
              "grant": [
                "verify_lab_result"
              ],
              "when": {
                "any": [
                  {
                    "role": "health_verifier"
                  }
                ]
              }
            },
            {
              "grant": [
                "verify_vaccine"
              ],
              "when": {
                "any": [
                  {
                    "role": "health_verifier"
                  }
                ]
              }
            },
            {
              "grant": [
                "verify_vaccine_exemption"
              ],
              "when": {
                "any": [
                  {
                    "role": "health_verifier"
                  }
                ]
              }
            },
            {
              "grant": [
                "verify_trusted_traveler"
              ],
              "when": {
                "any": [
                  {
                    "role": "travel_verifier"
                  },
                  {
                    "role": "hospitality_verifier"
                  }
                ]
              }
            }
          ],
          "actions": [
            {
              "name": "connect-holder-health-issuer",
              "role": [
                "any"
              ],
              "initial": true,
              "type": "protocol",
              "data": {
                "protocol": "https://didcomm.org/connections/1.0/",
                "startmessage": "invitation"
              },
              "next": {
                "success": "",
                "error": "some-kind-of-error-handler..."
              }
            },
            {
              "name": "ask-demographics",
              "role": [
                "any"
              ],
              "type": "protocol",
              "data": {
                "protocol": "https://didcomm.org/questionAnswer/1.0/",
                "startmessage": "question",
                "question_answer": [
                  {
                    "question": "Have you received a question from ask question button?"
                  },
                  {
                    "question_detail": "Please select an option below:"
                  },
                  {
                    "valid_responses": [
                      {
                        "text": "Yes"
                      },
                      {
                        "text": "No"
                      }
                    ]
                  }
                ]
              },
              "next": {
                "success": "",
                "error": "some-kind-of-error-handler..."
              }
            },
            {
              "name": "request-identity-presentation",
              "role": [
                "any"
              ],
              "type": "protocol",
              "data": {
                "protocol": "https://didcomm.org/present-proof/1.0/",
                "startmessage": ["request-presentation"]
              },
              "next": {
                "success": "",
                "error": "some-kind-of-error-handler..."
              }
            },
            {
              "name": "request-presentation",
              "role": [
                "any"
              ],
              "type": "protocol",
              "data": {
                "protocol": "https://didcomm.org/present-proof/1.0/",
                "startmessage": ["request-presentation"]
              },
              "next": {
                "success": "",
                "error": "some-kind-of-error-handler..."
              }
            },
            {
              "name": "issue-medical-release",
              "role": [
                "any"
              ],
              "type": "protocol",
              "data": {
                "schema": "RuuJwd3JMffNwZ43DcJKN1:2:Medical_Release:1.1",
                "protocol": "https://didcomm.org/issue-credential/1.0/",
                "startmessage": "offer-credential"
              },
              "next": {
                "success": "",
                "error": "some-kind-of-error-handler..."
              }
            },
            {
              "name": "issue-lab-result",
              "role": [
                "any"
              ],
              "type": "protocol",
              "data": {
                "schema": "RuuJwd3JMffNwZ43DcJKN1:2:Lab_Result:1.4",
                "protocol": "https://didcomm.org/issue-credential/1.0/",
                "startmessage": "offer-credential"
              },
              "next": {
                "success": "",
                "error": "some-kind-of-error-handler..."
              }
            },
            {
              "name": "issue-exemption",
              "role": [
                "any"
              ],
              "type": "protocol",
              "data": {
                "schema": "RuuJwd3JMffNwZ43DcJKN1:2:Exemption:1.4",
                "protocol": "https://didcomm.org/issue-credential/1.0/",
                "startmessage": "offer-credential"
              },
              "next": {
                "success": "",
                "error": "some-kind-of-error-handler..."
              }
            },
            {
              "name": "issue-vaccination",
              "role": [
                "any"
              ],
              "type": "protocol",
              "data": {
                "schema": "RuuJwd3JMffNwZ43DcJKN1:2:Vaccination:1.4",
                "protocol": "https://didcomm.org/issue-credential/1.0/",
                "startmessage": "offer-credential"
              },
              "next": {
                "success": "",
                "error": "some-kind-of-error-handler..."
              }
            },
            {
              "name": "send-basic-message",
              "role": [
                "any"
              ],
              "initial": true,
              "type": "protocol",
              "data": {
                "protocol": "https://didcomm.org/basic-message/1.0/",
                "startmessage": "basic-message",
                "content": "The is a test basic message"
              },
              "next": {
                "success": "",
                "error": "some-kind-of-error-handler..."
              }
            }
          ]
        }),
      ],
    )
}

exports.down = function (db) {
  const sql = 'DELETE FROM governance_files'
  db.runSql(sql, function (err) {
    if (err) return console.log(err)
  })
  return null
}

exports._meta = {
  version: 1,
}
