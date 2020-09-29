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
                window.editor = self.editor;
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