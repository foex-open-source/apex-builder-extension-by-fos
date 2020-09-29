import * as common from '../markup';
import * as server from './server';
import * as staticFiles from './staticFiles';
import * as globalUtil from './util';
import * as fileProcesses from './fileProcesses';
import { ApexFileEditor } from './ApexFileEditor';
import { resetTheme } from './monacoEditorHelper';
import { ExpandableRegion } from './ExpandableRegion';
import GoldenLayout from 'golden-layout';

let filesLayout;
let openedFiles = [];

const fileSelectorId = 'FOS_STATIC_FILE_SELECTOR';

let readOnly;

const pageId = globalUtil.getPageId();

// -------------------------------------------------------
// Utility functions
const util = {
    getOpenedFile: function (fullFileName) {
        return openedFiles.filter(openedFile => openedFile.fullFileName == fullFileName)[0];
    },
    setActiveFileEditor: function (fullFileName) {
        var item = filesLayout.root.getItemsById(fullFileName)[0];
        item.parent.setActiveContentItem(item);
    },
    fileIsOpened: function (fullFileName) {
        return openedFiles.filter(openedFile => {
            return openedFile.fullFileName == fullFileName;
        }).length == 1;
    },
    showFilesLayout: function () {
        $('#fos-files-layout').show();
        util.resizeFilesLayout();
    },
    hideFilesLayout: function () {
        $('#fos-files-layout').hide();
    },
    getUploadPageUrl: function () {
        let uploadFilesButton$;
        if ([267, 4410].includes(pageId)) {
            uploadFilesButton$ = $('#FILES .a-Region-headerItems.a-Region-headerItems--buttons button').last();
        } else {
            uploadFilesButton$ = $('.a-IRR-region .a-Button.a-Button--hot').last();
        }
        const onClickAttr = uploadFilesButton$.attr('onclick');
        const modalUrl = JSON.parse(onClickAttr.match(/'.*?'/)[0].replace(/'/g, '"'));

        return modalUrl;
    },
    filesHaveUnsavedChanges: function () {
        if (!openedFiles || !openedFiles.length) {
            return false;
        }
        return openedFiles.map(file => file.editor.valueHasChanged()).includes(true);
    },
    resizeFilesLayout() {
        if (filesLayout) {
            filesLayout.updateSize();
        }
    }
};

async function refreshFileSelectList(forceRefresh) {

    const files = await staticFiles.getEditableFiles({ forceRefresh: forceRefresh });

    //first we remove all options
    $('#' + fileSelectorId + ' option').remove();

    $('#' + fileSelectorId)
        .append($('<option></option>')
            .attr('value', '')
            .attr('selected', true)
            .text('- Open File -')
        );

    for (var i = 0; i < files.length; i++) {
        $('#' + fileSelectorId)
            .append($('<option></option>')
                .attr('value', files[i].fullFileName)
                .text(files[i].fullFileName)
            );
    }

    // restoring the selection without triggering a change event
    apex.item(fileSelectorId).setValue(null, null, true);
}

async function saveFiles(files) {
    var spinner$ = apex.util.showSpinner();
    apex.message.clearErrors();
    apex.message.hidePageSuccess();

    return new Promise(resolve => {
        server.uploadPluginFiles(util.getUploadPageUrl(), files)
            .then(response => {
                if (response.ok) {
                    util.showPageSuccess('File' + (files.length == 1 ? '' : 's') + ' saved successfully');
                    spinner$.remove();
                    resolve({ ok: true });
                } else {
                    apex.message.alert('The file could not be saved. Perhaps the session has expired.');
                    throw new Error('The file could not be saved');
                }
            }).catch(e => {
                spinner$.remove();
                resolve({ ok: false, message: e });
            });
    });
}

function addNewFileClick() {
    const dialog$ = $(common.markup.createNewFile).dialog({
        title: 'Create a New File',
        modal: true,
        minWidth: 600
    });

    $('#fos-new-file-dialog-close-button').on('click', function () {
        dialog$.dialog('destroy').remove();
    });

    $('#fos-new-file-dialog-save-button').on('click', function () {

        apex.message.clearErrors();

        const fileName = $('#fos-new-file-name').val();
        const directory = $('#fos-new-file-directory').val();

        //check if filename is provided
        if (!fileName) {
            globalUtil.showItemError('fos-new-file-name', 'A file name must be provided');
            return;
        }

        //check if extension is allowed
        if (!staticFiles.editableFileExtentions.includes(staticFiles.filesUtil.getExtensionFromFileName(fileName))) {
            globalUtil.showItemError('fos-new-file-name', 'The file\'s extension is not allowed.');
            return;
        }

        //check if file already exists
        const fullFileName = staticFiles.filesUtil.getFullFileNameFromDirectoryAndFileName(directory, fileName);

        if (staticFiles.filesUtil.fileExists(fullFileName)) {
            apex.message.alert('This file already exists.');
            return;
        }

        saveFiles([{
            fileName: fileName,
            directory: directory,
            mimeType: staticFiles.filesUtil.getMimeTypeFromFileName(fileName),
            content: ''
        }]).then(() => {
            return refreshFileSelectList(true);
        }).then(() => {
            return openFileEditor(fullFileName);
        }).then(() => {
            dialog$.dialog('destroy').remove();
        });
    });
}

function setupGoldenLayout() {
    var config = {
        settings: {
            showPopoutIcon: false,
            showMaximiseIcon: false,
            showCloseIcon: false,
            selectionEnabled: true
        },
        content: [{
            type: 'stack',
            isClosable: false,
            content: []
        }]
    };
    filesLayout = new GoldenLayout(config, $('#fos-files-layout'));

    filesLayout.registerComponent('fileEditor', function (container, state) {
        if (state.callback) {
            state.callback(container);
        }
    });

    filesLayout.init();

    window.addEventListener('resize', function () {
        util.resizeFilesLayout();
    });
}

async function openFileEditor(fullFileName) {

    if (util.fileIsOpened(fullFileName)) {
        util.setActiveFileEditor(fullFileName);
        return;
    }

    const file = staticFiles.getFileObjectByFullFileName(fullFileName);

    let editor;
    let content;

    const fileIsMinified = staticFiles.filesUtil.fileIsMinified(fullFileName);

    try {
        content = await server.fetchFileContent(file.link);
    } catch (error) {
        apex.message.alert('The file could not be loaded. Perhaps the session has expired.');
        return;
    }

    util.showFilesLayout();

    const saveFile = async function (options) {
        var files = [];

        const content = editor.getValue();
        file.content = content;

        files.push({
            content: file.content,
            fileName: file.fileName,
            directory: file.directory,
            mimeType: file.mimeType
        });

        if (options.minify) {
            let result;
            if (file.extension == 'js') {
                result = await fileProcesses.minifyJsFile(file);
            } else if (file.extension == 'css') {
                result = fileProcesses.minifyCssFile(file);
            }
            if (result.success) {
                files = files.concat(result.files);
            } else {
                apex.message.alert(result.message);
                return {
                    ok: false,
                    message: result.message
                };
            }

        }

        if (options.compile) {
            let result = await fileProcesses.compileLessFile(file);
            if (result.success) {
                files = files.concat(result.files);
            } else {
                apex.message.alert(result.message);
                return {
                    ok: false,
                    message: result.message
                };
            }
        }

        return new Promise(resolve => {
            saveFiles(files)
                .then((response) => {
                    if (response.ok) {
                        const allMetadataIsPresent = files.map(file => file.directory + (file.directory ? '/' : '') + file.fileName).every(v => staticFiles.files.map(file => file.fullFileName).includes(v));
                        //we hard refresh the files metadata, if:
                        //  1) file was empty before and therefore has no link
                        //     and if it now has content and it was saved
                        //     we trigger a force refresh so that it gets a link
                        //  2) it was minified and or compiled and the minified or compiled file did not yet exist
                        if ((!file.editor.initialValue && content) || !allMetadataIsPresent) {
                            refreshFileSelectList(true);
                        }
                    };
                    resolve(response);
                });
        });
    };

    function onNewContainerCreated(container) {

        let saveFunction;

        if (!fileIsMinified && !readOnly) {
            saveFunction = async function () {
                return saveFile({
                    minify: (['js', 'css'].includes(file.extension) && !fileIsMinified),
                    compile: file.extension == 'less'
                });
            }
        }

        editor = new ApexFileEditor({
            element: container.getElement()[0],
            language: ApexFileEditor.getLanguageByExtension(file.extension),
            value: content,
            readOnly: fileIsMinified || readOnly,
            save: saveFunction
        });

        editor.init()
            .then(() => {
                container.on('resize', function () {
                    editor.resize();
                });
                container.on('show', function () {
                    setTimeout(function () {
                        editor.resize();
                    }, 1);
                });
                editor.resize();

                file.container = container;
                file.editor = editor;
                openedFiles.push(file);
            });
    }

    filesLayout.on('tabCreated', function (tab) {
        tab.closeElement.off('click').click(function () {

            const fullFileName = tab.contentItem.config.id;

            function closeFile() {
                tab.contentItem.remove();
                //removing the object from openedFiles
                openedFiles = openedFiles.filter(function (openedFile) {
                    return openedFile.fullFileName != fullFileName;
                });
                if (!openedFiles.length) {
                    util.hideFilesLayout();
                }
            }

            if (util.getOpenedFile(fullFileName).editor.valueHasChanged()) {
                apex.message.confirm('You have unsaved changes. Are you sure you want to continue?', function (ok) {
                    if (ok) {
                        closeFile();
                    }
                });
            } else {
                closeFile();
            }
        });
    });

    filesLayout.root.contentItems[0].addChild({
        type: 'component',
        componentName: 'fileEditor',
        id: fullFileName,
        title: fullFileName,
        componentState: {
            callback: onNewContainerCreated
        }
    });
}

export async function setupEnvironment(options) {

    readOnly = options.readOnly;

    // Creating the Settings Menu
    const menu$ = $('<div id="fos-settings-menu"/>');
    $('body').append(menu$);
    menu$.menu({
        items: [{
            type: 'subMenu',
            label: 'Theme',
            menu: {
                items: [{
                    type: 'radioGroup',
                    set: function (value) {
                        globalUtil.setPreference(util.PREFERENCES.theme, value);
                        resetTheme();
                    },
                    get: function () {
                        let theme = globalUtil.getPreference(util.PREFERENCES.theme);
                        if (!theme) {
                            theme = 'automatic';
                        }
                        if (!['automatic', 'vs', 'vs-dark'].includes(theme)){
                            console.warn('Unknwon theme preference', theme);
                            theme = 'automatic';
                        }
                        return theme;
                    },
                    choices: [
                        { label: 'Automatic', value: 'automatic' },
                        { label: 'Light', value: 'vs' },
                        { label: 'Dark', value: 'vs-dark' },
                    ]
                }]
            }
        }]
    });

    // Adding the Edit Files region
    const fileEditorRegion$ = $(common.markup.staticFileEditor);
    $('#fos-files-layout', fileEditorRegion$).css('display', 'none');

    const buttonsContainer$ = $('.a-Region-headerItems--buttons', fileEditorRegion$);

    const settingsButton$ = $('<button data-menu="fos-settings-menu" class="a-Button a-Button--noLabel a-Button--withIcon js-menuButton" aria-label="Create File" title="Create File" type="button" aria-expanded="false"><span aria-hidden="true" class="fa fa-gear"></span></button>');
    buttonsContainer$.append(settingsButton$);

    if (!readOnly) {
        const createFileButton$ = $('<button type="button" title="Create File" aria-label="Create File" class="a-Button a-Button--noLabel a-Button--withIcon"><span aria-hidden="true" class="fa fa-file-o"></span></button>');
        createFileButton$.on('click', addNewFileClick);
        buttonsContainer$.append(createFileButton$);
    }

    fileEditorRegion$.insertAfter(options.insertRegionAfterSelector);

    /*
     * Preventing horizontal scrolling on the editor container to avoid accidentally going to previous page
     * This occurs mostly on during two-finger-scroll
     */
    $('#fos-files-layout').on('mousewheel', function (event, delta) {
        if (event.originalEvent.wheelDeltaX !== 0) {
            event.preventDefault();
        }
    });

    //fixing some css for the static files pages
    if ([40, 312].includes(pageId)) {
        $('#fos-files-region .a-Region').css('border-top', 'none');
    }

    //Make it expandable
    const expandableRegion = new ExpandableRegion({
        regionSelector: '#fos-files-region',
        buttonContainerSelector: '#fos-files-region .a-Region-headerItems--buttons',
        onExpand: util.resizeFilesLayout,
        onRestore: util.resizeFilesLayout
    });

    await refreshFileSelectList();
    setupGoldenLayout();

    $('#' + fileSelectorId).on('change', async function () {
        const fullFileName = $(this).val();
        apex.item(fileSelectorId).setValue(null, null, true);
        await openFileEditor(fullFileName);
    });

    if (options.autoOpenFiles) {
        for (let i = 0; i < options.autoOpenFiles.length; i++) {
            let fileName = options.autoOpenFiles[i];
            if (!staticFiles.filesUtil.fileExists(fileName)) {
                apex.message.alert([
                    'FOS: Error parsing settings.',
                    `File ${fileName} could not be found.`
                ].join('\n'));
            } else {
                openFileEditor(fileName);
            }
        }
    }

    if (!readOnly && options.listenToApplyChanges) {
        let pendingChangesListenerEnabled = true;
        apex.jQuery(apex.gPageContext$).on('apexbeforepagesubmit', function (e, request) {
            if (request == 'apply_changes' && pendingChangesListenerEnabled) {
                let pendingChanges = false;
                if (util.filesHaveUnsavedChanges()) {
                    pendingChanges = true;
                }
                if (pendingChanges) {
                    apex.event.gCancelFlag = true;
                    apex.message.confirm('Your files have unsaved changes. Are you sure you wish to continue?', function (ok) {
                        if (ok) {
                            pendingChangesListenerEnabled = false;
                            apex.page.submit('apply_changes');
                        } else {
                            pendingChangesListenerEnabled = true;
                        }
                    });
                }
            }
        });
    }

    if (!readOnly) {
        window.onbeforeunload = function (event) {
            if (util.filesHaveUnsavedChanges()) {
                event.preventDefault();
                return event.returnValue = 'One or more files have unsaved changes.';
            }
        }
    }
};