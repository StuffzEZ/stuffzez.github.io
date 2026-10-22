const redirectdomainbase = getdomain()

function redirect(redirectUrl){
    const redirectUrlFull = redirectdomainbase + redirectUrl
    window.location.replace(redirectUrlFull)
}