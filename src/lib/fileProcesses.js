import Terser from 'terser';
import * as staticFiles from './staticFiles.js';
import less from 'less';
import csso from '../../node_modules/csso/dist/csso.js';

window.Terser = Terser;

const minifyJsFile = file => {
    const files = [];
    const minifiedFileName = staticFiles.util.getMinifiedFileName(file.fileName);
    const mapFileName = staticFiles.util.getMapFileName(file.fileName);
    const result = Terser.minify({
        [file.fileName]: file.content
    }, {
        sourceMap: {
            filename: file.fileName,
            url: mapFileName
        }
    });

    if(!result.error){
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
    } else {
        const message = [
            'Could not minify file',
            `${result.error.name} at Line ${result.error.line} Column ${result.error.col}`,
            result.error.message
        ].join('\n');
        return {
            success: false,
            message: message
        };
    }
    return {
        success: true,
        files: files
    };
}

const minifyCssFile = file => {
    const files = [];
    const minifiedFileName = staticFiles.util.getMinifiedFileName(file.fileName);
    const mapFileName = staticFiles.util.getMapFileName(file.fileName);
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
        fileName: staticFiles.util.replaceExtension(file.fileName, 'css'),
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