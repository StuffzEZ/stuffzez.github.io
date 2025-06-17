  window.onload = function () {
    // Get GitHub username from domain (e.g., username.github.io)
    const hostnameParts = window.location.hostname.split(".");
    const githubUser = hostnameParts[0];

    // Get the current script tag (the last one loaded)
    const currentScript = document.currentScript || (function() {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

    // Get the defaultrepo attribute
    const defaultRepo = currentScript.getAttribute("defaultrepo") || githubUser + ".github.io";

    const pathParts = window.location.pathname.split("/").filter(Boolean);

    if (pathParts.length === 2 && pathParts[0] === "repo") {
      // /repo/REPONAME → redirect to that repo
      const repoName = pathParts[1];
      window.location.href = `https://github.com/${githubUser}/${repoName}`;
    } else if (pathParts.length === 1 && pathParts[0] === "repo") {
      // /repo → redirect to default repo
      window.location.href = `https://github.com/${githubUser}/${defaultRepo}`;
    } else {
      console.log("NORMAL 404 - NOT REPO VERSION");
    }
  };
