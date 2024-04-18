// Create python template
function createPythonTemplate(docName, api, listoffields) {
    // Convert the document name to the appropriate format
    let className = docName.split('_')
                           .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                           .join('');
    // Get function postfix from docname lower case 
    let function_postfix = docName.toLowerCase();
    erp_module = api
    api = api.toLowerCase();
    let pyContent = `# Copyright (c) 2024, SG Controls and contributors
# For license information, please see license.txt

import frappe
import requests
import urllib
import base64
import json
# import sgc_xero.utils 
from frappe.model.document import Document
from sgc_${api}.authenticate import get_access_token

frappe.utils.logger.set_log_level("INFO")
logger = frappe.logger("${erp_module}", allow_site=True, file_count=5)

endpoint_${function_postfix} = frappe.get_doc("${erp_module} Settings").endpoint_${function_postfix}
tenant_id = frappe.get_doc("${erp_module} Settings").tenant_id

class ${className}(Document):
    def validate(self):

        # Add custom validation here

        if save_${function_postfix}():
            frappe.msgprint("${className} saved successfully.")
        else:
            frappe.throw("Error saving ${className}.")
        pass
    
    
def save_${function_postfix}():
    if ${function_postfix}.id:
        if get_(${function_postfix}):
            update_${function_postfix}(${function_postfix})
            return True

    id = create_${function_postfix}(${function_postfix})
        if not id:
            return False
        ${function_postfix}.id = id
        return True
`;
    
    pyContent += codeCreate(docName, api);
    pyContent += codeUpdate(docName, api);
    pyContent += codeGet(docName, api);
    pyContent += codeFieldsMapping(docName, api, listoffields);
    return pyContent;
}

function codeFieldsMapping(docName, api, listoffields) {
    let function_postfix = docName.toLowerCase();
    let pyContent = `
def ${api}_${function_postfix}(${function_postfix}: Document) --> dict:
    #Add custom converters here\n`
    listoffields.forEach(field => {
        if (field.api_fieldname) {
            pyContent += `    ${field.api_fieldname} = ${function_postfix}.${field.fieldname}\n`
        }

    });
    pyContent += `
    return {key: value for key, value in {\n`
    listoffields.forEach(field => {
        if (field.api_fieldname) {
            pyContent += `      '${field.api_fieldname}': ${field.api_fieldname},\n`
        }
    });
    pyContent += `      }.items() if value}`

    return pyContent;
}



function codeCreate(docName, api) {
    // Get function postfix from docname lower case 
    let function_postfix = docName.toLowerCase();
    let pyContent = `
def create_${function_postfix}(${function_postfix}: Document}):
    data = [${api}_${function_postfix}(${function_postfix})]

    # Put together the request
    access_token = get_access_token()
    headers = {
        'Authorization': f'Bearer + access_token',
        '${api}-Tenant-ID': tenant_id,
        'Accept': 'application/json',  
        'Content-Type': 'application/json'
    }

    # Send the request
    response = requests.post(endpoint_${function_postfix}, headers=headers, data=json.dumps(data))

    # Check the response
    if response.status_code == 200:
        id = response.json().get('id')
        return id
    else:
        frappe.throw(f"Error creating ${function_postfix}: {response.text}
`

    return pyContent;
}


function codeUpdate(docName, api) {
    // Get function postfix from docname lower case 
    let function_postfix = docName.toLowerCase();
    let pyContent = `
def update_${function_postfix}(${function_postfix}: Document}) --> bool:
    id = ${function_postfix}.id
    url = endpoint_${function_postfix} + "/" + urllib.parse.quote(id, safe = '/()')
    data = [${api}_${function_postfix}(${function_postfix})]

    access_token = get_access_token()
    headers = {
        'Authorization': f'Bearer + access_token',
        '${api}-Tenant-ID': tenant_id,
        'Accept': 'application/json',  
        'Content-Type': 'application/json'
    }

    response = requests.post(url, headers=headers, data=json.dumps(data))

    if response.status_code == 200:
        return True
    else:
        frappe.throw(f"Error updating ${function_postfix}: {response.text}
`
    
    return pyContent
}

function codeGet(docName, api) {
    // Get function postfix from docname lower case 
    let function_postfix = docName.toLowerCase();
    let pyContent = `
def get_${function_postfix}(id: str) --> dict:
    url = endpoint_${function_postfix} + "/" + urllib.parse.quote(id, safe = '/()')

    access_token = get_access_token()
    headers = {
        'Authorization': f'Bearer + access_token',
        '${api}-Tenant-ID': tenant_id,
        'Accept': 'application/json'
        'Content-Type': 'application/json'
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        frappe.throw(f"Error getting ${function_postfix}: {response.text}
`

    return pyContent;
}


function codeList(docName, api) {
    // Get function postfix from docname lower case 
    let function_postfix = docName.toLowerCase();
    let pyContent = `
def get_list():
    # todo: implement get_list
    # Call api to get list of ${function_postfix}
    # For each, create a new ${function_postfix} object and save it

    pass`
    return pyContent;

}