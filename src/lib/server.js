import {getPageId} from './util.js';

// files should be passed on as: [{directory, fileName, mimeType, content}]
// returns a promise that resolves to an object of {ok: boolean, error: string}
const uploadPluginFiles = async function(uploadPageUrl, files){

    let pageId = getPageId();

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

    return fetch(uploadPageUrl, {
        method: 'GET'
    })
    .then(response => response.text())
    .then(data => {
        const doc$ = $(data);

        const p_json = {
            pageItems: {
                itemsToSubmit:[
                    {
                        n: `P${pageId}_DIRECTORY`,
                        v: files[0].directory
                    },
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
                    },
                    {
                        n: `P0_FLOWPAGE`,
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

        // for plugin files we need to also submit the plugin id
        if(pageId == 4430){
            p_json.pageItems.itemsToSubmit.push({ 
                n: 'P4430_PLUGIN_ID',
                v: $('#P4430_PLUGIN_ID', doc$).val(),
                ck: $('input[data-for=P4430_PLUGIN_ID]', doc$).val()
            });
        }

        // for theme files we need to also submit the theme id
        if(pageId == 120){
            p_json.pageItems.itemsToSubmit.push({ 
                n: 'P120_THEME_ID',
                v: $('#P120_THEME_ID', doc$).val(),
                ck: $('input[data-for=P120_THEME_ID]', doc$).val()
            });
        }

        let formData = new FormData();

        formData.append('p_json', JSON.stringify(p_json));
        formData.append('p_flow_id', '4000');
        formData.append('p_flow_step_id', '' + pageId);
        formData.append('p_instance', $('#pInstance', doc$).val());
        formData.append('p_request', 'UPLOAD');
        formData.append('p_reload_on_submit', 'S');
        formData.append('p_page_submission_id',  $('#pPageSubmissionId', doc$).val());

        files.forEach(function(file){
            const fileBlob = new Blob([file.content], {type : file.mimeType});
            formData.append('p_files', fileBlob, file.fileName);
        });

        return fetch('wwv_flow.accept', {
            method: 'POST',
            body: formData
        })
        .then(result => result.json())
        .then(result => {
            if(result.redirectURL){
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