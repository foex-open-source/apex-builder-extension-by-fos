import * as staticFileEditor from './lib/staticFileEditor.js';
import * as data from './data.js';
import * as global from './lib/util.js';

const pageId = parseInt(document.getElementById('pFlowStepId').value);
const fosExtensionBase = window.fosExtensionBase;

function injectStyle(href){
    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');  
  
    link.rel = 'stylesheet';  
    link.type = 'text/css';   
    link.href = fosExtensionBase + href;  

    head.appendChild(link);
}

const styles = [
    'css/style.css',
    'third-party/font-apex-2.1/css/font-apex.min.css',
    'css/golden-layout/goldenlayout-base.css',
    'css/golden-layout/goldenlayout-dark-theme.css'
];

let apexVersion = global.apexVersion;

function isDarkMode(){
    return $('head link[rel="stylesheet"][type="text/css"]').filter(function(){
        return $(this).attr('href').indexOf('/i/apex_ui/css/Theme-Dark') == 0;
    }).length == 1;
}

function setColorMode(mode){
    document.querySelector('body').dataset.fosTheme = mode;
}

if(['19.1', '19.2'].indexOf(apexVersion) > -1){
    setColorMode(isDarkMode() ? 'dark' : 'light');
} else if (['20.1', '20.2'].indexOf(apexVersion) > -1) {
    function evaluateColorMode(){
        setColorMode(isDarkMode() ? 'dark-redwood' : 'light-redwood');
    }
    let mutationObserver = new MutationObserver(evaluateColorMode);
    mutationObserver.observe(document.getElementsByTagName('body')[0], {
        attributes: true,
        attributeFilter: ['class']
    });
    evaluateColorMode();
} else {
    setColorMode('light');
}

for(let i = 0; i<styles.length; i++){
    injectStyle(styles[i]);
}

if([40, 312].indexOf(pageId) > -1){
    (async function(){
        staticFileEditor.setupEnvironment({
            autoOpenFiles: [],
            readOnly: false,
            listenToApplyChanges: false,
            insertRegionAfterSelector: '#APEX_ERROR_MESSAGE'
        });
    })();
} else if (pageId == 4410){
    var pluginInEditMode = apex.item('P4410_ID').getValue() ? true : false;

    // --------------------------------------------------
    // Adding API Reference Links
    
    $('.a-Side').append($(data.markup.documentationRegion));
    
    $('#fos-documentation .fos-plsql-api-link').attr('href', data.apiLinks[global.apexVersion].plsql);
    $('#fos-documentation .fos-js-api-link').attr('href', data.apiLinks[global.apexVersion].js);
    
    // --------------------------------------------------
    // Adding Boilerplate Code Links
    /*
    const boilerplateRegion = data.markup.boilerplateRegion;
    $('.a-Side').append($(boilerplateRegion));
    
    function getModalStyle(){
    
        var style;
    
        function builderIsDarkMode(){
            return $('head link[rel=stylesheet]').filter(function(){
                return $(this).attr('href').indexOf('Theme-Dark') > -1;
            }).length > 0;
        }
    
        switch(global.apexVersion) {
                case '19.2':
                    if(builderIsDarkMode()){
                        style = 'dark';
                    }
                    break;
                case '20.1':
                    style = builderIsDarkMode() ? 'redwood-dark' : 'redwood-light'
                    break;
                default:
                    break;
        }
        return style;
    }
    
    $('#fos-boilerplate .fos-plsql-boilerplate-link').on('click', function(e){
        e.preventDefault();
    
        var style = getModalStyle();
    
        apex.navigation.dialog(
            'https://test192xe18.foex.at/ords/f?p=2100:10:::::G_STYLE:' + style,
            {
                title: 'PL/SQL Boilerplate Code',
                height: '500',
                width: '1000',
                modal: true,
                resizable: true
            },
            'a-Dialog--uiDialog'
        );
    });
    
    $('#fos-boilerplate .fos-js-boilerplate-link').on('click', function(e){
        e.preventDefault();
        console.log('js');
    });
    */
    // -------------------------------------------------------
    // Applying the settings
    
    const comments = apex.item('P4410_PLUGIN_COMMENT').getValue();
    const commentLines = comments.split('\n').map(line => line.trim());
    
    function settingIsToggled(setting){
        return commentLines.filter(line => {
            return line.indexOf(setting) == 0
        }).length > 0;
    }
    
    function getSettingListValue(setting){
        let line = commentLines.filter(line => {
            return line.indexOf(setting) == 0;
        });
    
        if(line.length > 0){
            line = line[0];
        } else {
            return null;
        }
    
        const list = line.substring(line.indexOf(':')+1);
    
        return list.split(',');
    }
    
    if(settingIsToggled('@fos-auto-return-to-page')){
        apex.item('P4410_RETURN_TO_PAGE').setValue('YES');
    }
    
    if(settingIsToggled('@fos-hide-do-not-validate-plsql')){
        $('#P4410_CHECK_PLSQL_CODE_CONTAINER').hide();
    }
    
    // -------------------------------------------------------
    
    let readOnly = document.getElementById('P4410_REFERENCE_ID').value != '';
    
    if(pluginInEditMode){
        (async function(){
            const autoOpenFiles = getSettingListValue('@fos-auto-open-files');
            staticFileEditor.setupEnvironment({
                autoOpenFiles: autoOpenFiles,
                readOnly: readOnly,
                listenToApplyChanges: true,
                insertRegionAfterSelector: '#SOURCE'
            });
        })();
    }
}