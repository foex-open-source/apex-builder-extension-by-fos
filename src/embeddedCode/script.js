import './third-party/prismjs/prism.js';
import * as util from '../global/util.js';

util.injectStyle(`third-party/prismjs/themes/${util.isDarkMode() ? 'dark' : 'light'}.css`);

function letsGo(){
    $('.a-EmbeddedCode').each(function(){
        var attrs$ = $('.a-EmbeddedCode-attr', $(this));
        var attr2 = attrs$.eq(1).text();
        var attr4 = attrs$.eq(3).text();
        var lang = attr4.includes('PL/SQL') ? 'plsql' :
            (attr4.includes('SQL') ? 'sql' :
            (attr2.includes('NATIVE_JAVASCRIPT_CODE') || attr4.includes('JavaScript') ? 'javascript' : ''));
        const preElem$ = $('pre', $(this));
        preElem$.addClass('language-' + lang);
        Prism.highlightElement(preElem$[0]);
    });
}

$('#R2600902150396862').on('apexafterrefresh', function(){
    letsGo();
});

letsGo();