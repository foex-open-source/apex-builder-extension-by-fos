import Terser from 'terser';
import * as staticFiles from './staticFiles.js';
import less from 'less';
import csso from '../../node_modules/csso/dist/csso.js';

const minifyJsFile = file => {
    const files = [];
    const terserResult = Terser.minify(file.content);

    if(terserResult.code !== undefined){
        files.push({
            content: terserResult.code,
            fileName: staticFiles.util.getMinifiedFileName(file.fileName),
            directory: file.directory,
            mimeType: file.mimeType
        });
    } else if(terserResult.error){
        const message = [
            'Could not minify file',
            `${terserResult.error.name} at Line ${terserResult.error.line} Column ${terserResult.error.col}`,
            terserResult.error.message
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

export {minifyJsFile, minifyCssFile};