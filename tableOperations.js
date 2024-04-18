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
        allKeys = ['Action', 'fieldname', 'fieldtype','api_fieldname', ...new Set(data.flatMap(Object.keys).filter(key => !['Action', 'fieldname', 'fieldtype'].includes(key)))];
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
                deleteBtn.classList.add("delete-btn");
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
                deleteBtn.classList.add("delete-btn");
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
