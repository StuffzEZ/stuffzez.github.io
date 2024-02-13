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

paramerterTest(action)

// Parameter Code

if (action == "lweb-1"){
    location.replace("Links/web-1")
}
if (action == "lweb-3097501"){
    location.replace("https://sites.google.com/view/stuffzez-yt-website/links/hidden/hfkw03jnc_fj03sk/309jiojiofwf_aj390ajf/jf0402_fk30sk")
}
if (action == "rl-1"){
    location.replace("index")
}
if (action == "rl-2"){
    location.replace("index.html?act=lweb-1")
}
