document.getElementById("open-json-btn").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        document.getElementById("open-filepath").value = file.name;
        //get the docname from the filename
        let docname = file.name.split('.')[0];
        document.getElementById("save-docname").value = docname;
        try {
            const json = JSON.parse(content);
            const { fields, permissions, field_order, ...restOfJson } = json; // Destructure JSON to separate fields, permissions and field_order

            const objArray = Object.keys(restOfJson).map(key => ({[key]: restOfJson[key]}));
            displayDoctypeProperties('json-doctype-view', objArray);
            console.log(objArray);
            displayJSONTable('json-table-view', json.fields, true); // Pass the rest of the JSON as an array
            displayJSONTable('json-permissions-view', json.permissions, true); // JSON permissions table
        } catch (error) {
            console.error("Error parsing JSON", error);
            alert("File content is not valid JSON.");
        }
    };
    reader.readAsText(file);
});

document.getElementById("open-json-right-btn").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        //document.getElementById("save-filepath").value = file.name;
        let docname = file.name.split('.')[0];
        document.getElementById("save-docname").value = docname;
        try {
            const json = JSON.parse(content);
            const { fields, permissions, field_order, ...restOfJson } = json; 
            const objArray = Object.keys(restOfJson).map(key => ({[key]: restOfJson[key]}));
            //displayDoctypeProperties('json-doctype-view', objArray);
            console.log(objArray);
            //displayJSONTable('json-table-view', json.fields, true); 
            //displayJSONTable('json-permissions-view', json.permissions, true);

            // Update selected data and refresh right pane
            selectedData.properties = objArray;
            selectedData.fields = fields;
            selectedData.permissions = permissions;
            refreshRightPane();

        } catch (error) {
            console.error("Error parsing JSON", error);
            alert("File content is not valid JSON.");
        }
    };
    reader.readAsText(file);
});

document.getElementById("save-json-btn").addEventListener("click", function() {
    const filepath = document.getElementById("save-docname").value + ".json"; 
    const selectedProperties = collectSelectedProperties();
    const selectedFields = collectSelectedJSON();
    const selectedPermissions = collectSelectedPermissions();

    const fieldOrder = selectedFields.map(field => field.fieldname);
    const exportObject = {...selectedProperties, field_order: fieldOrder, fields: selectedFields, permissions: selectedPermissions};

    //const exportObject = {...selectedProperties, fields: selectedFields, permissions: selectedPermissions};
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filepath;
    a.click();
});

document.getElementById("save-python-btn").addEventListener("click", function() {
    const filepath = document.getElementById("save-docname").value + ".py"; 
    let api = document.getElementById("module").value;
    let listoffields = selectedData.fields;
    let pyContent = createPythonTemplate(document.getElementById("save-docname").value, api, listoffields);

    let pyBlob = new Blob([pyContent], {type: "text/plain"});
    let pyUrl = URL.createObjectURL(pyBlob);

    // Create a link and click it to start the download
    let pyLink = document.createElement("a");
    pyLink.href = pyUrl;
    pyLink.download = filepath
    pyLink.click();

});

document.getElementById("save-js-btn").addEventListener("click", function() {
    const filepath = document.getElementById("save-docname").value + ".js"; 
    let api = document.getElementById("api-module").value;
    let jsContent = createJSTemplate(document.getElementById("save-docname").value);

    let jsBlob = new Blob([jsContent], {type: "text/plain"});
    let jsUrl = URL.createObjectURL(jsBlob);

    // Create a link and click it to start the download
    let jsLink = document.createElement("a");
    jsLink.href = jsUrl;
    jsLink.download = filepath
    jsLink.click();
});



