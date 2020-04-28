
// files should be passed on as: [{directory, fileName, mimeType, content}]
// returns a promise that resolves to an object of {ok: boolean, error: string}
const uploadPluginFiles = async function(uploadPageUrl, files){

    let pageId = document.getElementById('pFlowStepId').value;
    if(pageId == '4410'){
        pageId = '4430';
    } else if(pageId == '312'){
        pageId = '314';
    } else if(pageId == '40'){
        pageId = '271';
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

        //for plugin files we need to submit one more item
        if(pageId == 4430){
            p_json.pageItems.itemsToSubmit.push({ 
                n: 'P4430_PLUGIN_ID',
                v: $('#P4430_PLUGIN_ID', doc$).val(),
                ck: $('input[data-for=P4430_PLUGIN_ID]', doc$).val()
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
                console.error('When trying to save the file(s), server responded', result);
                return {
                    ok: false,
                    error: 'Unknown error'
                };
            }
        })
        .catch(error => {
            console.error('Could not save file(s)', error);
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