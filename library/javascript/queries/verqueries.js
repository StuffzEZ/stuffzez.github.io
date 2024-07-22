// Setup Parameters

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const version = urlParams.get('ver');

// Code To Check If Parameters Exist

function paramerterTest(parameter) {
    if (parameter !== undefined){
        location.replace("home")
    }
}

paramerterTest(version)

// TODO: Versions: Docs, Older Versions, New Parts Of Websites

if (version == "VER_CHOOSE") {
    location.replace('https://stuffzez.github.io/src/web/redirects/redirect_ver_29471')
}

if (version == "VER_DOCS") {
    location.replace('https://stuffzez.github.io/docs/indexhome')
}

if (version == "VER_OLD") {
    location.replace('https://stuffzez.github.io/src/old/indexhome')
}

if (version == "VER_30ARC") {
    location.replace('https://stuffzez.github.io/src/old/versions/v3.0/archive22072024/index')
}