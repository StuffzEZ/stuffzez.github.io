// Setup Parameters

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const versionquery = urlParams.get('version');

// Code To Check If Parameters Exist

function paramerterTest(parameter) {
    if (parameter !== undefined){
        console.log("URL Perameter 'version' Is Undefined")
    }
}

// Check If Parameters Exist

paramerterTest(action)

if (versionquery == "choosehome"){
    location.replace("https://stuffzez.github.io/home")
}

if (versionquery == "choosecodedocs"){
    location.replace("https://stuffzez.github.io/src/docs/code/index")
}