import * as colorMode from './colorMode.js';
import { setTheme, setupMonaco } from './monacoEditorHelper.js';

document.addEventListener('fosThemeChange', function () {
    if (window.monaco) {
        setTheme(colorMode.getColorModeBinary() == 'dark' ? 'vs-dark' : 'vs');
    }
});

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

            const theme = colorMode.getColorModeBinary() == 'dark' ? 'vs-dark' : 'vs';

            if (!configuredPromise) {
                configuredPromise = setupMonaco(theme);
            }

            configuredPromise.then(() => {
                self.editor = monaco.editor.create(self.config.element, {
                    value: self.config.value,
                    language: self.config.language,
                    theme: theme,
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