import * as util from './util.js';

let colorMode;

function isDarkMode(){
    return $('head link[rel="stylesheet"][type="text/css"]').filter(function(){
        return $(this).attr('href').indexOf('/i/apex_ui/css/Theme-Dark') == 0;
    }).length == 1;
}

function setColorMode(mode){
    colorMode = mode;
    document.querySelector('body').dataset.fosTheme = mode;
}

//this returns
function getColorMode(){
    return colorMode;
}

//returns either dark or light
function getColorModeBinary(){
    return colorMode.indexOf('dark') > -1 ? 'dark' : 'light';
}

function init(){
    if(['19.1', '19.2'].indexOf(util.apexVersion) > -1){
        setColorMode(isDarkMode() ? 'dark' : 'light');
    } else if (['20.1', '20.2'].indexOf(util.apexVersion) > -1) {
        function evaluateColorMode(){
            setColorMode(isDarkMode() ? 'dark-redwood' : 'light-redwood');
        }
        let mutationObserver = new MutationObserver(function(){
            evaluateColorMode();
            document.dispatchEvent(new Event('fosThemeChange'));
        });
        mutationObserver.observe(document.getElementsByTagName('body')[0], {
            attributes: true,
            attributeFilter: ['class']
        });
        evaluateColorMode();
    } else {
        setColorMode('light');
    }
}

export {init, getColorMode, getColorModeBinary};
