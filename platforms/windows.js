/*!
 * node-keychain
 * Copyright(c) 2012 Nicholas Penree <nick@penree.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var spawn = require('child_process').spawn;

/**
 * Basic Keychain Access on Mac computers running Node.js
 *
 * @class KeychainAccess
 * @api public
 */

function KeychainAccess() {
 
}


/**
 * Returns if this module is supported by the platform
 *
 * @api public
 */

KeychainAccess.prototype.isSupported = function() {
	return false;
}

/**
 * Expose new Keychain Access
 */

module.exports = new KeychainAccess();
