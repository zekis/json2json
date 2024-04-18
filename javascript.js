
// Create JavaScript template
function createJSTemplate(docName, api, listoffields) {
    // Convert the document name to the appropriate format
    let className = docName.split('_')
                           .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                           .join('');
    
    let jsContent = `// Copyright (c) 2024, SG Controls and contributors
// For license information, please see license.txt

frappe.ui.form.on('${className}', {
    doc_type: function(frm) {
        console.log(frm.doc.doc_type);	
    }
});`; 
    jsContent += codeFieldsMapping(docName, api, listoffields);
    return jsContent;
}



// Create JavaScript template
function createJSListTemplate(docName, api, listoffields) {
    // Convert the document name to the appropriate format
    let className = docName.split('_')
                           .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                           .join('');
    let function_postfix = docName.toLowerCase();
    api = api.toLowerCase();
    let jsContent = `// Copyright (c) 2024, SG Controls and contributors
// For license information, please see license.txt

frappe.listview_settings['${className}'] = {
    onload: function(listview) {
        console.log(listview);
    listview.page.add_action_item('Refresh', function() => update_listview(), 'octicon octicon-sync');
    }
};


function update_listview() {
    frappe.call('sgc_${api}.sgc_${api}.doctype.${function_postfix}.${function_postfix}.get_list')
}`; 
    return jsContent;
}