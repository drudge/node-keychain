/*!
 * node-keychain
 * Copyright(c) 2012 Nicholas Penree <nick@penree.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var spawn = require('child_process').spawn;
var binding = require('../build/Release/windows.node');

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
	return true;
}

/**
 * Retreive a password from the keychain.
 *
 * @param {Object} opts Object containing `account` and `service`
 * @param {Function} fn Callback
 * @api public
 */

KeychainAccess.prototype.getPassword = function(opts, fn) {
  opts = opts || {};
  var err;

  if (!opts.account) {
    err = new Error('An account is required');
    fn(err, null);
    return;
  }

  if (!opts.service) {
    err = new Error('A service is required');
    fn(err, null);
    return;
  }

  var password=binding.get(opts.service);
  if (password == undefined) {
      err = new Error('Could not find password');
      fn(err, null);	
  } else {
	fn(null, password)
  }
  
};

/**
 * Set/update a password in the keychain.
 *
 * @param {Object} opts Object containing `account`, `service`, and `password`
 * @param {Function} fn Callback
 * @api public
 */

KeychainAccess.prototype.setPassword = function(opts, fn) {
  opts = opts || {};
  var err;

  if (!opts.account) {
    err = new Error('An account is required');
    fn(err, null);
    return;
  }

  if (!opts.service) {
    err = new Error('A service is required');
    fn(err, null);
    return;
  }

  if (!opts.password) {
    err = new Error('A password is required');
    fn(err, null);
    return;
  }

  var password=binding.add(opts.service, opts.account, opts.password);
  fn(null);
};

/**
* Delete a password from the keychain.
*
* @param {Object} opts Object containing `account`, `service`, and `password`
* @param {Function} fn Callback
* @api public
*/

KeychainAccess.prototype.deletePassword = function(opts, fn) {

  opts = opts || {};
  var err;

  if (!opts.account) {
    err = new Error('An account is required');
    fn(err, null);
    return;
  }

  if (!opts.service) {
    err = new Error('A service is required');
    fn(err, null);
    return;
  }

  var password = binding.get(opts.service);

  if (binding.rem(opts.service)) {
	fn(null, password)	
  } else {
	err = new Error('Could not find password');
    fn(err);
  }
  
};

/**
 * Expose new Keychain Access
 */

module.exports = new KeychainAccess();
