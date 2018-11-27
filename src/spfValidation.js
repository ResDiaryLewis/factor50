const fs = require('fs');
const utils = require('./utils');

/**
 * Returns a list of all files ending in .tf recursively from a directory
 * @param {string} targetDir 
 * @returns {string[]} list of file names
 */
function getTfFiles(targetDir) {
    var fileList = utils.getAllFiles(targetDir);
    return fileList.filter(fileName => fileName.endsWith('.tf'));
}

/**
 * Returns a list of resource blocks in the target that matched the recordType
 * @param {string} resources the string to search in
 * @param {string} recordType the cloudflare_record record type regex, e.g. A, MX|TXT, .+?
 * @returns {string[]} a list of resource blocks found in the string with the given type
 */
function getCloudFlareResourcesWithType(resources, recordType) {
    var re = new RegExp('(resource "cloudflare_record" ".*" {[\\s\\S]*?type\\s+=\\s"(?:' + recordType + ')"[\\s\\S]*?})', 'g');
    var results = utils.regexFindAll(re, resources);
    return results;
}

/**
 * Given a cloudflare record block, finds the value of a given field
 * @param {string} resource the record to query
 * @param {string} fieldName the name of the field to query
 * @returns {string} the value of field `fieldName` in `record`
 */
function getCloudFlareRecordValue(resource, fieldName) {
    var re = new RegExp('resource "cloudflare_record" ".*" {[\\s\\S]*?' + fieldName + '\\s+=\\s"(.+?)"[\\s\\S]*?}', 'g');
    var match = re.exec(resource);
    if (match) {
        return match[1];
    } else {
        return null;
    }
}

/**
 * Returns the hostname + top level domain of a cloudflare_record
 * @param {string} resource
 * @returns {string} the full host name of a cloudflare_record
 */
function getFullHostName(resource) {
    var subdomain = getCloudFlareRecordValue(resource, 'name');
    var domain = getCloudFlareRecordValue(resource, 'domain');
    
    if (subdomain && domain) {
        return subdomain + '.' + domain;
    } else {
        return null;
    }
}

/**
 * Returns true if the resource is a cloudflare_record of SPF type
 * @param {string} resource
 * @returns {boolean} whether this is an SPF cloudflare_record
 */
function isSpfRecord(resource) {
    var value = getCloudFlareRecordValue(resource, 'value') || '';
    return value.startsWith('v=spf1');
}

/**
 * Returns a set of all unique hostnames in the resources given
 * @param {string[]} resources the resources to look in
 * @returns {Set} a set of hostnames in `resources`
 */
function getUniqueHostnames(resources) {
    var results = new Set();

    resources.forEach(resource => {
        results.add(getFullHostName(resource));
    });
    return results;
}

/**
 * Returns every hostname that doesn't have an SPF record defined with an A or MX record defined
 * @param {string} targetDir the directory to recursively search for .tf files
 * @returns {string[]} a list of all hostnames defined in the `targetDir` with an A or MX record 
 *                     without a matching SPF record
 */
function getHostnamesWithoutSpf(targetDir) {
    var tfFiles = getTfFiles(targetDir);

    var aOrMxHostnames = new Set();
    var spfHostnames = new Set();

    tfFiles.forEach(file => {
        var fileContents = fs.readFileSync(file);
        
        var aOrMxResources = getCloudFlareResourcesWithType(fileContents, 'A|MX');
        aOrMxHostnames = utils.union(aOrMxHostnames, getUniqueHostnames(aOrMxResources));

        var txtResources = getCloudFlareResourcesWithType(fileContents, 'TXT');
        var spfResources = txtResources.filter(resource => isSpfRecord(resource));
        spfHostnames = utils.union(spfHostnames, getUniqueHostnames(spfResources));
    });

    return [...aOrMxHostnames].filter(hostname => !spfHostnames.has(hostname));
}

module.exports = {
    getTfFiles: getTfFiles,
    getCloudFlareResourcesWithType: getCloudFlareResourcesWithType,
    getCloudFlareRecordValue: getCloudFlareRecordValue,
    getFullHostName: getFullHostName,
    ifSpfRecord: isSpfRecord,
    getUniqueHostnames: getUniqueHostnames,
    getHostnamesWithoutSpf: getHostnamesWithoutSpf
}
