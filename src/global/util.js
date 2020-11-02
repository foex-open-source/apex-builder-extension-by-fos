import helpText from './helpText.json';

const apexVersion = (function(){
    const fullVersion = document.querySelector('head link[rel="stylesheet"]').href.match(/\?v=(.*)/)[1];
    const versionParts = fullVersion.split('.');
    return parseInt(versionParts[0] + versionParts[1]);
})();

const appId = parseInt(document.getElementById('pFlowStepId').value);
const pageId = parseInt(document.getElementById('pFlowStepId').value);

const PREFERENCES = {
    theme: 'theme',
    showSuggestions: 'showSuggestions',
    renderWhitespace: 'renderWhitespace'
};

const STORAGE_ITEM_NAME = 'fos_ext_preferences';

// assumes FOS.extensionBase is already on the page
const injectStyle = function(href){
    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');  
  
    link.rel = 'stylesheet';  
    link.type = 'text/css';   
    link.href = FOS.extensionBase + href;  

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


let runtimeWindow;
// override the launchAppUnderTest function basially on extension load
// overrides in order to catch a reference of the runtime window object

(function(){
    try{
        const originalLaunchAppFunc = apex.builder.launchAppUnderTest;
        apex.builder.launchAppUnderTest = function () {
            const windowObject = originalLaunchAppFunc(...arguments);
            runtimeWindow = windowObject;
            return windowObject;
        }
    } catch(e) {
        console.warn('Tried to override the launchAppUnderTest function and failed');
    }
})();

// clicks the run page button
// should only be called on pages where that button is actually present
function runPage(){
    $('#button-run-page').trigger('click');
}

function showHelp(id){
    apex.theme.popupFieldHelp({
        title: 'Help Text: ' + helpText[id].title,
        helpText: helpText[id].text
    });
}

export {apexVersion, appId, pageId, PREFERENCES, showPageSuccess, showPageError, showItemError, injectScript, injectStyle,  getPreference, setPreference, isDarkMode, runtimeWindow, runPage, showHelp};