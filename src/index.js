const config = require('./config.js');
const spfValidation = require('./spfValidation');

var missingSpfHostnames = spfValidation.getHostnamesWithoutSpf(config.dir);

missingSpfHostnames.forEach(hostname => {
    console.log(' - ' + hostname);
});

