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
            displayJSONTable('json-table-view', json.fields, true); // JSON fields table
            displayJSONTable('json-permissions-view', json.permissions, false); // JSON permissions table
        } catch (error) {
            console.error("Error parsing JSON", error);
            alert("File content is not valid JSON.");
        }
    };
    reader.readAsText(file);
});

document.getElementById("save-json-btn").addEventListener("click", function() {
    const filepath = "exported.json"; 
    const selectedFields = collectSelectedJSON();
    const selectedPermissions = collectSelectedPermissions();
    const blob = new Blob([JSON.stringify({fields: selectedFields, permissions: selectedPermissions}, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filepath;
    a.click();
});

function displayJSONTable(containerId, data, includeCopy) {
    const container = document.getElementById(containerId);
    container.innerHTML = ""; // Clear existing content
    if (!data || !data.length) {
        container.textContent = "No data available.";
        return;
    }
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    const headerRow = document.createElement("tr");

    const th = document.createElement("th");
    th.textContent = 'Field Details';
    headerRow.appendChild(th);

    if (includeCopy) {
        const copyTh = document.createElement("th");
        copyTh.textContent = "Action";
        headerRow.appendChild(copyTh);
    }
    thead.appendChild(headerRow);
    
    data.forEach(item => {
        const row = document.createElement("tr");
        const td = document.createElement("td");

        // Combines all key-value pairs into a single string
        td.innerHTML = Object.entries(item).map(([key, value]) => 
            `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`
        ).join('<br>');

        row.appendChild(td);

        if (includeCopy) {
            const copyTd = document.createElement("td");
            const copyBtn = document.createElement("button");
            copyBtn.textContent = "Copy";
            copyBtn.onclick = function() {
                copyToRightPane(item, containerId.includes("permissions") ? 'permissions' : 'fields');
            };
            copyTd.appendChild(copyBtn);
            row.appendChild(copyTd);
        }
        tbody.appendChild(row);
    });
    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);
}

let selectedData = {
    fields: [],
    permissions: []
};

function copyToRightPane(data, type) {
    selectedData[type].push(data);
    refreshRightPane();
}

function refreshRightPane() {
    displayJSONTable('selected-json-view', selectedData.fields, false);
    displayJSONTable('selected-permissions-view', selectedData.permissions, false);
}

function collectSelectedJSON() {
    return selectedData.fields;
}

function collectSelectedPermissions() {
    return selectedData.permissions;
}