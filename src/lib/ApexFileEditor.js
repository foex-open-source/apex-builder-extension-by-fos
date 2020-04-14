import { MonacoEditor } from "./MonacoEditor.js";

function createToolbar(features){

    const buttons = [];
    const FOS_TOOLBAR_BUTTON_CLASS = 'fos-code-editor-toolbar-button';

    if(features.compile){
        buttons.push({
            buttonClasses: ['fos-compile-button'],
            title: 'Save & Compile',
            label: 'Compile',
            icon: 'fa-play'
        });
    }

    if(features.minify){
        buttons.push({
            buttonClasses: ['fos-minify-button'],
            title: 'Save & Minify',
            label: 'Minify',
            icon: 'fa-file-archive-o'
            //icon: 'fa-compress',
            //iconClass: 'fos-fa-rotate-45'
        });
    }

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
            toolbarElement.append(buttonElement);
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
            save: !!config.save,
            minify: !!config.minify,
            compile: !!config.compile
        });
        config.element.append(toolbarElement);

        config.element.append(editorElement);

        config.element = editorElement;
        super(config);

        this.config = config;

        if(this.config.save){
            this.saveButton = toolbarElement.getElementsByClassName('fos-save-button')[0];
        }
        if(this.config.minify){
            this.minifyButton = toolbarElement.getElementsByClassName('fos-minify-button')[0];
        }
        if(this.config.compile){
            this.compileButton = toolbarElement.getElementsByClassName('fos-compile-button')[0];
        }
    }

    async init(){
        await super.init();
        this.initialValue = this.config.value;

        const me = this;

        if(this.config.save){
            this.save = function(){
                me.config.save().then(response => {
                    if(response.ok){
                        me.initialValue = me.editor.getValue();
                        me.evaluateChangeIcon();
                    }
                });
            }
            this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, this.save);
            this.saveButton.addEventListener('click', this.save);
        }

        if(this.config.minify){
            this.minify = function(){
                me.config.minify().then(response => {
                    if(response.ok){
                        me.initialValue = me.editor.getValue();
                        me.evaluateChangeIcon();
                    }
                });
            }
            //this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, this.save);
            this.minifyButton.addEventListener('click', this.minify);
        }

        if(this.config.compile){
            this.compile = function(){
                me.config.compile().then(response => {
                    if(response.ok){
                        me.initialValue = me.editor.getValue();
                        me.evaluateChangeIcon();
                    }
                });
            }
            //this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, this.save);
            this.compileButton.addEventListener('click', this.compile);
        }

        this.editor.onDidChangeModelContent(() => this.evaluateChangeIcon());
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