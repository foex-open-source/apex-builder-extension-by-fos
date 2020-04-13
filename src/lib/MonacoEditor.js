//https://github.com/microsoft/monaco-editor-webpack-plugin/issues/42
self.MonacoEnvironment = {
    getWorkerUrl: function (workerId, label) {
        return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
        self.MonacoEnvironment = {
            baseUrl: '${window.fosExtensionBase}third-party/monaco-editor/min'
        };
        importScripts('${window.fosExtensionBase}third-party/monaco-editor/min/vs/base/worker/workerMain.js');`
        )}`;
    }
};

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
        return new Promise((resolve) => {
            require.config({paths: {'vs': window.fosExtensionBase + 'third-party/monaco-editor/min/vs' }});
            require(['vs/editor/editor.main'], monaco => {
                this.editor = monaco.editor.create(this.config.element, {
                    value: this.config.value,
                    language: this.config.language,
                    theme: 'vs-dark',
                    scrollbar: {
                        alwaysConsumeMouseWheel: false
                    },
                    readOnly: this.config.readOnly
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