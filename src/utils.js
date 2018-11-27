const fs = require('fs');
const path = require('path');

/**
 * Returns a list of strings that were matched in `str`
 * @param {RegExp} re the RegExp to match on
 * @param {string} str the string to search in
 * @returns {string[]} list of strings found
 */
function regexFindAll(re, str) {

    if (!re.flags.includes('g')) {
        re = new RegExp(re.source, re.flags + 'g');
    }

    var result = [];
    do {
        var match = re.exec(str);
        if (match) {
            result.push(match[0]);
        }
    } while (match);
    return result;
}

/**
 * Returns a list of all files recursively from a directory
 * @param {string} targetDir 
 * @returns {string[]} list of file names
 */
function getAllFiles(targetDir) {

    var fileList = [];
    var files = fs.readdirSync(targetDir, {withFileTypes: true});

    files.forEach(file => {
        var fileName = path.join(targetDir, file.name);
        if(file.isDirectory()) {
            fileList = fileList.concat(getAllFiles(fileName));
        } else {
            fileList.push(fileName);
        }
    });
    return fileList;
}

/**
 * Returns the union of two sets
 * @param {Set} s1 
 * @param {Set} s2 
 * @returns {Set} a set containing all elements of s1 and s2
 */
function union(s1, s2) {
    return new Set([...s1, ...s2])
}

module.exports = {
    regexFindAll: regexFindAll,
    getAllFiles: getAllFiles,
    union: union
}