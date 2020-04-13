import * as staticFileEditor from '../common/staticFileEditor.js';

(async function(){
    staticFileEditor.setupEnvironment({
        autoOpenFiles: [],
        readOnly: false,
        listenToApplyChanges: false,
        insertRegionAfterSelector: '#APEX_ERROR_MESSAGE'
    });
})();