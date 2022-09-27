
function getSelectedComponents() {
    let components, result = [], selectedNodes = [], selectedTab = getSelectedTab();
    if (!selectedTab){
        return undefined;
    }

    switch(selectedTab){
        case 'renderTree_container':
            selectedNodes = jQuery('#PDrenderingTree').treeView('getSelectedNodes');
            break;
        case 'dynActTree_container':
            selectedNodes = jQuery('#PDdynamicActionTree').treeView('getSelectedNodes');
            break;
        case 'procTree_container':
            selectedNodes = jQuery('#PDprocessingTree').treeView('getSelectedNodes');
            break;
    }

    selectedNodes.forEach((node) => {
        if (node.data?.typeId) {
            components = pe.getComponents(node.data.typeId, {
                id: node.data.componentId
            });
            if (components && components.length) {
                result.push(components[0]);
            }
        }
    });

    return result;
}

function getSelectedTab(type) {
    const TAB_CONTAINER = type === 'property' ? 'peTabs' : 'editor_tabs';
    // get the selected tab
    let tabContainer = $('#' + TAB_CONTAINER);
    if (tabContainer.length < 1) {
        return undefined;
    }

    let activeTab = tabContainer.data().uiTabs.active;
    if (!activeTab) {
        return undefined;
    }

    let tabName = activeTab.attr('aria-controls');
    if(!tabName){
        return undefined;
    }

    if(type === 'property'){
        return tabName.toLowerCase().includes('attribute') ? 'attribute' : 'component';
    } else {
        return tabName;
    }
    
}

function getCurrentPropertyData() {
    const CODEMIRROR_PE = 'pe';
    const MONACO_PE_MAIN = 'peMain';
    const MONACO_PE_ATTR = 'peAttributes';
    let selectedTab = getSelectedTab('property');
    if (!selectedTab) {
        return undefined;
    }
    let monacoPE = selectedTab == 'attribute' ? MONACO_PE_ATTR : MONACO_PE_MAIN;
    let propertyEditor = $('#' + (FOS.util.apexVersion > 192 ? monacoPE : CODEMIRROR_PE)).data().apexPropertyEditor;
    let currentPropertyId = propertyEditor.currentPropertyName;
    let attributeEl = $('[data-property-id=' + currentPropertyId + ']');
    let propertyGroupId = attributeEl.closest('.a-PropertyEditor-propertyGroup[data-group-id]').attr('data-group-id');
    let propGroupObj = propertyEditor.options.data.propertySet.find(obj => obj.displayGroupId == propertyGroupId);
    let propObj;
    if (propGroupObj) {
        propObj = propGroupObj.properties.find(obj => obj.propertyName == currentPropertyId);
    }
    return {
        attributeEl,
        propObj
    };
}

function getCurrentPageItems() {
    // get all the page item components from the current page
    let pageItemComps = pe.getComponents(pe.COMP_TYPE.PAGE_ITEM, {});
    // filter out the items with 'Session State Protection' set to 'Restricted - May not be set from browser'
    pageItemComps = pageItemComps.filter(comp => comp.getProperty(pe.PROP.SESSION_STATE_PROTECTION || '172').getValue() != 'I');
    // create an array with the item names
    let pageItems = pageItemComps.map((comp) => {
        return comp.getProperty(pe.PROP.ITEM_NAME).getValue().toLowerCase();
    });
    return pageItems;
}

/**
 * 
 * @param {array} contentItems 
 * @returns a string with the new evaulated value of the Items To Submit field
 */
function getNewITSValue(contentItems) {
    return contentItems.length > 0 ? contentItems.join(',') : '';
}

/**
 * 
 * @param {array} arrA 
 * @param {array} arrB 
 * @returns an array with the values that are in A but not in B
 */
function getADiffersFromB(arrA, arrB) {
    return arrA.filter(item => !arrB.includes(item));
}

/**
 * 
 * @param {object} component 
 * @param {object} itsEl 
 * @param {string} newValue 
 */
function createTrasaction(component, itsEl, newValue) {
    let message = pe.transaction.message({
        action: pe.MESSAGE_ACTION.CHANGE,
        component: component,
        property: itsEl
    });

    let transaction = {};
    if (FOS.util.apexVersion > 192) {
        transaction = pe.transaction.start($('#peMain').data().apexPdPropertyEditor.widgetName, message);
    } else {
        transaction = pe.transaction.start('property_editor_main', message);
    }
    itsEl.setValue(newValue);

    if (!jQuery.isEmptyObject(transaction)) {
        apex.commandHistory.execute(transaction);
    }
}

