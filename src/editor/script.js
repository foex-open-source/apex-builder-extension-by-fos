import * as staticFileEditor from './lib/staticFileEditor.js';
import * as data from './data.js';
import * as colorMode from './lib/colorMode.js';
import { ExpandableRegion } from './lib/ExpandableRegion';
import { createButton } from './lib/ApexFileEditor';
import { getSelectedComponent, getCurrentPropertyData, getCurrentPageItems, setITSValue, getITSElId, save, overrideSuccessNotification } from './lib/pageDesignerEditor';

const pageId = FOS.util.pageId;
let plsqlRegion, editor, isCodeMirror = FOS.util.apexVersion < 201;

const styles = [
    'editor/css/style.css',
    'editor/third-party/font-apex-2.1/css/font-apex.min.css',
    'editor/css/golden-layout/goldenlayout-base.css'
];

const glStyles = {
    light: 'editor/css/golden-layout/goldenlayout-light-theme.css',
    dark: 'editor/css/golden-layout/goldenlayout-dark-theme.css'
}

const editorButtonSelectors = {
    monaco: '.a-Toolbar-groupContainer.a-Toolbar-groupContainer--end .a-Toolbar-group',
    codeMirror: '.a-CodeEditor-toolbar'
};

const editorSelectors = {
    1003: {
        regionSelector: 'main.a-Main.resize',
        buttonContainerSelector: '#SqlAndResults > div.resize:first-child .a-ButtonRegion-col.a-ButtonRegion-col--right .a-ButtonRegion-buttons',
        monacoSelector: '#P1003_SQL_COMMAND1_widget'
    },
    4309: {
        regionSelector: '#PROC',
        buttonContainerSelector: '#PROC .a-Region-header',
        monacoSelector: '#F4000_P4309_PROCESS_SQL_widget'
    },
    4050: {
        regionSelector: '#P4050_LIST_QUERY_CONTAINER',
        buttonContainerSelector: '#P4050_LIST_QUERY_CONTAINER .a-Toolbar-groupContainer.a-Toolbar-groupContainer--end .a-Toolbar-group',
        monacoSelector: '#P4050_LIST_QUERY_widget'
    },
    4111: {
        regionSelector: '#SRC',
        buttonContainerSelector: '#SRC .a-Region-header',
        monacoSelector: '#P4111_LOV_QUERY_SQL_widget'
    },
    4495: {
        regionSelector: '#SOURCE',
        buttonContainerSelector: '#SOURCE .a-Region-header',
        monacoSelector: '#P4495_PLSQL_CODE_widget'
    },
    4861: {
        header: {
            regionSelector: '#F4000_P4861_HTML_HEADER_CONTAINER',
            monacoSelector: '#F4000_P4861_HTML_HEADER_widget'
        },
        body: {
            regionSelector: '#F4000_P4861_HTML_BODY_CONTAINER',
            monacoSelector: '#F4000_P4861_HTML_BODY_widget'
        },
        footer: {
            regionSelector: '#F4000_P4861_HTML_FOOTER_CONTAINER',
            monacoSelector: '#F4000_P4861_HTML_FOOTER_widget'
        },
        content: {
            regionSelector: '#F4000_P4861_TEXT_TEMPLATE_CONTAINER',
            monacoSelector: '#F4000_P4861_TEXT_TEMPLATE_widget'
        },
    }
}

colorMode.init();

for (let i = 0; i < styles.length; i++) {
    let elem = FOS.util.injectStyle(styles[i]);
}

let glStyleElem = FOS.util.injectStyle(glStyles[colorMode.getColorModeBinary()]);

document.addEventListener('fosThemeChange', function () {
    let glStyleElemNew = FOS.util.injectStyle(glStyles[colorMode.getColorModeBinary()]);
    glStyleElem.parentNode.removeChild(glStyleElem);
    glStyleElem = glStyleElemNew;
});

