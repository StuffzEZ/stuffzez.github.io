const currentUrl = window.location.href;

function redirect(checkUrl, redirectUrl){
  const checkUrlFull = "https://stuffzez.github.io/" + checkUrl
  const redirectUrlFull = "https://stuffzez.github.io/" + redirectUrl
  if (currentUrl == checkUrlFull){
    location.replace(redirectUrlFull)
  }
}

function redirectout(checkUrl, redirectUrl, previousPage){
    const checkUrlFull2 = "https://stuffzez.github.io/" + checkUrl
    const redirectUrlFull2 = "https://stuffzez.github.github.io/src/web/leaving-page?to=" + redirectUrl + "&prev=" + previousPage
    if (currentUrl == checkUrlFull2){
      location.replace(redirectUrlFull2)
    }
  }

redirect("theitguide", "blog/theitguide/home")
redirect("redirect/theitguide/id/347182", "blog/theitguide/home?ref=theitguideredirectpage")