const octokit = require('./GithubConnection').create();

async function addIssueComment(owner, repo, issueNumber, body) {
    const result = await octokit.issues.createComment({
        owner: owner, 
        repo: repo, 
        number: issueNumber, 
        body: body
    });
    return result.status ==  201;
}

module.exports = {
    addIssueComment: addIssueComment
}
