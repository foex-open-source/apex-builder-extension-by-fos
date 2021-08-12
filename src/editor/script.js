import * as staticFileEditor from './lib/staticFileEditor.js';
import * as data from './data.js';
import * as colorMode from './lib/colorMode.js';

const pageId = FOS.util.pageId;

const styles = [
    'editor/css/style.css',
    'editor/third-party/font-apex-2.1/css/font-apex.min.css',
    'editor/css/golden-layout/goldenlayout-base.css'
];

const glStyles = {
    light: 'editor/css/golden-layout/goldenlayout-light-theme.css',
    dark: 'editor/css/golden-layout/goldenlayout-dark-theme.css'
}

colorMode.init();

for(let i = 0; i < styles.length; i++){
    let elem = FOS.util.injectStyle(styles[i]);
}

let glStyleElem = FOS.util.injectStyle(glStyles[colorMode.getColorModeBinary()]);

document.addEventListener('fosThemeChange', function(){
    let glStyleElemNew = FOS.util.injectStyle(glStyles[colorMode.getColorModeBinary()]);
    glStyleElem.parentNode.removeChild(glStyleElem);
    glStyleElem = glStyleElemNew;
});

if([40, 312].includes(pageId)){
    (async function(){
        staticFileEditor.setupEnvironment({
            autoOpenFiles: [],
            readOnly: false,
            listenToApplyChanges: false,
            insertRegionAfterSelector: '#APEX_ERROR_MESSAGE'
        });
    })();
} else if (pageId == 267){
    (async function(){
        staticFileEditor.setupEnvironment({
            autoOpenFiles: [],
            readOnly: false,
            listenToApplyChanges: false,
            insertRegionAfterSelector: '#FILES'
        });
    })();
} else if (pageId == 4410){
    var pluginInEditMode = apex.item('P4410_ID').getValue() ? true : false;

    // --------------------------------------------------
    // Adding API Reference Links

    $('.a-Side').append($(data.markup.documentationRegion));

    $('#fos-documentation .fos-plsql-api-link').attr('href', data.apiLinks[FOS.util.apexVersion].plsql);
    $('#fos-documentation .fos-js-api-link').attr('href', data.apiLinks[FOS.util.apexVersion].js);

    // --------------------------------------------------
    // Adding Boilerplate Code Links

    const boilerplateRegion = data.markup.boilerplateRegion;
    $('.a-Side').append($(boilerplateRegion));

    $('#fos-boilerplate .fos-boilerplate-link').on('click', function(e){
        e.preventDefault();

        let style = colorMode.getColorMode();
        let pluginType = apex.item('P4410_PLUGIN_TYPE').getValue();
        let dialog$ = $('<div></div>');
        let iframe$ = $('<iframe />').attr('src', 'https://test192xe18.foex.at/ords/f?p=2100:10:::::G_STYLE,P10_PLUGIN_TYPE:' + style + ',' + pluginType);
        iframe$.css({'height':'100%','width':'100%'});
        dialog$.append(iframe$);
        dialog$.dialog({
            title: 'Plug-in Boilerplate Code',
            width: 1000,
            maxWidth: $(window).width()*0.9,
            height: 500,
            modal: true,
            resizable: true,
            dialogClass: 'ui-dialog--apex a-Dialog--uiDialog'
        });
    });

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