# Redirect The Viewers Of Your Website Easily
Learn How To Easily Redirect Your Users!

## NOTE: Original Use Is For This Website. Usage On Website Is Below
```html
<button onclick="redirect('page.html')">Learn Coding</button>
```

## How To Add This To Your Website
Add The Following Lines To Your HTML <head> Tag:
```html
<script>
const domain = "https://example.com/" // Replace With Your Domain For Your Website (eg. https://example.com/ or https://hostingprovider.com/mywebsitename/) - Remember The / At The End!

function getdomain() {
    return domain
}
</script>
<script src="https://stuffzez.github.io/cloud/scripts/redirect/redirect.js"></script>
```
  
Then Change "https://example.com" To Your Website (eg. https://example.com/ or https://hostingprovider.com/mywebsitename/).
YOU MUST Have A / At The End
Finally, Add A Button Or Link To Run That Function Like This:
```html
<button onclick="redirect('page.html')">Learn Coding</button>
```
Change "page.html" To The Page On Your Website You Would Like People To Be Redirected To (eg. mypage or my/awesome/website/directory/page).
If You Want To Use A Different Domain Every Time, Leave The "domain" Variable Blank Or Set It To nil.