import * as common from '../markup';
import * as server from './server';
import * as staticFiles from './staticFiles';
import * as fileProcesses from './fileProcesses';
import { ApexFileEditor } from './ApexFileEditor';
import { resetTheme } from './monacoEditorHelper';
import { ExpandableRegion } from './ExpandableRegion';
import GoldenLayout from 'golden-layout';

let filesLayout;
let openedFiles = [];

const fileSelectorId = 'FOS_STATIC_FILE_SELECTOR';

let readOnly;

const pageId = FOS.util.pageId;

// -------------------------------------------------------
// Utility functions
const util = {
    getOpenedFile: function (fullFileName) {
        return openedFiles.filter(openedFile => openedFile.fullFileName == fullFileName)[0];
    },
    setActiveFileEditor: function (fullFileName) {
        const item = filesLayout.root.getItemsById(fullFileName)[0];
        item.parent.setActiveContentItem(item);
    },
    fileIsOpened: function (fullFileName) {
        return openedFiles.filter(openedFile => {
            return openedFile.fullFileName == fullFileName;
        }).length == 1;
    },
    showFilesLayout: function () {
        $('#fos-files-layout,#fos-extra-controls').show();
        util.resizeFilesLayout();
    },
    hideFilesLayout: function () {
        $('#fos-files-layout,#fos-extra-controls').hide();
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

    for (let i = 0; i < files.length; i++) {
        $('#' + fileSelectorId)
            .append($('<option></option>')
                .attr('value', files[i].fullFileName)
                .text(files[i].fullFileName)
            );
    }

    // restoring the selection without triggering a change event
    apex.item(fileSelectorId).setValue(null, null, true);
}

async function hotReload(file) {

    // this functionality is only available on 19.2+
    if(FOS.util.apexVersion < 192){
        return;
    }

    // check if the hot reload option is enabled
    if(!$('#fos-extra-options-hot-reload:checked').length){
        return;
    }

    // only hot reload javascript and css
    const fileExtension = staticFiles.filesUtil.getExtensionFromFileName(file.fileName);
    if(!['js', 'css'].includes(fileExtension)){
        return;
    }

    let runtimeWindow = FOS.util.runtimeWindow;
    if(!runtimeWindow || runtimeWindow.length){
        FOS.util.runPage();
        runtimeWindow = FOS.util.runtimeWindow;
        // as the files will be freshed loaded anyway, we can stop now
        return;
    }

    let expectedPathPart;
    if([40, 312].includes(pageId)){
        expectedPathPart = '/files/static/';
    } else if (pageId == 267){
        expectedPathPart = '/files/theme/';
    } else if (pageId == 4410){
        expectedPathPart = '/files/plugin/' + $('#P4410_ID').val();
    }
    
    $(runtimeWindow).ready(function() {
        let fileName = (file.directory ? file.directory + '/' : '') + file.fileName;

        if(fileExtension == 'js'){
            $('script[src]', runtimeWindow.document).each(function(){
                const elem$ = $(this);
                let src = elem$.attr('src');
                // ignoring .min
                src = src.replace('.min.js', '.js');
                if(src.includes('/r/') && src.includes(expectedPathPart) && src.includes(fileName)){
                    // for js files we simply refresh the page
                    runtimeWindow.location.reload();
                    // stopping each loop
                    return false;
                }
            });    
        } else if (fileExtension == 'css'){
            $('link[rel="stylesheet"]', runtimeWindow.document).each(function(){
                const elem$ = $(this);
                let href = elem$.attr('href');
                // ignoring .min
                href = href.replace('.min.css', '.css');
                if(href.includes('/r/') && href.includes(expectedPathPart) && href.includes(fileName)){
                    // for css really the href with a new version
                    elem$.attr('href', href.split('?')[0] + '?v=' + new Date().valueOf());
                    // stopping each loop
                    return false;
                }
            });
        }
    });
}

async function saveFiles(files) {
    let spinner$ = apex.util.showSpinner();
    apex.message.clearErrors();
    apex.message.hidePageSuccess();

    let link;
    if(FOS.util.apexVersion > 211 && files.length > 1){
        link = files[0].editLink;
    } else {
        link = util.getUploadPageUrl();
    }

    return new Promise(resolve => {
        server.uploadPluginFiles(link, files)
            .then(response => {
                if (response.ok) {
                    FOS.util.showPageSuccess('File' + (files.length == 1 ? '' : 's') + ' saved successfully');
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
            FOS.util.showItemError('fos-new-file-name', 'A file name must be provided');
            return;
        }

        //check if extension is allowed
        if (!staticFiles.editableFileExtentions.includes(staticFiles.filesUtil.getExtensionFromFileName(fileName))) {
            FOS.util.showItemError('fos-new-file-name', 'The file\'s extension is not allowed.');
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
    const config = {
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
        let files = [];

        const content = editor.getValue();
        file.content = content;

        files.push({
            content: file.content,
            fileName: file.fileName,
            directory: file.directory,
            mimeType: file.mimeType,
            extension: file.extension,
            ...(FOS.util.apexVersion > 211 && {editLink: file.editLink}) 
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

                        if(file.extension == 'js'){
                            hotReload(files[0]);
                        } else if (file.extension == 'css'){
                            hotReload(files[0]);
                        } else if (file.extension == 'less' && options.compile){
                            hotReload(files[1]);
                        }

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
                        FOS.util.setPreference(FOS.util.PREFERENCES.theme, value);
                        resetTheme();
                    },
                    get: function () {
                        let theme = FOS.util.getPreference(FOS.util.PREFERENCES.theme);
                        if (!theme) {
                            theme = 'automatic';
                        }
                        if (!['automatic', 'vs', 'vs-dark'].includes(theme)) {
                            console.warn('Unknwon theme preference', theme);
                            theme = 'automatic';
                        }
                        return theme;
                    },
                    choices: [
                        { label: 'Automatic', value: 'automatic' },
                        { label: 'Light', value: 'vs' },
                        { label: 'Dark', value: 'vs-dark' }
                    ]
                }]
            }
        }]
    });

    // Adding the Edit Files region
    const fileEditorRegion$ = $(common.markup.staticFileEditor);
    $('#fos-files-layout,#fos-extra-controls', fileEditorRegion$).css('display', 'none');

    // Hot Reload feature is only avaiable on 19.2+
    // For now this is the simplest way to remove in earlier versions
    if(FOS.util.apexVersion < 192){
        $('#fos-extra-controls', fileEditorRegion$).remove();
    }

    const buttonsContainer$ = $('.a-Region-headerItems--buttons', fileEditorRegion$);

    const settingsButton$ = $('<button data-menu="fos-settings-menu" class="a-Button a-Button--noLabel a-Button--withIcon js-menuButton" aria-label="Settings" title="Settings" type="button" aria-expanded="false"><span aria-hidden="true" class="fa fa-gear"></span></button>');
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

    if(pageId === 4410){
        const plsqlRegion = new ExpandableRegion({
            regionSelector: '#SOURCE',
            buttonContainerSelector: '#SOURCE .a-Region-headerItems--buttons',
            onExpand: ()=>{
                util.resizeFilesLayout();
                let editor;
                if(FOS.util.apexVersion > 201){
                    editor = $('#P4410_PLSQL_CODE_widget').codeEditor('getEditor');
                    if(editor){
                        editor.layout();
                    }
                } else {
                    editor = document.querySelector('.CodeMirror').CodeMirror;
                    if(editor){
                        editor.refresh();
                    }
                }
            },
            onRestore: util.resizeFilesLayout
        });
    }
    

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