const apexVersion = (function(){
    const fullVersion = document.querySelector('head link[rel="stylesheet"]').href.match(/\?v=(.*)/)[1];
    const versionParts = fullVersion.split('.');
    return versionParts[0] + '.' + versionParts[1];
})();

const appId = parseInt(document.getElementById('pFlowStepId').value);
const pageId = parseInt(document.getElementById('pFlowStepId').value);

const PREFERENCES = {
    theme: 'theme'
};

const STORAGE_ITEM_NAME = 'fos_ext_preferences';

// assumes fosExtensionBase is already on the page
const injectStyle = function(href){
    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');  
  
    link.rel = 'stylesheet';  
    link.type = 'text/css';   
    link.href = fosExtensionBase + href;  

    head.appendChild(link);

    return link;
}

function isDarkMode(){
    return $('head link[rel="stylesheet"][type="text/css"]').filter(function(){
        return $(this).attr('href').indexOf('apex_ui/css/Theme-Dark') > -1;
    }).length == 1;
}

function showPageSuccess(message){
    apex.message.showPageSuccess(message);
}

function showPageError(message){
    apex.message.clearErrors();
    apex.message.showErrors([
        {
            type:     'error',
            location: ['page'],
            message:  message,
            unsafe:   false
        }
    ]);
}

function showItemError(itemName, message){
    apex.message.clearErrors();
    apex.message.showErrors([
        {
            type:     'error',
            location: ['inline'],
            pageItem: itemName,
            message:  message,
            unsafe:   false
        }
    ]);
}

async function injectScript(src){
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');

    script.setAttribute('src', src);

    return new Promise(function(resolve){
        script.addEventListener('load', resolve);
        head.appendChild(script);
    });
}

function storePreferencesInStorage(preferences){
    localStorage.setItem(STORAGE_ITEM_NAME, JSON.stringify(preferences));
}

function getPreferencesFromStorage(){
    const preferences = localStorage.getItem(STORAGE_ITEM_NAME) || '{}';

    let preferencesJson;
    try {
        preferencesJson = JSON.parse(preferences);
    } catch(e) {
        storePreferencesInStorage(JSON.stringify({}));
    }

    return preferencesJson;
}

function getPreference(name){
    if(!PREFERENCES.theme){
        console.warn('FOS - Unknown setting name', name);
        return null;
    }

    return getPreferencesFromStorage()[name];
}

function setPreference(name, value){
    if(!PREFERENCES.theme){
        console.warn('FOS - Unknown setting name', name);
        return;
    }
    const preferences = getPreferencesFromStorage();
    preferences[name] = value;
    storePreferencesInStorage(preferences);
}

export {apexVersion, appId, pageId, PREFERENCES, showPageSuccess, showPageError, showItemError, injectScript, injectStyle,  getPreference, setPreference, isDarkMode};

