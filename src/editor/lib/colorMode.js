let colorMode;

function isDarkMode(){
    return $('head link[rel="stylesheet"][type="text/css"]').filter(function(){
        return $(this).attr('href').indexOf('apex_ui/css/Theme-Dark') > -1;
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
    if([191, 192].indexOf(FOS.util.apexVersion) > -1){
        setColorMode(isDarkMode() ? 'dark' : 'light');
    } else if ([201, 202].indexOf(FOS.util.apexVersion) > -1) {
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
