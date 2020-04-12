const comments = apex.item('P4410_PLUGIN_COMMENT').getValue();
const commentLines = comments.split('\n').map(line => line.trim());

export function settingIsToggled(setting){
    return commentLines.filter(line => {
        return line.indexOf(setting) == 0
    }).length > 0;
}

export function getSettingListValue(setting){
    let line = commentLines.filter(line => {
        return line.indexOf(setting) == 0;
    });

    if(line.length > 0){
        line = line[0];
    } else {
        return null;
    }

    const list = line.substring(line.indexOf(':')+1);

    return list.split(',');
}