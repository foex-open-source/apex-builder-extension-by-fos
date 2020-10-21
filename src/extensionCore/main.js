const extensionBase = chrome.extension.getURL('/');

async function injectScript(script) {
    const head = document.getElementsByTagName('head')[0];
    const scriptElem = document.createElement('script');

    if(script.src){
        scriptElem.src = extensionBase + script.src;
    }

    if(script.code){
        scriptElem.text = script.code;
    }

    scriptElem.type = 'text/javascript';

    if(scriptElem.src){
        return new Promise(resolve => {
            scriptElem.addEventListener('load', resolve);
            head.appendChild(scriptElem);
        });
    } else {
        head.appendChild(scriptElem);
    }
}

const apexVersion = (function(){
    const fullVersion = document.querySelector('head link[rel="stylesheet"]').href.match(/\?v=(.*)/)[1];
    const versionParts = fullVersion.split('.');
    return versionParts[0] + '.' + versionParts[1];
})();

// app 4000 is assumed
// due to the match patterns in the manifest file,
// the page will always be in (40, 267, 312, 4410, 4500)
const pageId = parseInt(window.location.search.split(':')[1]);

(async function(){
    await injectScript({code: 'window.fosExtensionBase = "' + extensionBase + '";'});

    if(pageId == 4500) {
        await injectScript({src: 'bundle-pd.js'})
    }

    if([40, 267, 312, 4410].includes(pageId)){
        await injectScript({src: 'bundle-editor.js'});
    }

    if(pageId == 101 && apexVersion == '20.2'){
        await injectScript({src: 'bundle-embeddedCode.js'});
    }

    if([1003, 4500, 4410].includes(pageId) && apexVersion == '20.2'){
        await injectScript({src: 'bundle-monacoFixes.js'});
    }

})();