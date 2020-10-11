const markup = {};

markup.documentationRegion =
`<div class="a-Region a-Region--noPadding a-Region--sideRegion" id="fos-documentation">
    <div class="a-Region-header">
        <div class="a-Region-headerItems  a-Region-headerItems--title">
            <h2 class="a-Region-title">API Reference</h2>
        </div>
    </div>
    <div class="a-Region-body">
        <div class="a-Region-bodyHeader"></div>
        <ul class="a-LinksList a-LinksList--showArrow">
            <li class="a-LinksList-item">
                <a href="" target="_blank" class="a-LinksList-link fos-plsql-api-link">
                    <span class="a-LinksList-label">PL/SQL</span>
                </a>
            </li>
            <li class="a-LinksList-item">
                <a href="" target="_blank" class="a-LinksList-link fos-js-api-link">
                    <span class="a-LinksList-label">JavaScript</span>
                </a>
            </li>
        </ul>
    </div>
</div>
`;

markup.boilerplateRegion = 
`<div class="a-Region a-Region--noPadding a-Region--sideRegion" id="fos-boilerplate">
    <div class="a-Region-header">
        <div class="a-Region-headerItems a-Region-headerItems--title">
            <h2 class="a-Region-title">Extras</h2>
        </div>
    </div>
    <div class="a-Region-body">
        <div class="a-Region-bodyHeader"></div>
        <ul class="a-LinksList a-LinksList--showArrow">
            <li class="a-LinksList-item">
                <a href="javascript:void();" class="a-LinksList-link fos-boilerplate-link">
                    <span class="a-LinksList-label">Boilerplate Code</span>
                </a>
            </li>
        </ul>
    </div>
</div>
`;

const apiLinks = {
    "5.0": {
        js: 'https://docs.oracle.com/cd/E59726_01/doc.50/e39149/javascript_api.htm',
        plsql: 'https://docs.oracle.com/cd/E59726_01/doc.50/e39149/toc.htm'
    },
    "5.1": {
        js: 'https://docs.oracle.com/database/apex-5.1/AEAPI/JavaScript-APIs.htm',
        plsql: 'https://docs.oracle.com/database/apex-5.1/AEAPI/toc.htm',
    },
    "18.1": {
        js: 'https://docs.oracle.com/database/apex-18.1/AEXJS/index.html',
        plsql: 'https://docs.oracle.com/database/apex-18.1/AEAPI/toc.htm',
    },
    "18.2": {
        js: 'https://docs.oracle.com/en/database/oracle/application-express/18.2/aexjs/index.html',
        plsql: 'https://docs.oracle.com/database/apex-18.2/AEAPI/toc.htm',
    },
    "19.1": {
        js: 'https://docs.oracle.com/en/database/oracle/application-express/19.1/aexjs/index.html',
        plsql: 'https://docs.oracle.com/en/database/oracle/application-express/19.1/aeapi/index.html',
    },
    "19.2": {
        js: 'https://docs.oracle.com/en/database/oracle/application-express/19.2/aexjs/index.html',
        plsql: 'https://docs.oracle.com/en/database/oracle/application-express/19.2/aeapi/index.html',
    },
    "20.1": {
        js: 'https://docs.oracle.com/en/database/oracle/application-express/20.1/aexjs/index.html',
        plsql: 'https://docs.oracle.com/en/database/oracle/application-express/20.1/aeapi/index.html',
    },
    "20.2": {
        js: 'https://docs.oracle.com/en/database/oracle/application-express/20.2/aexjs/index.html',
        plsql: 'https://docs.oracle.com/en/database/oracle/application-express/20.2/aeapi/index.html',
    }
};

export {markup, apiLinks};