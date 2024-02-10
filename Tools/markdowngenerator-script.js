function SolidBadgeGenerate() {
    var background_SolidBadge = document.getElementById("background_SolidBadge").value;
    var background_SolidBadge2 = background_SolidBadge.substring(1) // background_SolidBadge With No '#'
    var text_SolidBadge = document.getElementById("text_SolidBadge").value
    var logo_SolidBadge = document.getElementById("logo_SolidBadge").value
    var codeOutput_SolidBadge = "![BadgeName](https://img.shields.io/badge/" + text_SolidBadge + "-" + background_SolidBadge2 + "?style=for-the-badge&logo=" + logo_SolidBadge + "&logoColor=white)"
    console.log(background_SolidBadge2);
    console.log(text_SolidBadge.value);
    // var output_SolidBadge = document.getElementById("ouput_SolidBadge");
    // output_SolidBadge.value = codeOutput_SolidBadge.value;
    var output_function_image_SolidBadge = "https://img.shields.io/badge/" + text_SolidBadge + "-" + background_SolidBadge2 + "?style=for-the-badge&logo=" + logo_SolidBadge + "&logoColor=white"
    var output_function_image_alt_SolidBadge = "The Solid Badge That Has The " + logo_SolidBadge + " Logo On It With The Text" + text_SolidBadge + ". The Background Is The Hex Code " + background_SolidBadge + "."
    ShowOutput(codeOutput_SolidBadge, output_function_image_SolidBadge, output_function_image_alt_SolidBadge)
};

function ShowOutput(text, image, alt) {
    
    // Construct the HTML for the image element
    var imageHTML = '<img src="' + image + '" alt="' + alt + '">';

    // Write the HTML string into the document
    document.write("Markdown Badge Code : " + text);
    document.write("<br>")
    document.write("Preview : " + imageHTML);
}
