const ghpages = require('gh-pages');
const helpers = require('./helpers');


const GIT_REMOTE_NAME = 'pages';
const COMMIT_MESSAGE = 'Update';

console.log('Starting deployment to GitHub.');

const options = {
    remote: GIT_REMOTE_NAME,
    repo: 'https://github.com/fis-live/fis-live.github.io.git',
    branch: 'master',
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