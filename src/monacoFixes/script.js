// This code runs on pages 1003, 4500, 4410 and is meant to fix some Monaco issues on APEX 20.2 (for now)
// hacky, but it works: ping the page every so often and check if monaco was loaded. if so, set up the editor and stop listening
// Feature #1: An extra setting to disable suggestions.
// Feature #2: An extra setting to toggle on the renderWhitespace option.

// applies all new features to a specific editor
function fixUpEditor(editor$){

    // trying to gather everything we need just from the dom element
    const editor = editor$.codeEditor('getEditor');
    const toolbar$ = $('.a-MonacoEditor-toolbar', editor$);
    const context = toolbar$.toolbar('option', 'actionsContext');

    // adding the new context action for suggestions
    context.add({
        name: 'show-suggestions',
        label: 'Show Suggestions',
        get: function() {
            return editor.getRawOptions().quickSuggestions;
        },
        set: function(value) {
            editor.updateOptions({quickSuggestions: value});
            FOS.util.setPreference(FOS.util.PREFERENCES.showSuggestions, value ? 'true' : 'false');
        }
    });

    // adding the new context action for white space
    context.add({
        name: 'render-whitespace',
        label: 'Render Whitespace',
        get: function() {
            return editor.getRawOptions().renderWhitespace == 'all';
        },
        set: function(value) {
            editor.updateOptions({renderWhitespace: value ? 'all' : 'none'});
            FOS.util.setPreference(FOS.util.PREFERENCES.renderWhitespace, value ? 'true' : 'false');
        }
    });

    // sync local storage with editor

    const showSuggestionsVal = FOS.util.getPreference(FOS.util.PREFERENCES.showSuggestions);
    // it is by default true anyway
    if(showSuggestionsVal && showSuggestionsVal == 'false'){
        editor.updateOptions({quickSuggestions: false});
    }

    const renderWhitespaceVal = FOS.util.getPreference(FOS.util.PREFERENCES.renderWhitespace);
    // it is by default false anyway
    if(renderWhitespaceVal && renderWhitespaceVal == 'true'){
        editor.updateOptions({renderWhitespace: 'all'});
    }

    // now add the control to the menu
    toolbar$.toolbar('findGroup', 'menuControls').controls[0].menu.items.push(...[{
        type: 'toggle',
        action: 'show-suggestions'
    }, {
        type: 'toggle',
        action: 'render-whitespace'
    }]);
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
                // it could be that some non-APEX Monaco editor was loaded, e.g a FOS editor
                // we only fix up the APEX ones
                if(editor$.length){
                    fixUpEditor(editor$);
                }
            }, 500);
        });

        // fix up editors which are already on the page, for example on the SQL Commands page
        $('.a-MonacoEditor').each(function(){
            fixUpEditor($(this));
        });
    }
}, 500);