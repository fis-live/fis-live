const ghpages = require('gh-pages');


const GIT_REMOTE_NAME = 'origin';
const COMMIT_MESSAGE = 'Publish v' + process.env.npm_package_version;

console.log('Starting deployment to GitHub.');

const options = {
    remote: GIT_REMOTE_NAME,
    message: COMMIT_MESSAGE
};

