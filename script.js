// Setup Parameters

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const link = urlParams.get('w');

// Code To Check If Parameters Exist

function paramerterTest(parameter) {
    if (parameter !== undefined){
        location.replace("home")
    }
}

// Check If Parameters Exist

paramerterTest(link)

// Parameter Code

if (link == "web-1"){
    location.replace("Links/web-1")
}