/**
 * 
 * @param {*} addedItems 
 * @param {*} removedItems 
 * @returns the success message to display
 */
function createITSTransactionSuccessMessage(addedItems, removedItems) {
    let successMessage = '';
    if (addedItems.length > 0 && addedItems[0] != '') {
        successMessage += addedItems.join(', ').toUpperCase() + ' added to the Items To Submit field.';
    }

    if (removedItems.length > 0 && removedItems[0] != '') {
        successMessage += removedItems.join(', ').toUpperCase() + ' removed from Items To Submit field';
    }

    return successMessage;
}

function reevaulateSuccessMessage(transactionValues) {
    let itsArr = transactionValues.itsVal.split(',');
    let itemsToAdd = getADiffersFromB(transactionValues.contentItems, itsArr);
    let itemsToRemove = getADiffersFromB(itsArr, transactionValues.contentItems);
    let successMessage = createITSTransactionSuccessMessage(itemsToAdd, itemsToRemove);
    pageDesigner.showSuccess(successMessage, 1500);
}

/**
 * 
 * @param {object} component 
 * @param {object} itsEl 
 * @param {array} itsVal 
 * @param {array} contentItems 
 */
function setITSValue(component, itsEl, itsVal, contentItems) {
    let newValue = getNewITSValue(contentItems);
    if (newValue != itsVal) {
        createTrasaction(component, itsEl, newValue);

        reevaulateSuccessMessage({
            itsVal,
            contentItems
        });
    }
}

function getFosPluginITSIds() {
    let props = pe.getAll().properties;
    const fosNameId = '7000_PLUGIN_COM.FOS.';
    const prompt = 'items to submit';
    let result = [];
    for (let prop in props) {
        let currentProp = props[prop];
        if (currentProp.name.includes(fosNameId) && currentProp.prompt.toLowerCase().includes(prompt)) {
            result.push(currentProp.id);
        }
    }
    return result;
}

function getITSElId(component) {
    let selectedProperty = getCurrentPropertyData();

    let selectedPropertyType = selectedProperty?.propObj?.metaData?.type;
    //  do add to the where clause editor. issue: after updating the ITS element, the textarea is destroyed and re-rendered
    if( !selectedPropertyType || !selectedPropertyType.includes('SQL') ){
        return '';
    }
    // Items To Submit attribute property id
    const C_ITEMS_TO_SUBMIT_ID = '215';

    // Execute Server-side Code 
    const C_SSC_ITEMS_TO_SUBMIT_ID = '1811567115248315739';

    // Set Value
    const C_SETVALUE_ITEMS_TO_SUBMIT_ID = '262597322287494361';
    
    let itemIds = [C_ITEMS_TO_SUBMIT_ID, C_SSC_ITEMS_TO_SUBMIT_ID, C_SETVALUE_ITEMS_TO_SUBMIT_ID, ...getFosPluginITSIds()];

    for (let i = 0; i < itemIds.length; i++) {
        let prop = component.getProperty(itemIds[i]);
        if (prop) {
            return prop;
        }
    }

    return '';
}

function setEditorState(initValue, editor, saveBtn) {
    const iconSpan = saveBtn.firstChild;
    if (initValue != editor.getValue()) {
        FOS.isEditorChanged = true;
        iconSpan.classList.add('fam-blank');
    } else {
        FOS.isEditorChanged = false;
        iconSpan.classList.remove('fam-blank');
    }
}

