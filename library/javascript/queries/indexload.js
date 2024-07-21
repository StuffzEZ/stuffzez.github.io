// Setup Parameters

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const action = urlParams.get('act');

// Code To Check If Parameters Exist

function paramerterTest(parameter) {
    if (parameter !== undefined){
        location.replace("home")
    }
}

// Check If Parameters Exist

// Parameter Code

if (action == "lweb-1"){
    location.replace("https://sites.google.com/view/stuffzez-yt-website")
}
if (action == "lweb-3097501"){
    location.replace("404")
}
if (action == "rl-1"){
    location.replace("index")
}
if (action == "rl-2"){
    location.replace("index.html?act=lweb-1")
}
if (action == "fdj93qjf930"){
    console.log("Loaded index.html?act=fdj93qjf930")
}

if (action == "lweb-2"){
    location.replace("https://github.com/StuffzEZ/stuffzez.github.io")
}
