const fullVersion = $('.a-Footer-version').text();
const versionParts = fullVersion.replace('Application Express ', '').split('.');
export const apexVersion = versionParts[0] + '.' + versionParts[1];

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

export {showPageSuccess, showPageError, showItemError};

export async function injectScript(src){
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');

    script.setAttribute('src', src);

    return new Promise(function(resolve){
        script.addEventListener('load', resolve);
        head.appendChild(script);
    });
}

export function injectStyle(href){
    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');  
  
    link.rel = 'stylesheet';  
    link.type = 'text/css';   
    link.href = href;  

    head.appendChild(link);  
}