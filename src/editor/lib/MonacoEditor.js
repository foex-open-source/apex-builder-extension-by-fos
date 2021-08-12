import { setupMonaco, getAppropriateMonacoTheme } from './monacoEditorHelper';

let configuredPromise;

export class MonacoEditor {

    constructor(config) {
        this.config = config;
    }

    static getLanguageByExtension(extension) {
        switch (extension) {
            case 'js':
                return 'javascript';
            case 'ts':
                return 'typescript';
            default:
                return extension;
        }
    }

    async init() {

        const self = this;

        return new Promise((resolve) => {

            // small hack
            // on and after apex 20.2, on the plug-in page, there would be a conflict with the apex monaco
            // for now, we won't be able to use the fancy highlighting for js, as it would break the apex plsql code editor
            // so we don't initialize it, which means we'll be using the apex monaco instance
            if (!configuredPromise && FOS.util.apexVersion >= 202 && FOS.util.pageId == 4410) {
                // dummy promise
                configuredPromise = new Promise(function(resolve){
                    resolve();
                });
            }

            if (!configuredPromise) {
                configuredPromise = setupMonaco();
            }

            configuredPromise.then(() => {
                self.editor = monaco.editor.create(self.config.element, {
                    value: self.config.value,
                    language: self.config.language,
                    theme: getAppropriateMonacoTheme(),
                    scrollbar: {
                        alwaysConsumeMouseWheel: false
                    },
                    readOnly: self.config.readOnly
                });
                resolve();
            });
        });
    }

    resize() {
        this.editor.layout();
    }

    setValue(value) {
        this.editor.setValue(value);
    }

    getValue() {
        return this.editor.getValue();
    }
};