if ([40, 312].includes(pageId)) {
    (async function () {
        staticFileEditor.setupEnvironment({
            autoOpenFiles: [],
            readOnly: false,
            listenToApplyChanges: false,
            insertRegionAfterSelector: '#APEX_ERROR_MESSAGE'
        });
    })();
} else if ([1003, 4050, 4111, 4309, 4495].includes(pageId)) {
    (async function () {
        if (pageId == 4050 && FOS.util.apexVersion < 212) {
            return;
        }
        editor = isCodeMirror ? document.querySelector(editorSelectors[pageId].regionSelector + ' ' + '.CodeMirror').CodeMirror : $(editorSelectors[pageId].monacoSelector).codeEditor('getEditor');
        new ExpandableRegion({
            regionSelector: editorSelectors[pageId].regionSelector,
            buttonContainerSelector: editorSelectors[pageId].buttonContainerSelector,
            floatRight: pageId == 1003,
            isFirstBtn: pageId == 4050,
            onExpand: () => {
                if (editor) {
                    isCodeMirror ? editor.refresh() : editor.layout();
                }
            },
            onRestore: () => {
                if (editor) {
                    isCodeMirror ? editor.refresh() : editor.layout();
                }
            }
        });
    })()
} else if (pageId === 4861) {
    (async function () {
        for (let section in editorSelectors[pageId]) {
            let emailEditor = isCodeMirror ? document.querySelector(editorSelectors[pageId][section].regionSelector + ' ' + '.CodeMirror').CodeMirror : $(editorSelectors[pageId][section].monacoSelector).codeEditor('getEditor');
            new ExpandableRegion({
                regionSelector: editorSelectors[pageId][section].regionSelector,
                buttonContainerSelector: editorSelectors[pageId][section].regionSelector + ' ' + (isCodeMirror ? editorButtonSelectors.codeMirror : editorButtonSelectors.monaco),
                onExpand: () => {
                    if (emailEditor) {
                        isCodeMirror ? emailEditor.refresh() : emailEditor.layout();
                    }
                },
                onRestore: () => {
                    if (emailEditor) {
                        isCodeMirror ? emailEditor.refresh() : emailEditor.layout();
                    }
                }
            });
        }
    })()
} else if (pageId === 4500 && FOS.util.apexVersion < 220) {
    // check if the editor is loaded 
    let dialogEditor, counter = 0;
    let intervalId = setInterval(function () {
        counter++;
        if (counter == 10) {
            // for some reason monaco is not on the page, so we stop here
            clearInterval(intervalId);
        } else if (window.monaco) {
            clearInterval(intervalId);

            // auto-hide the success notification
            if(pageDesigner?.showSuccess){
                overrideSuccessNotification();
            }

            // when the editor is created
            monaco.editor.onDidCreateEditor((editor) => {
                let itemRegex = new RegExp('P(' + pe.getCurrentPageId() + '|0)_[A-Z0-9_]*', 'gi');
                // make the editor region expandable
                dialogEditor = new ExpandableRegion({
                    regionSelector: '#editorDlg-codeEditor',
                    buttonContainerSelector: '#editorDlg-codeEditor .a-Toolbar-groupContainer.a-Toolbar-groupContainer--end .a-Toolbar-group',
                    isFirstBtn: true,
                    onExpand: () => {
                        if (editor) {
                            editor.layout();
                        }
                        pageDesigner.hideNotification();
                    },
                    onRestore: () => {
                        if (editor) {
                            editor.layout();
                        }
                    }
                });

                // if the property can't be found, we stop here
                let propertyFound = getCurrentPropertyData()?.attributeEl.length > 0;
                if(!propertyFound){
                    return;
                }
                // create the save button
                let saveBtn = createButton({
                    buttonClasses: ['fos-save-button'],
                    title: 'Save',
                    label: 'Save',
                    icon: 'fa-save'
                });
                // add it to the toolbar
                $(dialogEditor.buttonContainerSelector).prepend(saveBtn);

                // get the selected component from the tree (rendering,da,processing)
                let component = getSelectedComponent();

                // there's no dedicated content-loaded event
                // https://github.com/microsoft/monaco-editor/issues/115
                let itsEl, initValue, model, checkITS;
                let didScrollChangeDisposable = editor.onDidScrollChange(function (event) {
                    didScrollChangeDisposable.dispose();
                    // set the initValue
                    initValue = editor.getValue();
                    model = editor.getModel();

                    // save on click
                    saveBtn.addEventListener('click', function(e){
                        save(editor,initValue,saveBtn);
                        initValue = editor.getValue();
                    });

                    // add keyboard shortcut to save
                    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function(e){
                        save(editor,initValue,saveBtn);
                        initValue = editor.getValue();
                    });

                    // check if it has an "Items To Submit" attribute
                    itsEl = getITSElId(component);

                    // get all the page item components from the current page in an array
                    let pageItems = getCurrentPageItems();

                    checkITS = apex.util.debounce(function (component) {
                        let itsEl = getITSElId(component);
                        if (!itsEl) {
                            return;
                        }
                        let itsVal = itsEl.getValue() || '';
                        if (itsVal) {
                            itsVal = itsVal.toLowerCase();
                        }

                        let contentItems = [];
                        if (editor && model) {
                            var lineCount = model.getLineCount();
                            for (var lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
                                var lineContent = model.getLineContent(lineNumber);
                                var matches = lineContent.matchAll(itemRegex);
                                for (var match of matches) {
                                    var foundItem = match[0].toLowerCase()
                                    if (pageItems.includes(foundItem) && !contentItems.includes(foundItem)) {
                                        contentItems.push(foundItem);
                                    }
                                }
                            }

                            setITSValue(component, itsEl, itsVal, contentItems);
                        }
                    }, 250);

                    if (itsEl) {
                        checkITS(component);
                    }
                });

                // on content change
                // set the "isEditorChaged" flag
                // and update the "Items to Submit" attribute
                editor.onDidChangeModelContent((e) => {
                    const iconSpan = saveBtn.firstChild;
                    if (initValue != editor.getValue()) {
                        FOS.isEditorChanged = true;
                        iconSpan.classList.add('fam-blank');
                    } else {
                        FOS.isEditorChanged = false;
                        iconSpan.classList.remove('fam-blank');
                    }
                    if (itsEl) {
                        checkITS(component);
                    }
                });

            });
        } else if (window.CodeMirror) {
            clearInterval(intervalId);

            // auto-hide the success notification
            if(pageDesigner?.showSuccess){
                overrideSuccessNotification();
            }
            
            $('body').on('dialogopen', function (e) {
                $('#editorDlg-codeEditor').one('resize', _ => {
                    editor = document.querySelector('.CodeMirror').CodeMirror;
                    dialogEditor = new ExpandableRegion({
                        regionSelector: '#editorDlg-codeEditor',
                        buttonContainerSelector: '#editorDlg-codeEditor .a-CodeEditor-toolbar',
                        isFirstBtn: false,
                        onExpand: () => {
                            if (editor) {
                                editor.refresh();
                            }
                        },
                        onRestore: () => {
                            if (editor) {
                                editor.refresh();
                            }
                        }
                    });
                    
                    // if the property can't be found, we stop here
                    let propertyFound = getCurrentPropertyData().attributeEl.length > 0;
                    if(!propertyFound){
                        return;
                    }
                    let initValue = editor.getValue();
                    // create the save button
                    let saveBtn = createButton({
                        buttonClasses: ['fos-save-button'],
                        title: 'Save',
                        label: 'Save',
                        icon: 'fa-save'
                    });
                    // add it to the toolbar
                    $(dialogEditor.buttonContainerSelector).append(saveBtn);

                    // save on click
                    saveBtn.addEventListener('click', function(e){
                        save($('#editorDlg-codeEditor').data().apexCodeEditor,initValue,saveBtn);
                        initValue = editor.getValue();
                    });

                    editor.addKeyMap({
                        'Cmd-S':function(){
                            save($('#editorDlg-codeEditor').data().apexCodeEditor,initValue,saveBtn);
                            initValue = editor.getValue();
                        }
                    })

                    // get the selected component from the tree (rendering,da,processing)
                    let component = getSelectedComponent();

                    // check if it has an "Items To Submit" attribute
                    let itsEl = getITSElId(component);

                    // get all the page item components from the current page in an array
                    let pageItems = getCurrentPageItems();

                    let checkITS = apex.util.debounce(function (component) {
                        let itsEl = getITSElId(component);
                        if (!itsEl) {
                            return;
                        }
                        let itsVal = itsEl.getValue() || '';
                        if (itsVal) {
                            itsVal = itsVal.toLowerCase();
                        }

                        let contentItems = [];
                        if (editor) {
                            let editorValue = editor.getValue();
                            pageItems.forEach((pageItem)=>{
                                let itemRegex = new RegExp("\\b("+pageItem+")\\b","i");
                                if(editorValue.match(itemRegex)){
                                    if(!itsVal.includes(pageItem.toUpperCase())){
                                        contentItems.push(pageItem);
                                    }
                                }
                            })
                        }
                        setITSValue(component, itsEl, itsVal, contentItems);
                    }, 250);


                    // on content change
                    // set the "isEditorChaged" flag
                    // and update the "Items to Submit" attribute
                    editor.on('change', (cm,e) => {
                        const iconSpan = saveBtn.firstChild;
                        if (initValue != editor.getValue()) {
                            FOS.isEditorChanged = true;
                            iconSpan.classList.add('fam-blank');
                        } else {
                            FOS.isEditorChanged = false;
                            iconSpan.classList.remove('fam-blank');
                        }
                        if (itsEl) {
                            checkITS(component);
                        }
                    });

                })
            });
        }
    }, 200);
} else if (pageId == 267) {
    (async function () {
        staticFileEditor.setupEnvironment({
            autoOpenFiles: [],
            readOnly: false,
            listenToApplyChanges: false,
            insertRegionAfterSelector: '#FILES'
        });
    })();
} else if (pageId == 4410) {
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

    $('#fos-boilerplate .fos-boilerplate-link').on('click', function (e) {
        e.preventDefault();

        let style = colorMode.getColorMode();
        let pluginType = apex.item('P4410_PLUGIN_TYPE').getValue();
        let dialog$ = $('<div></div>');
        let iframe$ = $('<iframe />').attr('src', 'https://test192xe18.foex.at/ords/f?p=2100:10:::::G_STYLE,P10_PLUGIN_TYPE:' + style + ',' + pluginType);
        iframe$.css({ 'height': '100%', 'width': '100%' });
        dialog$.append(iframe$);
        dialog$.dialog({
            title: 'Plug-in Boilerplate Code',
            width: 1000,
            maxWidth: $(window).width() * 0.9,
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

    function settingIsToggled(setting) {
        return commentLines.filter(line => {
            return line.indexOf(setting) == 0
        }).length > 0;
    }

    function getSettingListValue(setting) {
        let line = commentLines.filter(line => {
            return line.indexOf(setting) == 0;
        });

        if (line.length > 0) {
            line = line[0];
        } else {
            return null;
        }

        const list = line.substring(line.indexOf(':') + 1);

        return list.split(',');
    }

    if (settingIsToggled('@fos-auto-return-to-page')) {
        apex.item('P4410_RETURN_TO_PAGE').setValue('YES');
    }

    if (settingIsToggled('@fos-hide-do-not-validate-plsql')) {
        $('#P4410_CHECK_PLSQL_CODE_CONTAINER').hide();
    }

    // -------------------------------------------------------

    let readOnly = document.getElementById('P4410_REFERENCE_ID').value != '';

    if (pluginInEditMode) {
        (async function () {
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