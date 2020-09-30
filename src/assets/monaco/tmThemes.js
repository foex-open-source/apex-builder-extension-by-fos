// This satisfies the contract of IRawTheme as defined in vscode-textmate.
/*
export interface IRawTheme {
  readonly name?: string;
  readonly settings: [{
    readonly name?: string;
    readonly scope?: string | string[];
    readonly settings: {
      readonly fontStyle?: string;
      readonly foreground?: string;
      readonly background?: string;
    };
  }];
}
*/

// SD
// These configurations were borrowed from GitHub CodeSpaces
// Theoretically they are a combination of the following 3 files
//      https://github.com/microsoft/vscode/blob/master/extensions/theme-defaults/themes/dark_plus.json
//      https://github.com/microsoft/vscode/blob/master/extensions/theme-defaults/themes/dark_vs.json
//      settings.settings.fore/background: https://github.com/microsoft/vscode/blob/master/extensions/theme-defaults/themes/dark_defaults.json
// Last updated on 30th September 2020

const tmVs = {
    "name": "Light+ (default light)",
    "settings": [
        {
            "settings": {
                "foreground": "#000000",
                "background": "#FFFFFF"
            }
        },
        {
            "scope": [
                "meta.embedded",
                "source.groovy.embedded"
            ],
            "settings": {
                "foreground": "#000000"
            }
        },
        {
            "scope": "emphasis",
            "settings": {
                "fontStyle": "italic"
            }
        },
        {
            "scope": "strong",
            "settings": {
                "fontStyle": "bold"
            }
        },
        {
            "scope": "meta.diff.header",
            "settings": {
                "foreground": "#000080"
            }
        },
        {
            "scope": "comment",
            "settings": {
                "foreground": "#008000"
            }
        },
        {
            "scope": "constant.language",
            "settings": {
                "foreground": "#0000FF"
            }
        },
        {
            "scope": [
                "constant.numeric",
                "variable.other.enummember",
                "keyword.operator.plus.exponent",
                "keyword.operator.minus.exponent"
            ],
            "settings": {
                "foreground": "#098658"
            }
        },
        {
            "scope": "constant.regexp",
            "settings": {
                "foreground": "#811F3F"
            }
        },
        {
            "scope": "entity.name.tag",
            "settings": {
                "foreground": "#800000"
            }
        },
        {
            "scope": "entity.name.selector",
            "settings": {
                "foreground": "#800000"
            }
        },
        {
            "scope": "entity.other.attribute-name",
            "settings": {
                "foreground": "#FF0000"
            }
        },
        {
            "scope": [
                "entity.other.attribute-name.class.css",
                "entity.other.attribute-name.class.mixin.css",
                "entity.other.attribute-name.id.css",
                "entity.other.attribute-name.parent-selector.css",
                "entity.other.attribute-name.pseudo-class.css",
                "entity.other.attribute-name.pseudo-element.css",
                "source.css.less entity.other.attribute-name.id",
                "entity.other.attribute-name.attribute.scss",
                "entity.other.attribute-name.scss"
            ],
            "settings": {
                "foreground": "#800000"
            }
        },
        {
            "scope": "invalid",
            "settings": {
                "foreground": "#CD3131"
            }
        },
        {
            "scope": "markup.underline",
            "settings": {
                "fontStyle": "underline"
            }
        },
        {
            "scope": "markup.bold",
            "settings": {
                "foreground": "#000080",
                "fontStyle": "bold"
            }
        },
        {
            "scope": "markup.heading",
            "settings": {
                "foreground": "#800000",
                "fontStyle": "bold"
            }
        },
        {
            "scope": "markup.italic",
            "settings": {
                "fontStyle": "italic"
            }
        },
        {
            "scope": "markup.inserted",
            "settings": {
                "foreground": "#098658"
            }
        },
        {
            "scope": "markup.deleted",
            "settings": {
                "foreground": "#A31515"
            }
        },
        {
            "scope": "markup.changed",
            "settings": {
                "foreground": "#0451A5"
            }
        },
        {
            "scope": [
                "punctuation.definition.quote.begin.markdown",
                "punctuation.definition.list.begin.markdown"
            ],
            "settings": {
                "foreground": "#0451A5"
            }
        },
        {
            "scope": "markup.inline.raw",
            "settings": {
                "foreground": "#800000"
            }
        },
        {
            "scope": "punctuation.definition.tag",
            "settings": {
                "foreground": "#800000"
            }
        },
        {
            "scope": [
                "meta.preprocessor",
                "entity.name.function.preprocessor"
            ],
            "settings": {
                "foreground": "#0000FF"
            }
        },
        {
            "scope": "meta.preprocessor.string",
            "settings": {
                "foreground": "#A31515"
            }
        },
        {
            "scope": "meta.preprocessor.numeric",
            "settings": {
                "foreground": "#098658"
            }
        },
        {
            "scope": "meta.structure.dictionary.key.python",
            "settings": {
                "foreground": "#0451A5"
            }
        },
        {
            "scope": "storage",
            "settings": {
                "foreground": "#0000FF"
            }
        },
        {
            "scope": "storage.type",
            "settings": {
                "foreground": "#0000FF"
            }
        },
        {
            "scope": [
                "storage.modifier",
                "keyword.operator.noexcept"
            ],
            "settings": {
                "foreground": "#0000FF"
            }
        },
        {
            "scope": [
                "string",
                "meta.embedded.assembly"
            ],
            "settings": {
                "foreground": "#A31515"
            }
        },
        {
            "scope": [
                "string.comment.buffered.block.pug",
                "string.quoted.pug",
                "string.interpolated.pug",
                "string.unquoted.plain.in.yaml",
                "string.unquoted.plain.out.yaml",
                "string.unquoted.block.yaml",
                "string.quoted.single.yaml",
                "string.quoted.double.xml",
                "string.quoted.single.xml",
                "string.unquoted.cdata.xml",
                "string.quoted.double.html",
                "string.quoted.single.html",
                "string.unquoted.html",
                "string.quoted.single.handlebars",
                "string.quoted.double.handlebars"
            ],
            "settings": {
                "foreground": "#0000FF"
            }
        },
        {
            "scope": "string.regexp",
            "settings": {
                "foreground": "#811F3F"
            }
        },
        {
            "scope": [
                "punctuation.definition.template-expression.begin",
                "punctuation.definition.template-expression.end",
                "punctuation.section.embedded"
            ],
            "settings": {
                "foreground": "#0000FF"
            }
        },
        {
            "scope": [
                "meta.template.expression"
            ],
            "settings": {
                "foreground": "#000000"
            }
        },
        {
            "scope": [
                "support.constant.property-value",
                "support.constant.font-name",
                "support.constant.media-type",
                "support.constant.media",
                "constant.other.color.rgb-value",
                "constant.other.rgb-value",
                "support.constant.color"
            ],
            "settings": {
                "foreground": "#0451A5"
            }
        },
        {
            "scope": [
                "support.type.vendored.property-name",
                "support.type.property-name",
                "variable.css",
                "variable.scss",
                "variable.other.less",
                "source.coffee.embedded"
            ],
            "settings": {
                "foreground": "#FF0000"
            }
        },
        {
            "scope": [
                "support.type.property-name.json"
            ],
            "settings": {
                "foreground": "#0451A5"
            }
        },
        {
            "scope": "keyword",
            "settings": {
                "foreground": "#0000FF"
            }
        },
        {
            "scope": "keyword.control",
            "settings": {
                "foreground": "#0000FF"
            }
        },
        {
            "scope": "keyword.operator",
            "settings": {
                "foreground": "#000000"
            }
        },
        {
            "scope": [
                "keyword.operator.new",
                "keyword.operator.expression",
                "keyword.operator.cast",
                "keyword.operator.sizeof",
                "keyword.operator.alignof",
                "keyword.operator.typeid",
                "keyword.operator.alignas",
                "keyword.operator.instanceof",
                "keyword.operator.logical.python",
                "keyword.operator.wordlike"
            ],
            "settings": {
                "foreground": "#0000FF"
            }
        },
        {
            "scope": "keyword.other.unit",
            "settings": {
                "foreground": "#098658"
            }
        },
        {
            "scope": [
                "punctuation.section.embedded.begin.php",
                "punctuation.section.embedded.end.php"
            ],
            "settings": {
                "foreground": "#800000"
            }
        },
        {
            "scope": "support.function.git-rebase",
            "settings": {
                "foreground": "#0451A5"
            }
        },
        {
            "scope": "constant.sha.git-rebase",
            "settings": {
                "foreground": "#098658"
            }
        },
        {
            "scope": [
                "storage.modifier.import.java",
                "variable.language.wildcard.java",
                "storage.modifier.package.java"
            ],
            "settings": {
                "foreground": "#000000"
            }
        },
        {
            "scope": "variable.language",
            "settings": {
                "foreground": "#0000FF"
            }
        },
        {
            "scope": [
                "entity.name.function",
                "support.function",
                "support.constant.handlebars",
                "source.powershell variable.other.member",
                "entity.name.operator.custom-literal"
            ],
            "settings": {
                "foreground": "#795E26"
            }
        },
        {
            "scope": [
                "meta.return-type",
                "support.class",
                "support.type",
                "entity.name.type",
                "entity.name.namespace",
                "entity.other.attribute",
                "entity.name.scope-resolution",
                "entity.name.class",
                "storage.type.numeric.go",
                "storage.type.byte.go",
                "storage.type.boolean.go",
                "storage.type.string.go",
                "storage.type.uintptr.go",
                "storage.type.error.go",
                "storage.type.rune.go",
                "storage.type.cs",
                "storage.type.generic.cs",
                "storage.type.modifier.cs",
                "storage.type.variable.cs",
                "storage.type.annotation.java",
                "storage.type.generic.java",
                "storage.type.java",
                "storage.type.object.array.java",
                "storage.type.primitive.array.java",
                "storage.type.primitive.java",
                "storage.type.token.java",
                "storage.type.groovy",
                "storage.type.annotation.groovy",
                "storage.type.parameters.groovy",
                "storage.type.generic.groovy",
                "storage.type.object.array.groovy",
                "storage.type.primitive.array.groovy",
                "storage.type.primitive.groovy"
            ],
            "settings": {
                "foreground": "#267F99"
            }
        },
        {
            "scope": [
                "meta.type.cast.expr",
                "meta.type.new.expr",
                "support.constant.math",
                "support.constant.dom",
                "support.constant.json",
                "entity.other.inherited-class"
            ],
            "settings": {
                "foreground": "#267F99"
            }
        },
        {
            "scope": [
                "keyword.control",
                "source.cpp keyword.operator.new",
                "source.cpp keyword.operator.delete",
                "keyword.other.using",
                "keyword.other.operator",
                "entity.name.operator"
            ],
            "settings": {
                "foreground": "#AF00DB"
            }
        },
        {
            "scope": [
                "variable",
                "meta.definition.variable.name",
                "support.variable",
                "entity.name.variable"
            ],
            "settings": {
                "foreground": "#001080"
            }
        },
        {
            "scope": [
                "variable.other.constant",
                "variable.other.enummember"
            ],
            "settings": {
                "foreground": "#0070C1"
            }
        },
        {
            "scope": [
                "meta.object-literal.key"
            ],
            "settings": {
                "foreground": "#001080"
            }
        },
        {
            "scope": [
                "support.constant.property-value",
                "support.constant.font-name",
                "support.constant.media-type",
                "support.constant.media",
                "constant.other.color.rgb-value",
                "constant.other.rgb-value",
                "support.constant.color"
            ],
            "settings": {
                "foreground": "#0451A5"
            }
        },
        {
            "scope": [
                "punctuation.definition.group.regexp",
                "punctuation.definition.group.assertion.regexp",
                "punctuation.definition.character-class.regexp",
                "punctuation.character.set.begin.regexp",
                "punctuation.character.set.end.regexp",
                "keyword.operator.negation.regexp",
                "support.other.parenthesis.regexp"
            ],
            "settings": {
                "foreground": "#D16969"
            }
        },
        {
            "scope": [
                "constant.character.character-class.regexp",
                "constant.other.character-class.set.regexp",
                "constant.other.character-class.regexp",
                "constant.character.set.regexp"
            ],
            "settings": {
                "foreground": "#811F3F"
            }
        },
        {
            "scope": "keyword.operator.quantifier.regexp",
            "settings": {
                "foreground": "#000000"
            }
        },
        {
            "scope": [
                "keyword.operator.or.regexp",
                "keyword.control.anchor.regexp"
            ],
            "settings": {
                "foreground": "#EE0000"
            }
        },
        {
            "scope": "constant.character",
            "settings": {
                "foreground": "#0000FF"
            }
        },
        {
            "scope": "constant.character.escape",
            "settings": {
                "foreground": "#EE0000"
            }
        },
        {
            "scope": "entity.name.label",
            "settings": {
                "foreground": "#000000"
            }
        },
        {
            "scope": "token.info-token",
            "settings": {
                "foreground": "#316BCD"
            }
        },
        {
            "scope": "token.warn-token",
            "settings": {
                "foreground": "#CD9731"
            }
        },
        {
            "scope": "token.error-token",
            "settings": {
                "foreground": "#CD3131"
            }
        },
        {
            "scope": "token.debug-token",
            "settings": {
                "foreground": "#800080"
            }
        }
    ]
};