function save(editor, initValue, saveBtn) {
    let pdContainer = $('#a_PageDesigner');
    // get the dom element and the prop object behind the editor
    let propData = getCurrentPropertyData();
    // get the editor value
    let editorValue = editor.getValue();
    // do not save if the initValue and the editorValue are the save
    if (initValue == editorValue || pdContainer.hasClass('is-processing') || propData.attributeEl.length == 0 || !propData.propObj) {
        return;
    }

    // disable the save button
    $(saveBtn).attr('disabled', true);

    // show spinner and overlay on the page                    
    let spinner$;
    apex.util.delayLinger.start('main', function () {
        spinner$ = apex.util.showSpinner(pdContainer);
        pdContainer.addClass('is-processing');
    });

    let isMonaco = FOS.util.apexVersion > 192;
    // auto validate the code (if it's possible)
    let validateAction = isMonaco ? editor.getAction('apex-code-validate') : editor.options.validateCode;
    if (validateAction) {
        isMonaco ? validateAction._run() : editor._validateCode();
        // there's no real result of the validation, so we just check if the success message displayed or not
        // if not we do not continue
        if ($('.a-' + (isMonaco ? 'Monaco' : 'Code') + 'Editor-notification').find('.is-success').length == 0) {
            apex.util.delayLinger.finish('main', function () {
                spinner$.remove();
                pdContainer.removeClass('is-processing');
            });
            // enable the save button
            $(saveBtn).attr('disabled', false);
            return;
        }
    }

    // set the value of the textarea and the prop obj
    // (same happens on OK click)
    propData.attributeEl.val(editorValue);
    propData.propObj.value = editorValue;
    propData.attributeEl.trigger('change');

    // save the changes - actually save the whole page
    pe.saveChanges((response) => {
        // clear the history
        apex.commandHistory.clear();
        $(document).trigger('commandHistoryChange');

        // show error if not no_changes error
        if (response.error) {
            if (response.error !== 'NO_CHANGES') {
                pageDesigner.showError(response.error);
            }
        } else {
            // show notification
            pageDesigner.showSuccess(pageDesigner.msg('CHANGES_SAVED'));
            // set back the save button
            saveBtn.firstChild.classList.remove('fam-blank');
            // default the 'changed' flag
            FOS.isEditorChanged = false;
            // remove the 'changed value indicators' from the attributes in the property editor
            $('#' + (isMonaco ? 'peMain' : 'pe')).find('.' + pageDesigner.CSS.IS_CHANGED).removeClass(pageDesigner.CSS.IS_CHANGED);
        }

        // remove the spinner/overlay
        apex.util.delayLinger.finish('main', function () {
            spinner$.remove();
            pdContainer.removeClass('is-processing');
        });
        // enable the save button
        $(saveBtn).attr('disabled', false);
    });
}

function overrideSuccessNotification() {
    pageDesigner.showSuccess = function (pMsg, pMs = 2000) {
        pageDesigner.hideNotification();
        $('#pdNotificationState').addClass('is-success');
        $('#pdNotificationIcon').addClass('icon-check');
        pageDesigner.showNotification(pMsg);

        setTimeout(function () {
            pageDesigner.hideNotification();
        }, pMs);
    };
}

function toggleBuildOption(buildOptionId, isCommentedOut) {
    let components = getSelectedComponents();
    if (!components.length) {
        return true;
    }
    let variousValues = false;
    let currentValue, prevValue, properties = [];
    for (let i = 0; i < components.length; i++) {
        if(components[i].isReadOnly()){
            continue;
        }
        currentValue = getPropertyValue(components[i], pe.PROP.BUILD_OPTION);

        if (i === 0) {
            prevValue = currentValue;
        }

        if (prevValue != currentValue) {
            variousValues = true;
            break;
        }

        properties.push(currentValue);

        prevValue = currentValue;
    }
    if (variousValues) {
        return false;
    } else {
        let onlyCommentedOut = properties.every(prop => prop === buildOptionId);
        return isCommentedOut ? onlyCommentedOut : !onlyCommentedOut;
    }
}

function getPropertyValue(component, propertyName) {
    if (!component) {
        return;
    }
    let property = component.getProperty(propertyName);
    if (!property) {
        return;
    }
    return property.getValue();
}

function setPropertyTransaction(propertyValue, value) {
    // start PageDesigner Transaction
    let message = pe.transaction.message({
        action: pe.MESSAGE_ACTION.CREATE,
        component: pe.COMP_TYPE.PAGE_ITEM
    });
    let transaction = pe.transaction.start('', message);

    // set the value
    //setSelectedPropertyValue(pProperty, pValue);
    let components = getSelectedComponents();
    let property;
    components.forEach((component) => {
        if(component && component.isReadOnly()){
            console.log(`FOS Browser Extension: Component is read-only, cannot update build option.`);
            return;
        }
        property = component.getProperty(propertyValue);
        if (property) {
            property.setValue(value);
        }
    });

    // end transaction and close dialog
    apex.commandHistory.execute(transaction);
}

export {
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
};