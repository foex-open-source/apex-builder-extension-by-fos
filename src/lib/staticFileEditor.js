import * as common from '../markup.js';
import * as server from './server.js';
import * as staticFiles from './staticFiles.js';
import * as globalUtil from './util.js';
import {ApexFileEditor} from './ApexFileEditor.js';
import {ExpandableRegion} from './ExpandableRegion.js';
import less from 'less';
import Terser from 'terser';
import GoldenLayout from 'golden-layout';

let filesLayout;
let openedFiles = [];

const fileSelectorId = 'FOS_STATIC_FILE_SELECTOR';

let readOnly;

const pageId = document.getElementById('pFlowStepId').value;

// -------------------------------------------------------
// Utility functions
const util = {
    getOpenedFile: function(fullFileName){
        return openedFiles.filter(openedFile => openedFile.fullFileName == fullFileName)[0];
    },
    setActiveFileEditor: function(fullFileName){
        var item = filesLayout.root.getItemsById(fullFileName)[0];
        item.parent.setActiveContentItem(item);
    },
    fileIsOpened: function(fullFileName){
        return openedFiles.filter(openedFile => {
            return openedFile.fullFileName == fullFileName;
        }).length == 1;
    },
    showFilesLayout: function(){
        $('#fos-files-layout').show();
        util.resizeFilesLayout();
    },
    hideFilesLayout: function(){
        $('#fos-files-layout').hide();
    },
    getUploadPageUrl: function(){
        let uploadFilesButton$;
        if(pageId == 4410){
            uploadFilesButton$ = $('#FILES .a-Region-headerItems.a-Region-headerItems--buttons button').last();
        } else {
            uploadFilesButton$ = $('.a-IRR-region .a-Button.a-Button--hot').last();
        }
        const onClickAttr = uploadFilesButton$.attr('onclick');
        const modalUrl = JSON.parse(onClickAttr.match(/'.*?'/)[0].replace(/'/g, '"'));

        return modalUrl;
    },
    filesHaveUnsavedChanges: function(){
        if(!openedFiles || !openedFiles.length){
            return false;
        }
        return openedFiles.map(file => file.editor.valueHasChanged()).indexOf(true) > -1;
    },
    resizeFilesLayout(){
        if(filesLayout){
            filesLayout.updateSize();
        }
    }
};

async function refreshFileSelectList(forceRefresh){

    const files = await staticFiles.getEditableFiles({forceRefresh: forceRefresh});

    //first we remove all options
    $('#' + fileSelectorId +' option').remove();

    $('#' + fileSelectorId)
        .append($('<option></option>')
            .attr('value', '')
            .attr('selected', true)
            .text('- Open File -')
    );

    for(var i = 0; i<files.length; i++){
        $('#' + fileSelectorId)
            .append($('<option></option>')
                .attr('value', files[i].fullFileName)
                .text(files[i].fullFileName)
        );
    }

    // restoring the selection without triggering a change event
    apex.item(fileSelectorId).setValue(null, null, true);
}

async function saveFiles(files){
    var spinner$ = apex.util.showSpinner();
    apex.message.clearErrors();
    apex.message.hidePageSuccess();

    return new Promise(resolve => {
        server.uploadPluginFiles(util.getUploadPageUrl(), files)
        .then(response => {
            if(response.ok){
                globalUtil.showPageSuccess('File' + (files.length == 1 ? '' : 's') + ' saved successfully');
                spinner$.remove();
                resolve({ok: true});
            } else {
                apex.message.alert('The file could not be saved. Perhaps the session has expired.');
                console.error('The file could not be saved. Perhaps the session has expired.', response);
                throw new Error('The file could not be saved');
            }
        }).catch(e => {
            spinner$.remove();
            resolve({ok: false, message: e});
        });
    });
}

function addNewFileClick(){
    const dialog$ = $(common.markup.createNewFile).dialog({
        title: 'Create a New File',
        modal: true,
        minWidth: 600
    });

    $('#fos-new-file-dialog-close-button').on('click', function(){
        dialog$.dialog('destroy').remove();
    });

    $('#fos-new-file-dialog-save-button').on('click', function(){

        apex.message.clearErrors();

        const fileName = $('#fos-new-file-name').val();
        const directory = $('#fos-new-file-directory').val();

        //check if filename is provided
        if(!fileName){
            globalUtil.showItemError('fos-new-file-name', 'A file name must be provided');
            return;
        }

        //check if extension is allowed
        if(staticFiles.editableFileExtentions.indexOf(staticFiles.util.getExtensionFromFileName(fileName))==-1){
            globalUtil.showItemError('fos-new-file-name', 'The file\'s extension is not allowed.');
            return;
        }

        //check if file already exists
        const fullFileName = staticFiles.util.getFullFileNameFromDirectoryAndFileName(directory, fileName);

        if(staticFiles.util.fileExists(fullFileName)){
            apex.message.alert('This file already exists.');
            return;
        }

        saveFiles([{
            fileName: fileName,
            directory: directory,
            mimeType: staticFiles.util.getMimeTypeFromFileName(fileName),
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

function setupGoldenLayout(){
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
            content:[]
        }]
    };
    filesLayout = new GoldenLayout(config, $('#fos-files-layout'));
    
    filesLayout.registerComponent('fileEditor', function(container, state){
        if(state.callback){
            state.callback(container);
        }
    });
    
    filesLayout.init();
    
    window.addEventListener('resize', function(){
        util.resizeFilesLayout();
    });
}

async function openFileEditor(fullFileName){

    if(util.fileIsOpened(fullFileName)){
        util.setActiveFileEditor(fullFileName);
        return;
    }

    const file = staticFiles.getFileObjectByFullFileName(fullFileName);

    let editor;
    let content;

    const fileIsMinified = staticFiles.util.fileIsMinified(fullFileName);

    try {
        content = await server.fetchFileContent(file.link);
    } catch(error){
        console.error('Could not fetch file.');
        apex.message.alert('The file could not be loaded. Perhaps the session has expired.');
        return;
    }

    util.showFilesLayout();

    const saveFile = async function(options){
        var files = [];

        const content = editor.getValue();
    
        files.push({
            content: content,
            fileName: file.fileName,
            directory: file.directory,
            mimeType: file.mimeType
        });

        if(options.minify){
            const terserResult = Terser.minify(content);

            if(terserResult.code !== undefined){
                files.push({
                    content: terserResult.code,
                    fileName: staticFiles.util.getMinifiedFileName(file.fileName),
                    directory: file.directory,
                    mimeType: file.mimeType
                });
            } else if(terserResult.error){
                apex.message.alert([
                    'Could not minify file',
                    `${terserResult.error.name} at Line ${terserResult.error.line} Column ${terserResult.error.col}`,
                    terserResult.error.message
                ].join('\n'));
                return {
                    ok: false,
                    message: terserResult.error
                };
            }
        }

        if(options.compile){
            let lessjsResult;
            try{
                lessjsResult = await less.render(content);
            } catch(e) {
                apex.message.alert([
                    'Could not compile file',
                    `${e.type} error at Line ${e.line} Column ${e.column}`,
                    e.message
                ].join('\n'));
                return {
                    ok: false,
                    message: e.message
                };
            }
            files.push({
                content: lessjsResult.css,
                fileName: staticFiles.util.replaceExtension(file.fileName, 'css'),
                directory: file.directory,
                mimeType: staticFiles.mimeTypes['css']
            });
        }

        return new Promise(resolve => {
            saveFiles(files)
            .then((response) => {
                if(response.ok){
                    const allMetadataIsPresent = files.map(file => file.directory+(file.directory ? '/' : '')+file.fileName).every(v => staticFiles.files.map(file => file.fullFileName).includes(v));
                    //we hard refresh the files metadata, if:
                    //  1) file was empty before and therefore has no link
                    //     and if it now has content and it was saved
                    //     we trigger a force refresh so that it gets a link
                    //  2) it was minified and or compiled and the minified or compiled file did not yet exist
                    if((!file.editor.initialValue && content) || !allMetadataIsPresent){
                        refreshFileSelectList(true);
                    }
                };
                resolve(response);
            });
        });
    };

    function onNewContainerCreated(container){

        const saveFunction = (!fileIsMinified && !readOnly) ?
            (function(minify, compile){
                return async function(){
                    return saveFile({minify: minify, compile: compile});
                };
            })(false, false) : undefined;
        
        const minifyFunction = ((file.extension == 'js' && !fileIsMinified) && !readOnly) ?
            (function(minify, compile){
                return async function(){
                    return saveFile({minify: minify, compile: compile});
                };
            })(true, false) : undefined;
        
        const compileFunction = (file.extension == 'less' && !readOnly) ?
            (function(minify, compile){
                return async function(){
                    return saveFile({minify: minify, compile: compile});
                };
            })(false, true) : undefined;

        editor = new ApexFileEditor({
            element: container.getElement()[0],
            language: ApexFileEditor.getLanguageByExtension(file.extension),
            value: content,
            readOnly: fileIsMinified || readOnly,
            save: saveFunction,
            minify: minifyFunction,
            compile: compileFunction
        });
        editor.init()
        .then(() => {
            container.on('resize', function(){
                editor.resize();
            });
            container.on('show', function(){
                setTimeout(function(){
                    editor.resize();
                }, 1);
            });
            editor.resize();

            file.container = container;
            file.editor = editor;
            openedFiles.push(file);
        });
    }

    filesLayout.on('tabCreated', function(tab){
        tab.closeElement.off('click').click(function(){

            const fullFileName = tab.contentItem.config.id;

            function closeFile(){
                tab.contentItem.remove();
                //removing the object from openedFiles
                openedFiles = openedFiles.filter(function(openedFile){
                    return openedFile.fullFileName != fullFileName;
                });
                if(!openedFiles.length){
                    util.hideFilesLayout();
                }
            }
            
            if(util.getOpenedFile(fullFileName).editor.valueHasChanged()){
                apex.message.confirm('You have unsaved changes. Are you sure you want to continue?', function(ok){
                    if(ok){
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

export async function setupEnvironment(options){
    
    readOnly = options.readOnly;

    //Adding the Edit Files region
    const fileEditorRegion$ = $(common.markup.staticFileEditor);
    $('#fos-files-layout', fileEditorRegion$).css('display', 'none');
    if(!readOnly){
        const createFileButton$ = $('<button class="a-Button" type="button">Create File</button>');
        createFileButton$.on('click', addNewFileClick);
        $('.a-Region-headerItems--buttons', fileEditorRegion$).append(createFileButton$);
    }
    fileEditorRegion$.insertAfter(options.insertRegionAfterSelector);

    //fixing some css for the static files pages
    if(['40', '312'].indexOf(pageId) > -1){
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

    $('#' + fileSelectorId).on('change', async function(){
        const fullFileName = $(this).val();
        apex.item(fileSelectorId).setValue(null, null, true);
        await openFileEditor(fullFileName);
    });

    if(options.autoOpenFiles){
        for(let i = 0; i < options.autoOpenFiles.length; i++){
            let fileName = options.autoOpenFiles[i];
            if(!staticFiles.util.fileExists(fileName)){
                apex.message.alert([
                    'FOS: Error parsing settings.',
                    `File ${fileName} could not be found.`
                ].join('\n'));
            } else {
                openFileEditor(fileName);
            }
        }
    }

    if(!readOnly && options.listenToApplyChanges){
        let pendingChangesListenerEnabled = true;
        apex.jQuery(apex.gPageContext$).on('apexbeforepagesubmit', function(e, request){
            if(request == 'apply_changes' && pendingChangesListenerEnabled){
                let pendingChanges = false;
                if(util.filesHaveUnsavedChanges()){
                    pendingChanges = true;
                }
                if(pendingChanges){
                    apex.event.gCancelFlag = true;
                    apex.message.confirm('Your files have unsaved changes. Are you sure you wish to continue?', function(ok){
                        if(ok){
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

    if(!readOnly){
        window.onbeforeunload = function(event){
            if(util.filesHaveUnsavedChanges()){
                event.preventDefault();
                return event.returnValue = 'One or more files have unsaved changes.';
            }
        }
    }
};