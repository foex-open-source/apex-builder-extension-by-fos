// This code runs on pages 1003, 4500, 4410 and is meant to fix some Monaco issues on APEX 20.2 (for now)
// hacky, but it works: ping the page every so often and check if monaco was loaded. if so, set up the editor and stop listening

// Feature #1: An extra settings menu entry that allows the user to disable suggestions. This preference will be stored in local storage

(function(){

    const SUGGESTION_SETTING_NAME = 'fosShowSuggestions';

    // initializes the whole Show Suggestions ordeal
    function fixUpEditor(editor$){

        // trying to gather everything we need just from the dom element
        const editor = editor$.codeEditor('getEditor');
        const toolbar$ = $('.a-MonacoEditor-toolbar', editor$);
        const context = toolbar$.toolbar('option', 'actionsContext');

        // adding the new action on which the menu entry is based
        context.add({
            name: 'show-suggestions',
            label: 'Show Suggestions',
            get: function() {
                return editor.getRawOptions().quickSuggestions;
            },
            set: function(value) {
                editor.updateOptions({quickSuggestions: value});
                localStorage.setItem(SUGGESTION_SETTING_NAME, value ? 'true' : 'false');
            }
        });

        // sync local storage with editor
        var settingVal = localStorage.getItem(SUGGESTION_SETTING_NAME);
        // it is by default true anyway
        if(settingVal && settingVal == 'false'){
            editor.updateOptions({quickSuggestions: false});
        }

        // now add the control to the menu
        toolbar$.toolbar('findGroup', 'menuControls').controls[0].menu.items.push({
            type: 'toggle',
            action: 'show-suggestions'
        });
    }

    let counter = 0;
    var intervalId = setInterval(function(){
        counter++;
        // give up after 10 seconds
        if(counter == 20){
            // for some reason monaco is not on the page, so we stop here
            clearInterval(intervalId);

        } else if(window.monaco){
            clearInterval(intervalId);
    
            // fix up editors as they appear, for example in Page Designer
            monaco.editor.onDidCreateEditor(function(editor){
                setTimeout(function(){
                    const editor$ = $(editor._domElement).closest('.a-MonacoEditor');
                    fixUpEditor(editor$);
                }, 500);
            });

            // fix up editors which are already on the page, for example on the SQL Commands page
            $('.a-MonacoEditor').each(function(){
                fixUpEditor($(this));
            });
        }
    }, 500);
})();