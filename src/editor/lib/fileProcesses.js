import {minify} from 'terser';
import * as staticFiles from './staticFiles';
import less from 'less';
import csso from '../../../node_modules/csso/dist/csso';

const minifyJsFile = async function(file) {
    const files = [];
    const minifiedFileName = staticFiles.filesUtil.getMinifiedFileName(file.fileName);
    const mapFileName = staticFiles.filesUtil.getMapFileName(file.fileName);

    try {
        const result = await minify({
            [file.fileName]: file.content
        }, {
            sourceMap: {
                filename: file.fileName,
                url: mapFileName
            }
        });
        files.push({
            content: result.code,
            fileName: minifiedFileName,
            directory: file.directory,
            mimeType: file.mimeType
        });
        files.push({
            content: result.map,
            fileName: mapFileName,
            directory: file.directory,
            mimeType: 'application/json'
        });
        return {
            success: true,
            files: files
        };
    } catch (error) {
        return {
            success: false,
            message: [
                'Could not minify file',
                `${error.name} at Line ${error.line} Column ${error.col}`,
                error.message
            ].join('\n')
        };
    }
}

const minifyCssFile = file => {
    const files = [];
    const minifiedFileName = staticFiles.filesUtil.getMinifiedFileName(file.fileName);
    const mapFileName = staticFiles.filesUtil.getMapFileName(file.fileName);
    const cssoResult = csso.minify(file.content, {
        sourceMap: true,
        filename: file.fileName
    });
    files.push({
        content: cssoResult.css + `\n/*# sourceMappingURL=${mapFileName}*/`,
        fileName: minifiedFileName,
        directory: file.directory,
        mimeType: file.mimeType
    });
    files.push({
        content: cssoResult.map.toString(),
        fileName: mapFileName,
        directory: file.directory,
        mimeType: 'application/json'
    });
    return {
        success: true,
        files: files
    };
}

const compileLessFile = async function(file) {
    let files = [];
    let lessResult;
    try{
        lessResult = await less.render(file.content);
    } catch(e) {
        const message = [
            'Could not compile file',
            `${e.type} error at Line ${e.line} Column ${e.column}`,
            e.message
        ].join('\n');
        return {
            ok: false,
            message: message
        };
    }
    files.push({
        content: lessResult.css,
        fileName: staticFiles.filesUtil.replaceExtension(file.fileName, 'css'),
        directory: file.directory,
        mimeType: staticFiles.mimeTypes['css']
    });
    files = files.concat(minifyCssFile(files[0]).files);
    return {
        success: true,
        files: files
    };
}

export {minifyJsFile, minifyCssFile, compileLessFile};