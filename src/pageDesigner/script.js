import * as colorMode from './../editor/lib/colorMode.js';
import { ExpandableRegion } from './../editor/lib/ExpandableRegion';
import { createButton } from './../editor/lib/ApexFileEditor';
import {
    getSelectedComponents,
    getCurrentPropertyData,
    getCurrentPageItems,
    setITSValue,
    getITSElId,
    save,
    setEditorState,
    overrideSuccessNotification,
    toggleBuildOption,
    setPropertyTransaction
} from './lib/pageDesignerEditor';

let editor, newMonacoVersion = FOS.util.apexVersion > 212;
let isITSEnabled = false;

colorMode.init();

const styles = [
    'editor/css/style.css',
    'editor/third-party/font-apex-2.1/css/font-apex.min.css'
];

for (let i = 0; i < styles.length; i++) {
    let elem = FOS.util.injectStyle(styles[i]);
}

(function () {
    if (FOS.util.apexVersion > 221) {
        return;
    }
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
            if (pageDesigner?.showSuccess) {
                overrideSuccessNotification();
            }

            const regionSelector = '#editorDlg-codeEditor';
            const itemRegex = new RegExp('(?<=:)\\w+', 'gi');

            // when the editor is created
            monaco.editor.onDidCreateEditor((editor) => {

                // make the editor region expandable
                dialogEditor = new ExpandableRegion({
                    regionSelector,
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
                if (!propertyFound) {
                    return;
                }

                // add the save button to the toolbar
                let saveBtn = createButton({
                    buttonClasses: ['fos-save-button'],
                    title: 'Save',
                    label: 'Save',
                    icon: 'fa-save'
                });
                $(dialogEditor.buttonContainerSelector).prepend(saveBtn);

                // get the selected component from the tree (rendering,da,processing)
                let component = getSelectedComponents()[0];

                // there's no dedicated content-loaded event
                // https://github.com/microsoft/monaco-editor/issues/115
                let initValue, model, itsDisposable;
                let didScrollChangeDisposable = editor.onDidScrollChange(function (event) {
                    
                    didScrollChangeDisposable.dispose();
                
                    initValue = editor.getValue();

                    model = editor.getModel();

                    saveBtn.addEventListener('click', function (e) {
                        save(editor, initValue, saveBtn);
                        initValue = editor.getValue();
                    });

                    let saveKey = newMonacoVersion ? monaco.KeyCode.KeyS : monaco.KeyCode.KEY_S;

                    // //add keyboard shortcut to save
                    editor.addCommand(monaco.KeyMod.CtrlCmd | saveKey, function (e) {
                        save(editor, initValue, saveBtn);
                        initValue = editor.getValue();
                    });

                    // check if it has an "Items To Submit" attribute
                    let itsEl = getITSElId(component);

                    if (!itsEl) {
                        return;
                    }

                    const ITS_MENU_OPTION = 'items-to-submit-autofill';
                    const editor$ = $(editor._domElement).closest('.a-MonacoEditor');
                    const editorContext = apex.actions.findContext(editor$[0]);
                    const toolbar$ = $('.a-MonacoEditor-toolbar', editor$);
                    let pageItems = getCurrentPageItems();

                    // debounced function to autofill the items to submit attribute
                    let checkITS = apex.util.debounce(function (component, itsEl) {
                        if (!itsEl) {
                            return;
                        }
                        let itsVal = itsEl.getValue() || '';
                        if (itsVal) {
                            itsVal = itsVal.toLowerCase();
                        }

                        let contentItems = [];
                        if (editor && !model.isDisposed()) {
                            var lineCount = model.getLineCount();
                            for (var lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
                                var lineContent = model.getLineContent(lineNumber);
                                var matches = lineContent.matchAll(itemRegex);
                                for (var match of matches) {
                                    var foundItem = match[0].toLowerCase();
                                    if (pageItems.includes(foundItem) && !contentItems.includes(foundItem)) {
                                        contentItems.push(foundItem);
                                    }
                                }
                            }
                            setITSValue(component, itsEl, itsVal, contentItems);
                        }
                    }, 250);

                    function toggleITS(){
                        if (isITSEnabled) {
                            if (itsDisposable) {
                                itsDisposable.dispose();
                            }
                            checkITS(component, itsEl);
                            itsDisposable = editor.onDidChangeModelContent((e) => {
                                checkITS(component, itsEl);
                            });
                        } else {
                            if (itsDisposable) {
                                itsDisposable.dispose();
                            }
                        }
                    }
                    
                    // add entry and action to the "Settings" menu
                    if (!editorContext.lookup(ITS_MENU_OPTION)) {
                        editorContext.add({
                            name: ITS_MENU_OPTION,
                            label: 'Items To Submit Autofill',
                            get: function () {
                                return FOS.util.getPreference(FOS.util.PREFERENCES.autoFillITS) == 'true';
                            },
                            set: function (value) {
                                isITSEnabled = value;
                                FOS.util.setPreference(FOS.util.PREFERENCES.autoFillITS, value ? 'true' : 'false');
                                toggleITS();   
                            }
                        });

                        toolbar$.toolbar('findGroup', 'menuControls')?.controls[0].menu.items.push({
                            type: 'toggle',
                            hide: false,
                            action: ITS_MENU_OPTION
                        });
                    }
                    
                    // enable it by default
                    if (!FOS.util.getPreference(FOS.util.PREFERENCES.autoFillITS)){
                        FOS.util.setPreference(FOS.util.PREFERENCES.autoFillITS, 'true' );
                    }

                    isITSEnabled = FOS.util.getPreference(FOS.util.PREFERENCES.autoFillITS) == 'true';
                    toggleITS();   
                });

                let saveDisposable = editor.onDidChangeModelContent((e) => {
                    setEditorState(initValue, editor, saveBtn);
                });

            });
        } else if (window.CodeMirror) {
            clearInterval(intervalId);

            // auto-hide the success notification
            if (pageDesigner?.showSuccess) {
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
                    if (!propertyFound) {
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
                    saveBtn.addEventListener('click', function (e) {
                        save($('#editorDlg-codeEditor').data().apexCodeEditor, initValue, saveBtn);
                        initValue = editor.getValue();
                    });

                    editor.addKeyMap({
                        'Cmd-S': function () {
                            save($('#editorDlg-codeEditor').data().apexCodeEditor, initValue, saveBtn);
                            initValue = editor.getValue();
                        }
                    });

                    // get the selected component from the tree (rendering,da,processing)
                    let component = getSelectedComponents()[0];

                    // check if it has an "Items To Submit" attribute
                    let itsEl = getITSElId(component);

                    // get all the page item components from the current page in an array
                    let pageItems = getCurrentPageItems();

                    let checkITS = apex.util.debounce(function (itsEl, component) {

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
                            pageItems.forEach((pageItem) => {
                                let itemRegex = new RegExp('\\b(' + pageItem + ')\\b', 'i');
                                if (editorValue.match(itemRegex)) {
                                    if (!itsVal.includes(pageItem.toUpperCase())) {
                                        contentItems.push(pageItem);
                                    }
                                }
                            });
                        }
                        setITSValue(component, itsEl, itsVal, contentItems);
                    }, 250);

                    editor.on('change', function setState(e) {
                        setEditorState(initValue, editor, saveBtn);
                    });

                    if (itsEl) {
                        editor.on('change', function(e) {
                            checkITS(itsEl, component);
                        });
                    }

                });
            });
        }
    }, 200);

    
    if (FOS.util.apexVersion < 211) {
        return;
    }

    // add build options context menu entry
    $(document).on('modelReady', () => {
        const BUILD_OPTION_COMMENTED_OUT = 'COMMENTED OUT';
        let commentedOutOption = pe.getAll().sharedComponents.components[pe.COMP_TYPE.BUILD_OPTION].find(el => el.properties[pe.PROP.NAME]?.toUpperCase() === BUILD_OPTION_COMMENTED_OUT);
        if (!commentedOutOption) {
            return;
        }

        ['#PDrenderingTree', '#PDdynamicActionTree', '#PDprocessingTree'].forEach((treeSelector) => {
            let tree = $(treeSelector);
            
            if (!tree.length) {
                return;
            }
            let ctxMenu = tree.treeView('option', 'contextMenu');
            if (!ctxMenu) {
                return;
            }
            ctxMenu.items?.splice(2, 0, {
                type: 'separator',
                action: false
            }, {
                label: 'Comment Out',
                icon: 'fa fa-eye-slash',
                type: 'action',
                action: function () {
                    setPropertyTransaction(pe.PROP.BUILD_OPTION, commentedOutOption.id);
                },
                hide: function () {
                    return toggleBuildOption(commentedOutOption.id, true) && !pe.isPageReadOnly();
                }
            }, {
                label: 'Uncomment',
                icon: 'fa fa-eye',
                type: 'action',
                action: function () {
                    setPropertyTransaction(pe.PROP.BUILD_OPTION, '');
                },
                hide: function () {
                    return toggleBuildOption(commentedOutOption.id) && !pe.isPageReadOnly();
                }
            }, {
                type: 'separator',
                action: false
            });
        });
    });
})();
