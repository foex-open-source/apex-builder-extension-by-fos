function injectStyle(href){
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

export {injectStyle, isDarkMode};