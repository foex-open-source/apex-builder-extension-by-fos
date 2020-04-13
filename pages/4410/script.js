import * as data from './data.js';
import * as global from '../../lib/util.js';
import * as settings from './settings.js';
import * as staticFileEditor from '../common/staticFileEditor.js';

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

if(settings.settingIsToggled('@fos-auto-return-to-page')){
    apex.item('P4410_RETURN_TO_PAGE').setValue('YES');
}

if(settings.settingIsToggled('@fos-hide-do-not-validate-plsql')){
    $('#P4410_CHECK_PLSQL_CODE_CONTAINER').hide();
}

// -------------------------------------------------------

let readOnly = document.getElementById('P4410_REFERENCE_ID').value != '';

if(pluginInEditMode){
    (async function(){
        const autoOpenFiles = settings.getSettingListValue('@fos-auto-open-files');
        staticFileEditor.setupEnvironment({
            autoOpenFiles: autoOpenFiles,
            readOnly: readOnly,
            listenToApplyChanges: true,
            insertRegionAfterSelector: '#SOURCE'
        });
    })();
}