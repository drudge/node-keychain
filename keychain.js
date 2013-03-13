/*!
 * node-keychain
 * Copyright(c) 2012 Nicholas Penree <nick@penree.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var spawn = require('child_process').spawn;
var os = require('os');

var ost = os.type().toLowerCase();
var OSObj = null;
if (ost.indexOf('lin') === 0) {
    OSObj = require('./platforms/linux.js');
} else if (ost.indexOf('darwin') === 0) {
    OSObj = require('./platforms/darwin.js');
} else if (ost.indexOf('win') === 0) {
    OSObj = require('./platforms/windows.js');
} else {
    OSObj = require('./platforms/unsupported.js');
}

module.exports = OSObj;