const tmVsDark = {
    "name": "Dark+ (default dark)",
    "settings": [
        {
            "settings": {
                "foreground": "#D4D4D4",
                "background": "#1E1E1E"
            }
        },
        {
            "scope": [
                "meta.embedded",
                "source.groovy.embedded"
            ],
            "settings": {
                "foreground": "#D4D4D4"
            }
        },
        {
            "scope": "emphasis",
            "settings": {
                "fontStyle": "italic"
            }
        },
        {
            "scope": "strong",
            "settings": {
                "fontStyle": "bold"
            }
        },
        {
            "scope": "header",
            "settings": {
                "foreground": "#000080"
            }
        },
        {
            "scope": "comment",
            "settings": {
                "foreground": "#6A9955"
            }
        },
        {
            "scope": "constant.language",
            "settings": {
                "foreground": "#569CD6"
            }
        },
        {
            "scope": [
                "constant.numeric",
                "variable.other.enummember",
                "keyword.operator.plus.exponent",
                "keyword.operator.minus.exponent"
            ],
            "settings": {
                "foreground": "#B5CEA8"
            }
        },
        {
            "scope": "constant.regexp",
            "settings": {
                "foreground": "#646695"
            }
        },
        {
            "scope": "entity.name.tag",
            "settings": {
                "foreground": "#569CD6"
            }
        },
        {
            "scope": "entity.name.tag.css",
            "settings": {
                "foreground": "#D7BA7D"
            }
        },
        {
            "scope": "entity.other.attribute-name",
            "settings": {
                "foreground": "#9CDCFE"
            }
        },
        {
            "scope": [
                "entity.other.attribute-name.class.css",
                "entity.other.attribute-name.class.mixin.css",
                "entity.other.attribute-name.id.css",
                "entity.other.attribute-name.parent-selector.css",
                "entity.other.attribute-name.pseudo-class.css",
                "entity.other.attribute-name.pseudo-element.css",
                "source.css.less entity.other.attribute-name.id",
                "entity.other.attribute-name.attribute.scss",
                "entity.other.attribute-name.scss"
            ],
            "settings": {
                "foreground": "#D7BA7D"
            }
        },
        {
            "scope": "invalid",
            "settings": {
                "foreground": "#F44747"
            }
        },
        {
            "scope": "markup.underline",
            "settings": {
                "fontStyle": "underline"
            }
        },
        {
            "scope": "markup.bold",
            "settings": {
                "foreground": "#569CD6",
                "fontStyle": "bold"
            }
        },
        {
            "scope": "markup.heading",
            "settings": {
                "foreground": "#569CD6",
                "fontStyle": "bold"
            }
        },
        {
            "scope": "markup.italic",
            "settings": {
                "fontStyle": "italic"
            }
        },
        {
            "scope": "markup.inserted",
            "settings": {
                "foreground": "#B5CEA8"
            }
        },
        {
            "scope": "markup.deleted",
            "settings": {
                "foreground": "#CE9178"
            }
        },
        {
            "scope": "markup.changed",
            "settings": {
                "foreground": "#569CD6"
            }
        },
        {
            "scope": "punctuation.definition.quote.begin.markdown",
            "settings": {
                "foreground": "#6A9955"
            }
        },
        {
            "scope": "punctuation.definition.list.begin.markdown",
            "settings": {
                "foreground": "#6796E6"
            }
        },
        {
            "scope": "markup.inline.raw",
            "settings": {
                "foreground": "#CE9178"
            }
        },
        {
            "scope": "punctuation.definition.tag",
            "settings": {
                "foreground": "#808080"
            }
        },
        {
            "scope": [
                "meta.preprocessor",
                "entity.name.function.preprocessor"
            ],
            "settings": {
                "foreground": "#569CD6"
            }
        },
        {
            "scope": "meta.preprocessor.string",
            "settings": {
                "foreground": "#CE9178"
            }
        },
        {
            "scope": "meta.preprocessor.numeric",
            "settings": {
                "foreground": "#B5CEA8"
            }
        },
        {
            "scope": "meta.structure.dictionary.key.python",
            "settings": {
                "foreground": "#9CDCFE"
            }
        },
        {
            "scope": "meta.diff.header",
            "settings": {
                "foreground": "#569CD6"
            }
        },
        {
            "scope": "storage",
            "settings": {
                "foreground": "#569CD6"
            }
        },
        {
            "scope": "storage.type",
            "settings": {
                "foreground": "#569CD6"
            }
        },
        {
            "scope": [
                "storage.modifier",
                "keyword.operator.noexcept"
            ],
            "settings": {
                "foreground": "#569CD6"
            }
        },
        {
            "scope": [
                "string",
                "meta.embedded.assembly"
            ],
            "settings": {
                "foreground": "#CE9178"
            }
        },
        {
            "scope": "string.tag",
            "settings": {
                "foreground": "#CE9178"
            }
        },
        {
            "scope": "string.value",
            "settings": {
                "foreground": "#CE9178"
            }
        },
        {
            "scope": "string.regexp",
            "settings": {
                "foreground": "#D16969"
            }
        },
        {
            "scope": [
                "punctuation.definition.template-expression.begin",
                "punctuation.definition.template-expression.end",
                "punctuation.section.embedded"
            ],
            "settings": {
                "foreground": "#569CD6"
            }
        },
        {
            "scope": [
                "meta.template.expression"
            ],
            "settings": {
                "foreground": "#D4D4D4"
            }
        },
        {
            "scope": [
                "support.type.vendored.property-name",
                "support.type.property-name",
                "variable.css",
                "variable.scss",
                "variable.other.less",
                "source.coffee.embedded"
            ],
            "settings": {
                "foreground": "#9CDCFE"
            }
        },
        {
            "scope": "keyword",
            "settings": {
                "foreground": "#569CD6"
            }
        },
        {
            "scope": "keyword.control",
            "settings": {
                "foreground": "#569CD6"
            }
        },
        {
            "scope": "keyword.operator",
            "settings": {
                "foreground": "#D4D4D4"
            }
        },
        {
            "scope": [
                "keyword.operator.new",
                "keyword.operator.expression",
                "keyword.operator.cast",
                "keyword.operator.sizeof",
                "keyword.operator.alignof",
                "keyword.operator.typeid",
                "keyword.operator.alignas",
                "keyword.operator.instanceof",
                "keyword.operator.logical.python",
                "keyword.operator.wordlike"
            ],
            "settings": {
                "foreground": "#569CD6"
            }
        },
        {
            "scope": "keyword.other.unit",
            "settings": {
                "foreground": "#B5CEA8"
            }
        },
        {
            "scope": [
                "punctuation.section.embedded.begin.php",
                "punctuation.section.embedded.end.php"
            ],
            "settings": {
                "foreground": "#569CD6"
            }
        },
        {
            "scope": "support.function.git-rebase",
            "settings": {
                "foreground": "#9CDCFE"
            }
        },
        {
            "scope": "constant.sha.git-rebase",
            "settings": {
                "foreground": "#B5CEA8"
            }
        },
        {
            "scope": [
                "storage.modifier.import.java",
                "variable.language.wildcard.java",
                "storage.modifier.package.java"
            ],
            "settings": {
                "foreground": "#D4D4D4"
            }
        },
        {
            "scope": "variable.language",
            "settings": {
                "foreground": "#569CD6"
            }
        },
        {
            "scope": [
                "entity.name.function",
                "support.function",
                "support.constant.handlebars",
                "source.powershell variable.other.member",
                "entity.name.operator.custom-literal"
            ],
            "settings": {
                "foreground": "#DCDCAA"
            }
        },
        {
            "scope": [
                "meta.return-type",
                "support.class",
                "support.type",
                "entity.name.type",
                "entity.name.namespace",
                "entity.other.attribute",
                "entity.name.scope-resolution",
                "entity.name.class",
                "storage.type.numeric.go",
                "storage.type.byte.go",
                "storage.type.boolean.go",
                "storage.type.string.go",
                "storage.type.uintptr.go",
                "storage.type.error.go",
                "storage.type.rune.go",
                "storage.type.cs",
                "storage.type.generic.cs",
                "storage.type.modifier.cs",
                "storage.type.variable.cs",
                "storage.type.annotation.java",
                "storage.type.generic.java",
                "storage.type.java",
                "storage.type.object.array.java",
                "storage.type.primitive.array.java",
                "storage.type.primitive.java",
                "storage.type.token.java",
                "storage.type.groovy",
                "storage.type.annotation.groovy",
                "storage.type.parameters.groovy",
                "storage.type.generic.groovy",
                "storage.type.object.array.groovy",
                "storage.type.primitive.array.groovy",
                "storage.type.primitive.groovy"
            ],
            "settings": {
                "foreground": "#4EC9B0"
            }
        },
        {
            "scope": [
                "meta.type.cast.expr",
                "meta.type.new.expr",
                "support.constant.math",
                "support.constant.dom",
                "support.constant.json",
                "entity.other.inherited-class"
            ],
            "settings": {
                "foreground": "#4EC9B0"
            }
        },
        {
            "scope": [
                "keyword.control",
                "source.cpp keyword.operator.new",
                "keyword.operator.delete",
                "keyword.other.using",
                "keyword.other.operator",
                "entity.name.operator"
            ],
            "settings": {
                "foreground": "#C586C0"
            }
        },
        {
            "scope": [
                "variable",
                "meta.definition.variable.name",
                "support.variable",
                "entity.name.variable"
            ],
            "settings": {
                "foreground": "#9CDCFE"
            }
        },
        {
            "scope": [
                "variable.other.constant",
                "variable.other.enummember"
            ],
            "settings": {
                "foreground": "#4FC1FF"
            }
        },
        {
            "scope": [
                "meta.object-literal.key"
            ],
            "settings": {
                "foreground": "#9CDCFE"
            }
        },
        {
            "scope": [
                "support.constant.property-value",
                "support.constant.font-name",
                "support.constant.media-type",
                "support.constant.media",
                "constant.other.color.rgb-value",
                "constant.other.rgb-value",
                "support.constant.color"
            ],
            "settings": {
                "foreground": "#CE9178"
            }
        },
        {
            "scope": [
                "punctuation.definition.group.regexp",
                "punctuation.definition.group.assertion.regexp",
                "punctuation.definition.character-class.regexp",
                "punctuation.character.set.begin.regexp",
                "punctuation.character.set.end.regexp",
                "keyword.operator.negation.regexp",
                "support.other.parenthesis.regexp"
            ],
            "settings": {
                "foreground": "#CE9178"
            }
        },
        {
            "scope": [
                "constant.character.character-class.regexp",
                "constant.other.character-class.set.regexp",
                "constant.other.character-class.regexp",
                "constant.character.set.regexp"
            ],
            "settings": {
                "foreground": "#D16969"
            }
        },
        {
            "scope": [
                "keyword.operator.or.regexp",
                "keyword.control.anchor.regexp"
            ],
            "settings": {
                "foreground": "#DCDCAA"
            }
        },
        {
            "scope": "keyword.operator.quantifier.regexp",
            "settings": {
                "foreground": "#D7BA7D"
            }
        },
        {
            "scope": "constant.character",
            "settings": {
                "foreground": "#569CD6"
            }
        },
        {
            "scope": "constant.character.escape",
            "settings": {
                "foreground": "#D7BA7D"
            }
        },
        {
            "scope": "entity.name.label",
            "settings": {
                "foreground": "#C8C8C8"
            }
        },
        {
            "scope": "token.info-token",
            "settings": {
                "foreground": "#6796E6"
            }
        },
        {
            "scope": "token.warn-token",
            "settings": {
                "foreground": "#CD9731"
            }
        },
        {
            "scope": "token.error-token",
            "settings": {
                "foreground": "#F44747"
            }
        },
        {
            "scope": "token.debug-token",
            "settings": {
                "foreground": "#B267E6"
            }
        }
    ]
};

define(function () {
    return { tmVs, tmVsDark };
});
