document.getElementById("open-json-btn").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        document.getElementById("open-filepath").value = file.name;
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
        document.getElementById("save-filepath").value = file.name;
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
    const filepath = "exported.json"; 
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