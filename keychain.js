/*!
 * node-keychain
 * Copyright(c) 2012 Nicholas Penree <nick@penree.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var spawn = require('child_process').spawn;
var noop = function () {};

/**
 * Basic Keychain Access on Mac computers running Node.js
 *
 * @class KeychainAccess
 * @api public
 */

function KeychainAccess() {
  this.executablePath = '/usr/bin/security';
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
  opts.type = (opts.type || 'generic').toLowerCase();
  fn = fn || noop;
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

  var security = spawn(this.executablePath, [ 'find-'+opts.type+'-password', '-a', opts.account, '-s', opts.service, '-g' ]);
  var keychain = '';
  var password = '';

  security.stdout.on('data', function(d) {
    keychain += d.toString();
  });

  // For better or worse, the last line (containing the actual password) is actually written to stderr instead of stdout.
  // Reference: http://blog.macromates.com/2006/keychain-access-from-shell/
  security.stderr.on('data', function(d) {
    password += d.toString();
  });

  security.on('exit', function(code, signal) {
    if (code !== 0) {
      err = new Error('Could not find password');
      fn(err, null);
      return;
    }

    if (/password/.test(password)) {
      password = password.match(/"(.*)\"/, '')[1];
      fn(null, password);
    } else {
      err = new Error('Could not find password');
      fn(err, null);
    }
  });
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
  opts.type = (opts.type || 'generic').toLowerCase();
  fn = fn || noop;
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

  var security = spawn(this.executablePath, [ 'add-'+opts.type+'-password', '-a', opts.account, '-s', opts.service, '-w', opts.password ]);
  var self = this;

  security.on('exit', function(code, signal) {
    if (code !== 0) {
      var msg = 'Security returned a non-successful error code: ' + code;

      if (code == 45) {
        self.deletePassword(opts, function(err) {
          if (err) {
            console.log(err);
            fn(err);
            return;
          }

          self.setPassword(opts, fn);
          return;
        });
      } else {
       err = new Error(msg);
        fn(err);
        return;
      }
    } else {
     fn(null);
    }
  });
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
  opts.type = (opts.type || 'generic').toLowerCase();
  fn = fn || noop;
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

  var security = spawn(this.executablePath, [ 'delete-'+opts.type+'-password', '-a', opts.account, '-s', opts.service ]);

  security.on('exit', function(code, signal) {
    if (code !== 0) {
      err = new Error('Could not find password');
      fn(err);
      return;
    }
    fn(null);
  });
};

/**
 * Expose new Keychain Access
 */

module.exports = new KeychainAccess();
