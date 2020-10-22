/* array of objects with metadata on the plugin files
    [{
        fullFileName, 
        directory, 
        fileName, 
        mimeType,
        link,
        extension,
        initialValue (holds the value of the last save, or the original value)
    }]
*/

import * as util from '../../global/util.js';

const pageId = util.pageId;

let files = [];
let filesFetchedOnce = false;

const editableFileExtentions = ['js', 'json', 'html', 'css', 'less', 'scss'];

const mimeTypes = {
    js: 'application/javascript',
    json: 'application/json',
    html: 'text/html',
    css: 'text/css',
    less: 'text/plain',
    scss: 'text/plain',
};

const filesUtil = {
    fileIsMinified: function(fileName){
        return fileName.indexOf('.min.') >= 0;
    },
    getMinifiedFileName: function(fileName){
        const parts = fileName.split('.');
        parts[parts.length-1] = 'min.' + parts[parts.length-1];
        return parts.join('.');
    },
    getMapFileName: function(fileName){
        return fileName + '.map';
    },
    getFullFileNameFromDirectoryAndFileName: function(directory, fileName){
        return directory + (directory ? '/' : '') + fileName;
    },
    getExtensionFromFileName: function(fileName){
        const parts = fileName.split('.');
        return parts[parts.length-1];
    },
    fileNameIsJs: function(fileName){
        const parts = fileName.split('.');
        return parts[parts.length-1] == 'js';
    },
    getDirectoryFromFullFileName: function(fullFileName){
        return fullFileName.split('/').slice(0,-1).join('/');
    },
    getFileNameFromFullFileName: function(fullFileName){
        return fullFileName.split('/').slice(-1)[0];
    },
    fileExists: function(fullFileName){
        return files.map(file => file.fullFileName).indexOf(fullFileName) > -1;
    },
    getMimeTypeFromFileName: function(fileName){
        const extension = filesUtil.getExtensionFromFileName(fileName);
        return mimeTypes[extension];
    },
    replaceExtension: function(fileName, newExtension){
        const parts = fileName.split('.');
        parts[parts.length - 1] = newExtension;
        return parts.join('.');
    }
};

