async function loadJsonFile(path)
{
    let response = await fetch(path).then(response => {
        if (!response.ok)
            return null;

        return response.json();
    }).catch((reason) => 
    {
        console.error("Exception during loadJsonFile(" + path + ")");
        console.error(reason);
        return null;
    });

    console.debug("Loaded json file from " + path + "!");
    console.debug(response);
    return response;
}

// Loads a json file from the data folder
var Paths = {
    "dataPath": "assets/json/",
};
async function loadJson(path) {
    return loadJsonFile(Paths.dataPath + path);
}