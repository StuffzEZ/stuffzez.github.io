const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const previouspage = urlParams.get('prev')
const goingToPage = urlParams.get('to')

function paramerterTest(parameter) {
    if (parameter !== undefined){
        location.replace("https://stuffzez.github.io/404")
    }
}

function goBack(){
    paramerterTest(previouspage)
    location.replace(previouspage)
}

function continue_1(){
    paramerterTest(goingToPage)
    location.replace(goingToPage)
}