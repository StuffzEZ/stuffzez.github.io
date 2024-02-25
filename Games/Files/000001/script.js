var b = document.querySelector("clickBTN");
b.addEventListener("click",change);
function change()
{
    var i = Math.floor(Math.random()*500)+1;
    var j = Math.floor(Math.random()*500)+1;
    b.style.left = i+"px";
    b.style.top = j+"px";
}

// Add a mouseover event listener
clickBTN.addEventListener('mouseover', () => {
  change()
});

function updatesSHOW() {
    window.location.replace("https://github.com/StuffzEZ/stuffzez.github.io/blob/main/Updates.md")
}
