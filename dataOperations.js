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
