const extensionBase = chrome.extension.getURL('/');

const injectScript = async function (script) {
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
    return parseInt(versionParts[0] + versionParts[1]);
})();

const appId = parseInt(document.getElementById('pFlowId').value);
const pageId = parseInt(document.getElementById('pFlowStepId').value);

// conditionally load features
(async function(){

    // initializing the FOS namespace + the utility functions
    await injectScript({src: 'fos-bundle-global.js'});

    // global variable which will be used when loading extra resources
    await injectScript({code: `FOS.extensionBase = "${extensionBase}";`});

    if(appId == 4000 && pageId == 4500) {
        // does not contain any functionality for now
        // await injectScript({src: 'fos-bundle-pd.js'})
    }

    if(appId == 4000 && [40, 267, 312, 4410].includes(pageId)){
        await injectScript({src: 'fos-bundle-editor.js'});
    }

    // 20.2 specific functionality
    if(apexVersion == 202){
        if(appId == 4000 && pageId == 101){
            await injectScript({src: 'fos-bundle-embeddedCode.js'});
        }
    
        if((appId == 4000 && [4500, 4410].includes(pageId)) || (appId == 4500 && pageId == 1003)){
            await injectScript({src: 'fos-bundle-monacoFixes.js'});
        }
    }
})();