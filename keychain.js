/*!
 * node-keychain
 * Copyright(c) 2015 Nicholas Penree <nick@penree.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var spawn = require('child_process').spawn;
var noop = function () {};

// Polyfill Buffer.from for Node < 4 that didn't have a #from method
if (!Buffer.from) {
  Buffer.from = function (data, encoding, len) {
    return new Buffer(data, encoding, len);
  };
}
// Between Node >=4 to < 4.5 Buffer.from was inherited from Uint8Array
// And behaved differently, it was backported in 4.5.
if (Buffer.from === Uint8Array.from) {
  throw new Error('Node >= 4.0.0 to < 4.5.0 are unsupported')
}

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

  if (process.platform !== 'darwin') {
    err = new Error('Expected darwin platform, got ' + process.platform);
    fn(err, null);
    return;
  }

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

  security.on('error', function(err) {
    err.message = 'Keychain failed to start child process: ' + err.message;
    fn(err, null);
    return;
  });

  security.stdout.on('data', function(d) {
    keychain += d.toString();
  });

  // For better or worse, the last line (containing the actual password) is actually written to stderr instead of stdout.
  // Reference: http://blog.macromates.com/2006/keychain-access-from-shell/
  security.stderr.on('data', function(d) {
    password += d.toString();
  });

  security.on('close', function(code, signal) {
    if (code !== 0) {
      err = new Error('Could not find password');
      fn(err, null);
      return;
    }

    if (/password/.test(password)) {
      // When keychain escapes a char into octal it also includes a hex
      // encoded version.
      //
      // e.g. password 'passWith\' becomes:
      // password: 0x70617373576974685C  "passWith\134"
      //
      // And if the password does not contain ASCII it leaves out the quoted
      // version altogether:
      //
      // e.g. password '∆˚ˆ©ƒ®∂çµ˚¬˙ƒ®†¥' becomes:
      // password: 0xE28886CB9ACB86C2A9C692C2AEE28882C3A7C2B5CB9AC2ACCB99C692C2AEE280A0C2A5
      if (/0x([0-9a-fA-F]+)/.test(password)) {
        var hexPassword = password.match(/0x([0-9a-fA-F]+)/, '')[1];
        fn(null, Buffer.from(hexPassword, 'hex').toString());
      }
      // Otherwise the password will be in quotes:
      // password: "passWithoutSlash"
      else {
        fn(null, password.match(/"(.*)\"/, '')[1]);
      }
    }
    else {
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

  if (process.platform !== 'darwin') {
    err = new Error('Expected darwin platform, got ' + process.platform);
    fn(err, null);
    return;
  }

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

  security.on('error', function(err) {
    err.message = 'Keychain failed to start child process: ' + err.message;
    fn(err, null);
    return;
  });

  security.on('close', function(code, signal) {
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
     fn(null, opts.password);
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

  if (process.platform !== 'darwin') {
    err = new Error('Expected darwin platform, got ' + process.platform);
    fn(err, null);
    return;
  }

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

  security.on('error', function(err) {
    err.message = 'Keychain failed to start child process: ' + err.message;
    fn(err, null);
    return;
  });

  security.on('close', function(code, signal) {
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
