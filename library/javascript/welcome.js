const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const previouspage = urlParams.get('prev')

function goBack(){
    location.replace(previouspage)
}
