const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const previouspage = urlParams.get('prev')

function paramerterTest(parameter) {
    if (parameter !== undefined){
        location.replace("home")
    }
}

function goBack(){
    paramerterTest(previouspage)
    location.replace(previouspage)
}
