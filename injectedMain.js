const pageId = document.getElementById('pFlowStepId').value;
const fosExtensionBase = window.fosExtensionBase;

function injectStyle(href){
    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');  
  
    link.rel = 'stylesheet';  
    link.type = 'text/css';   
    link.href = fosExtensionBase + href;  

    head.appendChild(link);
}

async function injectScript(src, code, isModule) {
    const head = document.getElementsByTagName('body')[0];
    const script = document.createElement('script');

    if(src){
        script.src = fosExtensionBase + src;
    }

    if(code){
        script.text = code;
    }

    if(isModule){
        script.type = 'module';
    } else {
        script.type = 'text/javascript';
    }

    if(src){
        return new Promise(resolve => {
            script.addEventListener('load', resolve);
            head.appendChild(script);
        });
    } else {
        head.appendChild(script);
        return;
    }
}

const styles = [
    'style-base.css',
    'third-party/font-apex-2.1/css/font-apex.min.css',
    'third-party/golden-layout-1.5.9/css/goldenlayout-base.css',
    'third-party/golden-layout-1.5.9/css/goldenlayout-dark-theme.css'
];

const scripts = [
    'third-party/golden-layout-1.5.9/goldenlayout.min.js',
    'third-party/terser-4.6.10/bundle.min.js',
    'third-party/less-3.9.0/less.min.js'
];

const requireScript = 'third-party/require-2.3.6/require.js';
const page4410Script = 'bundle-4410.js';
const pages40_312Script = 'bundle-40-312.js';

if(['4410', '40', '312'].indexOf(pageId) > -1){
    const requireIsPresent = window.require != undefined;

    function toggleRequire(){
        if (window.__requirejsToggleBackup) {
            //console.log('▶ Enabling requirejs')
            Object.assign(window, window.__requirejsToggleBackup);
            delete window.__requirejsToggleBackup;
          } else {
            //console.log('⏹ Disabling requirejs')
            window.__requirejsToggleBackup = {
              define: window.define,
              require: window.require,
              requirejs: window.requirejs
            };
          
            for (const field of Object.keys(window.__requirejsToggleBackup)) {
              window[field] = undefined;
            }
          }
    }

    if(requireIsPresent){
        toggleRequire();
    }

    (async function(){

        for(let i = 0; i<styles.length; i++){
            injectStyle(styles[i]);
        }

        for(let i = 0; i<scripts.length; i++){
            await injectScript(scripts[i], null, false);
        }

        if(!requireIsPresent){
            await injectScript(requireScript);
        }

        if(pageId == 4410){
            await injectScript(page4410Script, null, false);
        } else {
            await injectScript(pages40_312Script, null, false);
        }

        if(requireIsPresent){
            toggleRequire();
        }
    })();
}