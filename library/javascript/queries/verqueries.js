// Setup Parameters

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const version = urlParams.get('ver');
const action = urlParams.get('act');

// Code To Check If Parameters Exist

function paramerterTest(parameter) {
    if (parameter !== undefined){
        location.replace("home")
    }
}

paramerterTest(version)
paramerterTest(action)

// TODO: Versions: Docs, Older Versions, New Parts Of Websites