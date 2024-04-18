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

function displayDoctypeProperties(containerId, data){
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    if(!data || !data.length){
        container.textContent = "No data available.";
        return;
    }
    const table = document.createElement("table");
    const tbody = document.createElement("tbody");

    data.forEach(item => {
        console.log(item)
        const row = document.createElement("tr");
        const actionCell = document.createElement("td");
        const keyCell = document.createElement("td");
        const valueCell = document.createElement("td");

        const copyBtn = document.createElement("button");
        copyBtn.textContent = "Copy";
        copyBtn.onclick = function() {
            copyToRightPane(item, 'properties');
        };
        actionCell.appendChild(copyBtn);

        keyCell.textContent = Object.keys(item)[0]; // assuming each item has only one key-value pair
        valueCell.textContent = item[Object.keys(item)[0]]; // getting the value of the key

        row.appendChild(actionCell);
        row.appendChild(keyCell);
        row.appendChild(valueCell);
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}




function displayJSONTable(containerId, data, includeCopy) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    if (!data || !data.length) {
        container.textContent = "No data available.";
        return;
    }
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    const headerRow = document.createElement("tr");

    const uniqueKeys = [...new Set(data.flatMap(Object.keys))];

    // If includeCopy is true, add 'Action' as the first header
    if (includeCopy) {
        const copyTh = document.createElement("th");
        copyTh.textContent = "Action";
        headerRow.appendChild(copyTh);
    }

    uniqueKeys.forEach(key => {
        const th = document.createElement("th");
        th.textContent = key;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    
    data.forEach(item => {
        const row = document.createElement("tr");

        // If includeCopy is true, add the 'Copy' button as the first cell in the row
        if (includeCopy) {
            const copyTd = document.createElement("td");
            const copyBtn = document.createElement("button");
            copyBtn.textContent = "Copy";
            // copyBtn.onclick = function() {
            //     copyToRightPane(item, containerId.includes("permissions") ? 'permissions' : 'fields');
            // };

            copyBtn.onclick = function() {
                copyToRightPane(item, containerId.includes("doctype") ? 'doctype' : containerId.includes("permissions") ? 'permissions' : 'fields');
            };
            
            
            copyTd.appendChild(copyBtn);
            row.appendChild(copyTd);
        }

        uniqueKeys.forEach(key => {
            const td = document.createElement("td");
            td.textContent = item[key] ? (typeof item[key] === 'object' ? JSON.stringify(item[key]) : item[key]) : '';
            row.appendChild(td);
        });

        tbody.appendChild(row);
    });
    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);
}

function displayEditableJSONTable(containerId, data) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (!data || !data.length) {
        container.textContent = "No data available.";
        return;
    }

    // Get all unique keys from the data, with 'Action' first, excluding 'fieldname' and 'fieldtype' for permissions
    let allKeys;
    if (containerId.includes("permissions")) {
        allKeys = ['Action', ...new Set(data.flatMap(Object.keys).filter(key => !['Action', 'fieldname', 'fieldtype'].includes(key)))];
    } else {
        allKeys = ['Action', 'fieldname', 'fieldtype', ...new Set(data.flatMap(Object.keys).filter(key => !['Action', 'fieldname', 'fieldtype'].includes(key)))];
    }

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    const headerRow = document.createElement("tr");

    // Add headers
    allKeys.forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    
    data.forEach((item, index) => {
        const row = document.createElement("tr");

        // Add cells for each key
        allKeys.forEach(key => {
            const td = document.createElement("td");
            if (key === 'Action') {
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Delete";
                deleteBtn.onclick = function() {
                    data.splice(index, 1);
                    displayEditableJSONTable(containerId, data);
                };
                td.appendChild(deleteBtn);
            } else {
                td.textContent = item[key] ? (typeof item[key] === 'object' ? JSON.stringify(item[key]) : item[key]) : '';
                td.contentEditable = "true";
                td.onblur = function() {
                    // Update the original data when the user finishes editing
                    if (key in item && typeof item[key] === 'object') {
                        // If the original value was an object, try to parse the new value as JSON
                        try {
                            item[key] = JSON.parse(td.textContent);
                        } catch (error) {
                            console.error("Error parsing JSON", error);
                            alert("Invalid JSON format.");
                        }
                    } else {
                        // If the original value was not an object, just save the new value as a string
                        item[key] = td.textContent;
                    }
                };
            }
            row.appendChild(td);
        });

        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);
}

function displayEditablePropertiesTable(containerId, data) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (!data || !data.length) {
        container.textContent = "No data available.";
        return;
    }

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headers = ['Action', 'Key', 'Value'];
    const headerRow = document.createElement("tr");
    headers.forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    data.forEach((item, index) => {
        const row = document.createElement("tr");
        headers.forEach(header => {
            const td = document.createElement("td");
            if (header === 'Action') {
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Delete";
                deleteBtn.onclick = function() {
                    data.splice(index, 1);
                    displayEditablePropertiesTable(containerId, data);
                };
                td.appendChild(deleteBtn);
            } else if (header === 'Key') {
                td.textContent = Object.keys(item)[0];
            } else { // header === 'Value'
                td.textContent = item[Object.keys(item)[0]];
                td.contentEditable = "true";
                td.onblur = function() {
                    // Update the original data when the user finishes editing
                    item[Object.keys(item)[0]] = td.textContent;
                };
            }
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);
}



let selectedData = {
    properties: [],
    fields: [],
    permissions: []
};


function copyToRightPane(data, type) {
    if (type === 'properties') {
        // If data is an object, convert it to an array of objects first
        const dataArray = Object.keys(data).map(key => ({[key]: data[key]}));
        selectedData[type] = [...selectedData[type], ...dataArray];
    } else {
        let dataWithAllKeys = {};
        let allKeys = [...new Set([...selectedData[type].flatMap(item => Object.keys(item)), ...Object.keys(data)])];
        allKeys.forEach(key => {
            if (key in data) {
                dataWithAllKeys[key] = data[key];
            }
        });
        selectedData[type].push(dataWithAllKeys);
    }
    refreshRightPane();
}



function refreshRightPane() {
    displayEditablePropertiesTable('selected-doctype-view', selectedData.properties);
    displayEditableJSONTable('selected-json-view', selectedData.fields);
    displayEditableJSONTable('selected-permissions-view', selectedData.permissions);
}


function collectSelectedProperties() {
    let propertiesObject = {};
    selectedData.properties.forEach(property => {
        const key = Object.keys(property)[0];
        propertiesObject[key] = property[key];
    });
    return propertiesObject;
}


function collectSelectedJSON() {
    return selectedData.fields;
}

function collectSelectedPermissions() {
    return selectedData.permissions;
}
