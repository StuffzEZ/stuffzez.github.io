(function() {
    console.log('[stuffzez.github.io Homework Tools | No Gauth Limit] Injecting Script...');

    // Expanded domain list
    const domains = [
        'gauthmath.com',
        'byteintl.com',
        'clarity.ms',
        'bing.com'
    ];

    function clearCookiesForCurrentDomain() {
        console.log('[stuffzez.github.io Homework Tools | No Gauth Limit] Executing Cookie Clearer Function...');
        const currentDomain = location.hostname;

        if (domains.some(domain => currentDomain === domain || currentDomain.endsWith('.' + domain))) {
            document.cookie.split(";").forEach(function(cookie) {
                const name = cookie.split("=")[0].trim();
                // Try to clear cookies for both path=/ and domain=current
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${currentDomain}`;
            });
            console.log(`[stuffzez.github.io Homework Tools | No Gauth Limit] Cleared cookies for ${currentDomain}`);
            console.log("[stuffzez.github.io Homework Tools | No Gauth Limit] Reloading...");
            location.reload();
        } else {
            console.warn(`[stuffzez.github.io Homework Tools | No Gauth Limit] Not on supported domain — no action taken. Current: ${currentDomain}`);
        }
    }

    console.log('[stuffzez.github.io Homework Tools | No Gauth Limit] Injected Script!');
    console.log('[stuffzez.github.io Homework Tools | No Gauth Limit] Running Script!');
    clearCookiesForCurrentDomain();
})();
