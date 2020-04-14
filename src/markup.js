const markup = {};

markup.staticFileEditor = 
`
<div id="fos-files-region">
    <div class="a-Region a-Region--noPadding">
        <div class="a-Region-header">
            <div class="a-Region-headerItems a-Region-headerItems--title">
                <h2 class="a-Region-title">Edit Files</h2>
            </div>
            <div class="a-Form-inputContainer">
                <select id="FOS_STATIC_FILE_SELECTOR" class="selectlist apex-item-select" size="1"></select>
            </div>
            <div class="a-Region-headerItems a-Region-headerItems--buttons">
            </div>
        </div>
    </div>
    <div id="fos-files-layout"></div>
</div>
`;

markup.createNewFile =
`
<div class="a-Dialog-wrap">
    <div class="a-Dialog-body" style="bottom: 64px;">
        <div class="a-Wizard-region a-Form">
            <div class="a-Wizard-regionHeader">
                <p>Provide the directory and name of the new file:</p>
            </div>
            <div class="a-Wizard-regionBody">
                <div class="a-Form-fieldContainer  apex-item-wrapper apex-item-wrapper--text-field">
                    <div class="a-Form-labelContainer">
                        <label for="fos-new-file-directory" class="a-Form-label">Directory</label>
                    </div>
                    <div class="a-Form-inputContainer">
                        <input type="text" id="fos-new-file-directory" class="text_field apex-item-text" value="" size="32" maxlength="255">
                    </div>
                </div>
                <div class="a-Form-fieldContainer  apex-item-wrapper apex-item-wrapper--text-field">
                    <div class="a-Form-labelContainer">
                        <span class="a-Form-required">
                            <span class="a-Icon icon-asterisk"></span>
                        </span>
                        <label for="fos-new-file-name" class="a-Form-label">File Name<span class="u-VisuallyHidden">(Value Required)</span></label>
                    </div>
                    <div class="a-Form-inputContainer">
                        <input type="text" id="fos-new-file-name" required="" class="text_field apex-item-text" value="" size="32" maxlength="255">
                        <!-- TODO: use the actual help text markup -->
                        <p style="margin: 10px 0;">Allowed file types are: js, json, html, css and less</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="a-Dialog-footer">
        <div class="a-ButtonRegion a-ButtonRegion--wizard">
            <div class="a-ButtonRegion-wrap">
                <div class="a-ButtonRegion-col a-ButtonRegion-col--left">
                    <div class="a-ButtonRegion-buttons">
                        <button id="fos-new-file-dialog-close-button" class="a-Button" type="button">Cancel</button>
                    </div>
                </div>
                <div class="a-ButtonRegion-col a-ButtonRegion-col--content">
                    <h2 class="a-ButtonRegion-title">Dialog Buttons</h2>
                </div>
                <div class="a-ButtonRegion-col a-ButtonRegion-col--right">
                    <div class="a-ButtonRegion-buttons">
                        <button id="fos-new-file-dialog-save-button" class="a-Button a-Button--hot" type="button">Save</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`;

export {markup};