const getFilesDataFromCR = async function(forceRefresh){
    filesFetchedOnce = true;

    async function getFilesDataFromReport(){

        const thereAreFiles = $('#report_FILES').length == 1;
        const thereAreMoreFiles = $('#report_FILES .a-Report-paginationLink').length > 0;
    
        if(!thereAreFiles){
            return [];
        }

        function readFilesFromElement(elem$){
    
            const arr = [];
    
            var rows$ = $('.a-Report-tableWrap > table > tbody > tr', elem$);
            
            rows$.each(function(){
                const obj = {};
    
                $(this).children().each(function(){
                    const innerText = $.trim($(this).text());
                    switch ($(this).attr('headers')){
                        case 'FILE_NAME':
                            obj.fullFileName = innerText;
                            obj.directory = filesUtil.getDirectoryFromFullFileName(innerText);
                            obj.fileName = filesUtil.getFileNameFromFullFileName(innerText);
                            obj.extension = filesUtil.getExtensionFromFileName(innerText);
                            break;
                        case 'MIME_TYPE':
                            obj.mimeType = innerText;
                            break;
                        //case 'FILE_SIZE':
                        //    obj.fileSize = innerText;
                        //    break;
                        case 'FILE_CONTENT':
                            obj.link = $(':first-child', this).attr('href');
                            break;
                    }
                });
                arr.push(obj);
            });
    
            return arr;
        }

        if(!thereAreMoreFiles){
            return readFilesFromElement($('#report_FILES'));
        } else {
            const nextPageLink = $('#report_FILES .a-Report-paginationLink').attr('href');
            const params = nextPageLink.match(/'(.*?)'/g).map(part => part.replace(/'/g, ''));
            const x01 = params[0];
            const p_request_plugin = params[1];
    
            let formData = new FormData();
    
            formData.append('p_flow_id', '4000');
            formData.append('p_flow_step_id', '4410');
            formData.append('p_instance', $('#pInstance').val());
            formData.append('p_debug', '');
            if(util.apexVersion == '5.1'){
                formData.append('p_request', 'APXWGT');
            } else {
                formData.append('p_request', 'PLUGIN=' + p_request_plugin);
            }
            formData.append('p_widget_action', 'paginate');
            formData.append('p_pg_min_row', '1');
            formData.append('p_pg_max_rows', '1000');
            formData.append('p_pg_rows_fetched', '0');

            if(util.apexVersion == '5.1'){
                formData.append('p_widget_name', 'classic_report');
            }
            
            formData.append('x01', '' + x01);
            formData.append('p_json', JSON.stringify({salt: $('#pSalt').val()}));
    
            const response = await fetch('wwv_flow.ajax', {
                method: 'POST',
                body: formData
            });
            
            if(response.ok){
                const result = await response.text();
                return readFilesFromElement($(result));
            } else {
                throw Error('AJAX Error ' + response.status);
            }
        }
    }

    if(forceRefresh){
        return new Promise(function(resolve){
            $(document).one('apexafterrefresh', async function(){
                resolve(getFilesDataFromReport());
            });
            apex.region('FILES').refresh();
        });
    } else {
        return getFilesDataFromReport();
    }
}

/*
 * to keep the code simple, in the IR version we will ignore forceRefresh
 * and simply always fetch fresh from the server
 * it's really not that costly
 */
const getFilesDataFromIR = async function(forceRefresh){
    filesFetchedOnce = true;

    function readFilesFromElement(elem$){

        const arr = [];

        var rows$ = $('.a-IRR-table tr', elem$);
        
        rows$.each(function(index){

            if(index==0) return;

            const obj = {};

            const cell0 = $(this).children().eq(0).text();  //file name
            const cell1 = $(this).children().eq(1).text();  //mime type
            const cell2 = $(this).children().eq(2).text();  //file size
            const cell3 = $(this).children().eq(3);         //reference
            const cell4 = $(this).children().eq(4);         //file

            obj.fullFileName = cell0;
            obj.directory = filesUtil.getDirectoryFromFullFileName(cell0);
            obj.fileName = filesUtil.getFileNameFromFullFileName(cell0);
            obj.extension = filesUtil.getExtensionFromFileName(cell0);
            obj.mimeType = cell1;
            obj.fileSize = cell2;
            obj.link = $(':first-child', cell4).attr('href');

            arr.push(obj);
        });

        return arr;
    }

    //getting the only IR region on the page
    let irRegion$ = $('.a-IRR-region').first();
    //id
    let irRegionId = irRegion$.attr('id');
    //widget instance
    let irInstance = $( '#' + irRegionId + "_ir" , apex.gPageContext$).data("apex-interactiveReport");;
    //ajax identifier
    let ajaxIdentifier = irInstance.options.ajaxIdentifier;
    //worksheet id
    let worksheetId = irInstance.worksheetId;

    let formData = new FormData();

    formData.append('p_flow_id', document.getElementById('pFlowId').value);
    formData.append('p_flow_step_id', document.getElementById('pFlowStepId').value);
    formData.append('p_instance',  document.getElementById('pInstance').value);
    formData.append('p_request', 'PLUGIN=' + ajaxIdentifier);
    formData.append('p_widget_name', 'worksheet');
    formData.append('p_widget_mod', 'ACTION');
    formData.append('p_widget_action', 'PAGE');
    formData.append('p_widget_action_mod', 'pgR_min_row=1max_rows=99999rows_fetched=0');
    formData.append('p_widget_num_return', '99999'); //?
    formData.append('x01', '' + worksheetId);
    //formData.append('x02', '' + reportId); // ?

    formData.append('p_json', JSON.stringify({salt: $('#pSalt').val()}));

    //refresh the data in case a file was added
    if(forceRefresh){
        apex.region(irRegionId).refresh();
    }

    const response = await fetch('wwv_flow.ajax', {
        method: 'POST',
        body: formData
    });
    
    if(response.ok){
        const result = await response.text();
        return readFilesFromElement($(result));
    } else {
        apex.message.alert('Could not fetch files list from server.');
        throw Error('AJAX Error ' + response.status);
    }
}

const getFilesData = async function(forceRefresh){
    if([4410, 267].includes(pageId)){
        return getFilesDataFromCR(forceRefresh);
    } else {
        return getFilesDataFromIR(forceRefresh);
    }
};

const getEditableFiles = async function(config){

    const forceRefresh = config.forceRefresh;

    if(forceRefresh || !filesFetchedOnce){
        files = await getFilesData(forceRefresh);
    }

    function getFileExtension(fileName){
        const parts = fileName.split('.');
        return parts[parts.length-1];
    }

    return files.filter(function(file){
        return editableFileExtentions.includes(getFileExtension(file.fileName));
    });
}

const getFileObjectByFullFileName = function(fullFileName){
    return files.filter((file) => {
        return file.fullFileName == fullFileName;
    })[0];
};

export {getEditableFiles, getFileObjectByFullFileName, filesUtil, editableFileExtentions, files, mimeTypes};