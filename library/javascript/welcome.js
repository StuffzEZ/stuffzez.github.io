const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const previouspage = urlParams.get('prev')

function paramerterTest(parameter) {
    if (parameter !== undefined){
        location.replace("https://stuffzez.github.io/404")
    }
}

// Check If Parameters Exist

paramerterTest(previouspage)

function goBack(){
    location.replace(previouspage)
}
