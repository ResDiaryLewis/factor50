const config = require('./config');
const OctoKitApi = require('@octokit/rest');

module.exports = {
    create: function() {
        var octokit = new OctoKitApi({
            headers: {
                'user-agent': config.github.userAgent
            }
        });

        octokit.authenticate({
            type: 'token',
            token: config.github.token
        });

        return octokit;
    }
}
