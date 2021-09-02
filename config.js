const https = require('https')
const fs = require('fs')
const winston = require('winston')

module.exports = {
  logger: winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
    defaultMeta: {service: 'external-records'},
    transports: [
      //
      // - Write all logs with level `error` and below to `error.log`
      // - Write all logs with level `info` and below to `combined.log`
      //
      new winston.transports.File({
        filename: 'error.log',
        level: 'error',
        maxsize: 52428800,
      }),
      new winston.transports.File({
        filename: 'combined.log',
        maxsize: 52428800,
      }),
    ],
  }),
  'externalRecords': null,
	/*
  'externalRecords': {
    'module': "enterprise-external-records-module",
    'moduleConf': {
      'url': 'https://172.23.0.1:4200',
      'httpsAgent': new https.Agent({
        //  Copy to lab-api/ssl/ca.crt from nginx ssl directories
        ca: fs.readFileSync('ssl/ca.crt') ,
        cert: fs.readFileSync('ssl/client/user.crt'),
        key: fs.readFileSync('ssl/client/user.key'),
        passphrase: 'Protpf1r365Fkl3jr4nmRETvD',
        
        checkServerIdentity: () => { return null; }, // for TESTING only!
        rejectUnauthorized: false // for TESTING only
      }),
      'oauth_client': {
        client: {
          id: 'confidentialApplication',
          secret: 'topSecret'
        },
        auth: {
          tokenHost: 'https://172.23.0.1:4200',
        }
      },
      'oauth_server': {
        clients: [{
          id: 'application',	// TODO: Needed by refresh_token grant, because there is a bug at line 103 in https://github.com/oauthjs/node-oauth2-server/blob/v3.0.1/lib/grant-types/refresh-token-grant-type.js (used client.id instead of client.clientId)
          clientId: 'application',
          clientSecret: 'secret',
          grants: [
            'refresh_token'
          ],
          redirectUris: []
        }],
        confidentialClients: [{
          clientId: 'confidentialApplication',
          clientSecret: 'topSecret',
          grants: [
            'client_credentials',
            'password',
          ],
          redirectUris: []
        }]
      },
      'return_url': 'https://172.23.0.1/api/m/record-result',
    },
    'schemas': {
      'QiPGTNiyXnS218AoTK8h39:2:Vaccination:1.2': {
        'attributes':  [
          "mpid",
          "patient_local_id",
          "sending_facility",
          "patient_surnames",
          "patient_given_names",
          "patient_date_of_birth",
          "patient_gender_legal",
          "patient_street_address",
          "patient_city",
          "patient_state_province_region",
          "patient_postalcode",
          "patient_country",
          "patient_phone",
          "patient_email",
          "vaccine_record_id",
          "vaccine_administration_facility_id",
          "vaccine_administration_facility_id_qualifier",
          "vaccine_administration_facility_name",
          "vaccine_administration_state_province_region",
          "vaccine_administration_postalcode",
          "vaccine_administration_country",
          "vaccine_administration_date",
          "vaccine_dose_number",
          "vaccine_series_complete",
          "vaccine_lot_number",
          "vaccine_code",
          "vaccine_code_qualifier",
          "vaccine_code_name",
          "vaccine_manufacturer_code",
          "vaccine_manufacturer_code_qualifier",
          "vaccine_manufacturer_code_name",
          "vaccine_disease_target_code",
          "vaccine_disease_target_code_qualifier",
          "vaccine_disease_target_name",
          "vaccine_administration_provider_id",
          "vaccine_administration_provider_id_qualifier",
          "vaccine_administration_provider_fullname",
          "vaccine_education_reference_material",
          "certificate_original_issuer",
          "certificate_original_identifier",
          "credential_issuer_name"
        ],
        'schema_id': 'QiPGTNiyXnS218AoTK8h39:2:Vaccination:1.2',
        'schema_version': '1.2',
        'record_id': 'vaccine_record_id'
      },
      'QiPGTNiyXnS218AoTK8h39:2:Lab_Order:1.2': {
        "attributes": [
          "mpid",
          "patient_local_id",
          "patient_surnames",
          "patient_given_names",
          "patient_date_of_birth",
          "patient_gender_legal",
          "patient_street_address",
          "patient_city",
          "patient_state_province_region",
          "patient_postalcode",
          "patient_country",
          "patient_phone",
          "patient_email",
          "lab_specimen_collected_date",
          "lab_specimen_type",
          "lab_order_id",
          "lab_coding_qualifier",
          "lab_code",
          "lab_description",
          "lab_performed_by",
          "ordering_facility_id",
          "ordering_facility_id_qualifier",
          "ordering_facility_name",
          "ordering_facility_state_province_region",
          "ordering_facility_postalcode",
          "ordering_facility_country",
          "credential_issuer"
        ],
        'schema_id': 'QiPGTNiyXnS218AoTK8h39:2:Lab_Order:1.2',
        'schema_version': '1.2',
        'record_id': 'lab_order_id', 
      },
      'QiPGTNiyXnS218AoTK8h39:2:Lab_Result:1.1': {
        "attributes": [
          "mpid",
          "patient_local_id",
          "patient_surnames",
          "patient_given_names",
          "patient_date_of_birth",
          "patient_gender_legal",
          "patient_street_address",
          "patient_city",
          "patient_state_province_region",
          "patient_postalcode",
          "patient_country",
          "patient_phone",
          "patient_email",
          "lab_observation_date_time",
          "lab_specimen_collected_date",
          "lab_specimen_type",
          "lab_result_status",
          "lab_coding_qualifier",
          "lab_code",
          "lab_description",
          "lab_order_id",
          "lab_normality",
          "lab_result",
          "lab_comment",
          "ordering_facility_id",
          "ordering_facility_id_qualifier",
          "ordering_facility_name",
          "ordering_facility_state_province_region",
          "ordering_facility_postalcode",
          "ordering_facility_country",
          "performing_laboratory_id",
          "performing_laboratory_id_qualifier",
          "performing_laboratory_name",
          "performing_laboratory_state_province_region",
          "performing_laboratory_postalcode",
          "performing_laboratory_country",
          "lab_performed_by",
          "credential_issuer"
        ],
        'schema_id': 'QiPGTNiyXnS218AoTK8h39:2:Lab_Result:1.1',
        'schema_version': '1.1',
        'record_id': 'lab_order_id',
      },
      'QiPGTNiyXnS218AoTK8h39:2:Vaccine_Exemption:1.1': {
        "attributes": [
          "mpid",
          "patient_local_id",
          "patient_surnames",
          "patient_given_names",
          "patient_date_of_birth",
          "patient_gender_legal",
          "patient_street_address",
          "patient_city",
          "patient_state_province_region",
          "patient_postalcode",
          "patient_country",
          "patient_phone",
          "patient_email",
          "exemption_record_id",
          "exemption_requestor",
          "exemption_requestor_relationship",
          "exemption_issue_date",
          "exemption_state_province_region",
          "exemption_country",
          "exemption_type",
          "exemption_medical_permanent",
          "exemption_note",
          "exemption_from_all",
          "exemption_diseases_code",
          "exemption_disease_code_qualifier",
          "exemption_disease_code_name",
          "exemption_medical_physician_surnames",
          "exemption_medical_physician_given_names",
          "exemption_medical_physician_full_name",
          "exemption_medical_physician_license_number",
          "exemption_medical_physician_license_type",
          "exemption_medical_physician_license_state_province_region",
          "exemption_medical_physician_license_country",
          "exemption_expiration_date",
          "exemption_credential_issuer",
          "certificate_original_issuer",
          "certificate_original_identifier",
          "credential_issuer_name"
        ],
        'schema_id': 'QiPGTNiyXnS218AoTK8h39:2:Vaccine_Exemption:1.1',
        'schema_version': '1.1',
        'record_id': 'exemption_record_id',
      },
    }
  }*/
}
