import {encode} from './../../global/util.js';
// files should be passed on as: [{directory, fileName, mimeType, content}]
// returns a promise that resolves to an object of {ok: boolean, error: string}
const uploadPluginFiles = async function(uploadPageUrl, files){
    let scope, isCreate = files.length === 1;
    let pageId = FOS.util.pageId;
    let versionMoreThan211 = FOS.util.apexVersion > 211;
    let versionLessThan221 = FOS.util.apexVersion < 221;
    
    if(versionMoreThan211) {
        pageId = 118;
    } else {
        switch(pageId){
            case 40:
                pageId = 271;
                break;
            case 267:
                pageId = 120;
                break;
            case 312:
                pageId = 314;
                break;
            case 4410:
                pageId = 4430;
                break;
        }    
    }

    return fetch(uploadPageUrl, {
        method: 'GET'
    })
    .then(response => response.text())
    .then(data => {
        const doc$ = $(data);

        let p_json = {
            pageItems: {
                itemsToSubmit : [
                    {
                        n: `P${pageId}_DIRECTORY`,
                        v: files[0].directory
                    },
                    {
                        n: 'P0_FLOWPAGE',
                        v: $('#P0_FLOWPAGE', doc$).val()
                    }
                ],
                protected: $('#pPageItemsProtected', doc$).val(),
                rowVersion: $('#pPageItemsRowVersion', doc$).val(),
                formRegionChecksums: [
                ]
            },
            salt: $('#pSalt', doc$).val()
        };
        
        if(versionMoreThan211){
            scope = $('#P118_SCOPE', doc$).val();
            p_json.pageItems.itemsToSubmit.push(
                {
                    n: 'P118_ID',
                    v: $('#P118_ID', doc$).val(),
                    ck: $(`input[data-for=P118_ID]`, doc$).val()
                },
                {
                    n: 'P118_SCOPE',
                    v: $('#P118_SCOPE', doc$).val(),
                    ck: $(`input[data-for=P118_SCOPE]`, doc$).val()
                },
                {
                    n: 'P118_APP_ID',
                    v: $('#P118_APP_ID', doc$).val(),
                    ck: $(`input[data-for=P118_APP_ID]`, doc$).val()
                },
                {
                    n: 'P118_NAME_ORIGINAL',
                    v: $('#P118_NAME_ORIGINAL', doc$).val(),
                    ck: $(`input[data-for=P118_NAME_ORIGINAL]`, doc$).val()
                },
                {
                    n: 'P118_LAST_MOD',
                    v: $('#P118_LAST_MOD', doc$).val() || '',
                    ck: $(`input[data-for=P118_LAST_MOD]`, doc$).val()
                },
                {
                    n: `P118_THEME_ID`,
                    v: $(`#P118_THEME_ID`, doc$).val(),
                    ck: $('input[data-for=P118_THEME_ID]', doc$).val()
                }
            );
            if(isCreate){
                p_json.pageItems.itemsToSubmit.push(
                    {
                        n: 'P118_NAME',
                        v: files[0].fileName
                    },
                    {
                        n: 'P118_CHARSET',
                        v: 'utf-8'
                    },
                    {
                        n: 'P118_UNZIP',
                        v: 'Y'
                    },
                    {
                        n: 'P118_LANGUAGE',
                        v: $('#P118_LANGUAGE', doc$).val(),
                        ck: $(`input[data-for=P118_LANGUAGE]`, doc$).val()
                    },
                    {
                        n: 'P118_IS_EDITABLE',
                        v: $('#P118_IS_EDITABLE', doc$).val(),
                        ck: $(`input[data-for=P118_IS_EDITABLE]`, doc$).val()
                    },
                    {
                        n: 'P118_CONTENT',
                        v: []
                    },
                    {
                        n: 'P0_WINDOW_MGMT_SHARE_WINDOW',
                        v: $('#P0_WINDOW_MGMT_SHARE_WINDOW', doc$).val(),
                        ck: $(`input[data-for=P0_WINDOW_MGMT_SHARE_WINDOW]`, doc$).val()
                    },
                    {
                        n: 'P0_WINDOW_MGMT_MODE',
                        v: $('#P0_WINDOW_MGMT_MODE', doc$).val(),
                        ck: $(`input[data-for=P0_WINDOW_MGMT_MODE]`, doc$).val()
                    },
                    { 
                        n: `P${pageId}_PLUGIN_ID`,
                        v: $(`#P${pageId}_PLUGIN_ID`, doc$).val(),
                        ck: $(`input[data-for=P${pageId}_PLUGIN_ID]`, doc$).val()
                    }
                )
                if(versionLessThan221){
                    p_json.pageItems.itemsToSubmit.push({
                        n: 'P118_RETURN_TO_URL',
                        v: $('#P118_RETURN_TO_URL', doc$).val(),
                        ck: $(`input[data-for=P118_RETURN_TO_URL]`, doc$).val()
                    });
                }
                
            }
        } else {
            p_json.pageItems.itemsToSubmit.push(
                {
                    n: `P${pageId}_UPLOAD_FILE_NAME`,
                    v: files[0].fileName,
                    fileIndex: 1,
                    fileCount: files.length
                },
                {
                    n: `P${pageId}_FILE_CHARSET`,
                    v: 'utf-8'
                },
                {
                    n: `P${pageId}_UNZIP_FILE`,
                    v: 'Y'
                }
            )
        };
            
        
        // for plugin files we need to also submit the plugin id
        if(pageId == 4430){
            p_json.pageItems.itemsToSubmit.push({ 
                n: `P${pageId}_PLUGIN_ID`,
                v: $(`#P${pageId}_PLUGIN_ID`, doc$).val(),
                ck: $(`input[data-for=P${pageId}_PLUGIN_ID]`, doc$).val()
            });
        }

        // for theme files we need to also submit the theme id
        if(pageId == 120){
            p_json.pageItems.itemsToSubmit.push({ 
                n: `P${pageId}_THEME_ID`,
                v: $(`#P${pageId}_THEME_ID`, doc$).val(),
                ck: $('input[data-for=P120_THEME_ID]', doc$).val()
            });
        }

        let formData = new FormData();

        formData.append('p_json', JSON.stringify(p_json));
        formData.append('p_flow_id', '4000');
        formData.append('p_flow_step_id', '' + pageId);
        formData.append('p_instance', $('#pInstance', doc$).val());
        formData.append('p_debug', '');
        if(versionMoreThan211){
            if(isCreate){
                formData.append('p_request', 'CREATE');
                formData.append('p_reload_on_submit', 'S');
                formData.append('p_page_submission_id',  $('#pPageSubmissionId', doc$).val());
            } else {
                formData.append('p_request', 'APPLICATION_PROCESS=SAVE');
            }
        } else {
            formData.append('p_request', 'UPLOAD');
            formData.append('p_reload_on_submit', 'S');
            formData.append('p_page_submission_id',  $('#pPageSubmissionId', doc$).val());
        }
        files.forEach(function(file,idx){
            if(versionMoreThan211){
                if(!isCreate){
                    formData.append('x0'+parseInt(idx+1), (file.directory ? file.directory + '/' : '') + file.fileName);
                    let encodedFile = apex.server.chunk(encode(file.content));
                    if(typeof encodedFile === 'string'){
                        formData.append('f0'+parseInt(idx+1), encodedFile);
                    } else {
                        encodedFile.forEach((chunk)=>{
                            formData.append('f0'+parseInt(idx+1), chunk);
                        })
                    }
                }
            } else {
                const fileBlob = new Blob([file.content], {type : file.mimeType});
                formData.append('p_files', fileBlob, file.fileName);
            }
        });

        let url;
        if(versionMoreThan211){
            url = `wwv_flow.${isCreate ? 'accept' : 'ajax'}?p_context=4000:${pageId}:${$('#pInstance', doc$).val()}`;
        } else {
            url = 'wwv_flow.accept';
        }

        return fetch(url, {
            method: 'POST',
            body: formData
        })
        .then(result => result.json())
        .then(result => {
            if(result.redirectURL || result.success){
                return {
                    ok: true
                };
            } else {
                return {
                    ok: false,
                    error: 'Unknown error'
                };
            }
        })
        .catch(error => {
            return {
                ok: false,
                error: error
            };
        });
    })
    .catch(error => {
        return {
            ok: false, 
            error: error
        };
    });
};

const fetchFileContent = async function(fileLink){

    // if there is no link, it means the file is empty
    // return empty file
    if(!fileLink){
        return '';
    }

    return fetch(fileLink)
    .then(response => {
        if(response.ok){
            return response.text();
        } else {
            throw new Error(response.status);
        }
    });
};

export {uploadPluginFiles, fetchFileContent};