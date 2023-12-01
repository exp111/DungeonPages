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
    "dataPath": "assets/data/",
    "mapPath": "maps/",
    "dungeonPath": "dungeons/",
    "characterPath": "characters/",
};
async function loadJson(path) {
    return loadJsonFile(Paths.dataPath + path);
}
async function loadMapJson(path) {
    return loadJsonFile(Paths.dataPath + Paths.mapPath + path);
}
async function loadDungeonJson(path) {
    return loadJsonFile(Paths.dataPath + Paths.dungeonPath + path);
}
async function loadCharacterJson(path) {
    return loadJsonFile(Paths.dataPath + Paths.characterPath + path);
}