const path = require('path');
const fs = require('fs');

const APP_ROOT = path.join(__dirname, '..');
const DIST_ROOT = path.join(__dirname, '..', 'dist');

function copyToDist(source) {
    fs.copyFileSync(
        path.join(APP_ROOT, source),
        path.join(DIST_ROOT, source)
    );
}

// 复制必要文件到dist/
copyToDist('package.json');
copyToDist('README.md');
copyToDist('LICENSE');
