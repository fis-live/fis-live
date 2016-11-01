const ghpages = require('gh-pages');
const helpers = require('./helpers');


const GIT_REMOTE_NAME = 'origin';
const COMMIT_MESSAGE = 'Publish v' + process.env.npm_package_version;

console.log('Starting deployment to GitHub.');

const options = {
    remote: GIT_REMOTE_NAME,
    message: COMMIT_MESSAGE
};

ghpages.publish(helpers.root('dist'), options, function(err) {
    if (err) {
        console.log('GitHub deployment done. STATUS: ERROR.');
        throw err;
    } else {
        console.log('GitHub deployment done. STATUS: SUCCESS.');
    }
});