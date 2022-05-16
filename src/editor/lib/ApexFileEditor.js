import { MonacoEditor } from './MonacoEditor';

function createButton(buttonConfig){
    const FOS_TOOLBAR_BUTTON_CLASS = 'fos-code-editor-toolbar-button';
    const buttonElement = document.createElement('button');
    buttonElement.type = 'button';
    buttonElement.classList.add('a-Button', 'a-Button--simple', 'u-pullRight');
    if(buttonConfig.buttonClasses){
        buttonElement.classList.add(buttonConfig.buttonClasses, FOS_TOOLBAR_BUTTON_CLASS);
    }

    if(buttonConfig.icon){
        buttonElement.classList.add('a-Button--withIcon');
        const spanElement = document.createElement('span');
        spanElement.classList.add('fa', buttonConfig.icon, 'a-Icon');
        if(buttonConfig.iconClass){
            spanElement.classList.add(buttonConfig.iconClass);
        }
        buttonElement.append(spanElement);
    }

    if(buttonConfig.label){
        const el = document.createElement('span');
        el.innerText = buttonConfig.label;
        buttonElement.append(el);
    } else {
        buttonElement.classList.add('a-Button--noLabel');
    }

    buttonElement.title = buttonConfig.title;
    
    return buttonElement;
}

function createToolbar(features){

    const buttons = [];

    if(features.save){
        buttons.push({
            buttonClasses: ['fos-save-button'],
            title: 'Save',
            label: 'Save',
            icon: 'fa-save'
        });
    }

    const toolbarElement = document.createElement('div');
    toolbarElement.classList.add('fos-code-editor-toolbar');

    if(buttons){
        buttons.forEach(function(buttonConfig){
            toolbarElement.append(createButton(buttonConfig));
        });
    }

    return toolbarElement;
}

const CHANGES_PENDING_CLASS = 'fam-blank';

export class ApexFileEditor extends MonacoEditor{

    constructor(config){

        const editorElement = document.createElement('div');
        editorElement.classList.add('fos-code-editor');

        const toolbarElement = createToolbar({
            save: !!config.save
        });
        config.element.append(toolbarElement);

        config.element.append(editorElement);

        config.element = editorElement;
        super(config);

        this.config = config;

        if(this.config.save){
            this.saveButton = toolbarElement.getElementsByClassName('fos-save-button')[0];
        }
    }

    async init(){

        await super.init();

        const me = this;
        const newEditorVersion = FOS.util.apexVersion > 212 || FOS.util.apexVersion < 202;
        const saveKey = ![40,267,312].includes(FOS.util.pageId) ? ( newEditorVersion ? monaco.KeyCode.KeyS : monaco.KeyCode.KEY_S ) : monaco.KeyCode.KeyS;
        me.initialValue = me.config.value;

        if(me.config.save){
            me.save = function(){
                me.config.save().then(response => {
                    if(response.ok){
                        me.initialValue = me.editor.getValue();
                        me.evaluateChangeIcon();
                    }
                });
            }
            me.editor.addCommand(monaco.KeyMod.CtrlCmd | saveKey, me.save);
            me.saveButton.addEventListener('click', me.save);
        }

        me.editor.onDidChangeModelContent(() => me.evaluateChangeIcon());
    }

    evaluateChangeIcon(){
        const iconSpan = this.saveButton.firstChild;

        if(this.initialValue != this.editor.getValue()){
            iconSpan.classList.add(CHANGES_PENDING_CLASS);
        } else {
            iconSpan.classList.remove(CHANGES_PENDING_CLASS);
        }
    }

    valueHasChanged(){
        return this.initialValue != this.getValue();
    } 

    setValue(value) {
        this.initialValue = value;
        super.setValue(value);
    }
}

export {createButton};