const extensionBase = browser.extension.getURL('/');

async function injectScript(src, code) {
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');

    if(src){
        script.src = extensionBase + src;
    }

    if(code){
        script.text = code;
    }

    script.type = 'text/javascript';

    if(src){
        return new Promise(resolve => {
            script.addEventListener('load', resolve);
            head.appendChild(script);
        });
    } else {
        head.appendChild(script);
    }
}

(async function(){
    await injectScript(null, 'window.fosExtensionBase = "' + extensionBase + '";', false);
    await injectScript('injectedMain.js', null, false);
})();