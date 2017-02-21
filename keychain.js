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
    err = new KeychainAccess.errors.UnsupportedPlatformError(null, process.platform);
    fn(err, null);
    return;
  }

  if (!opts.account) {
    err = new KeychainAccess.errors.NoAccountProvidedError();
    fn(err, null);
    return;
  }

  if (!opts.service) {
    err = new KeychainAccess.errors.NoServiceProvidedError();
    fn(err, null);
    return;
  }

  var security = spawn(this.executablePath, [ 'find-'+opts.type+'-password', '-a', opts.account, '-s', opts.service, '-g' ]);
  var keychain = '';
  var password = '';

  security.on('error', function(err) {
    err = new KeychainAccess.errors.ServiceFailureError(null, err.message);
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
      err = new KeychainAccess.errors.PasswordNotFoundError();
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
      err = new KeychainAccess.errors.PasswordNotFoundError();
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
    err = new KeychainAccess.errors.UnsupportedPlatformError(null, process.platform);
    fn(err, null);
    return;
  }

  if (!opts.account) {
    err = new KeychainAccess.errors.NoAccountProvidedError();
    fn(err, null);
    return;
  }

  if (!opts.service) {
    err = new KeychainAccess.errors.NoServiceProvidedError();
    fn(err, null);
    return;
  }

  if (!opts.password) {
    err = new KeychainAccess.errors.NoPasswordProvidedError();
    fn(err, null);
    return;
  }

  var security = spawn(this.executablePath, [ 'add-'+opts.type+'-password', '-a', opts.account, '-s', opts.service, '-w', opts.password ]);
  var self = this;

  security.on('error', function(err) {
    err = new KeychainAccess.errors.ServiceFailureError(null, err.message);
    fn(err, null);
    return;
  });

  security.on('close', function(code, signal) {
    if (code !== 0) {
      if (code == 45) {
        self.deletePassword(opts, function(err) {
          if (err) {
            fn(err);
            return;
          }

          self.setPassword(opts, fn);
          return;
        });
      } else {
        var msg = 'Security returned a non-successful error code: ' + code;
        err = new KeychainAccess.errors.ServiceFailureError(msg);
        err.exitCode = code;
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
    err = new KeychainAccess.errors.UnsupportedPlatformError(null, process.platform);
    fn(err, null);
    return;
  }

  if (!opts.account) {
    err = new KeychainAccess.errors.NoAccountProvidedError();
    fn(err, null);
    return;
  }

  if (!opts.service) {
    err = new KeychainAccess.errors.NoServiceProvidedError();
    fn(err, null);
    return;
  }

  var security = spawn(this.executablePath, [ 'delete-'+opts.type+'-password', '-a', opts.account, '-s', opts.service ]);

  security.on('error', function(err) {
    err = new KeychainAccess.errors.ServiceFailureError(null, err.message);
    fn(err, null);
    return;
  });

  security.on('close', function(code, signal) {
    if (code !== 0) {
      err = new KeychainAccess.errors.PasswordNotFoundError();
      fn(err);
      return;
    }
    fn(null);
  });
};

function errorClass(code, defaultMsg) {
  var errorType = code + 'Error';
  var ErrorClass = function (msg, append) {
    this.type = errorType;
    this.code = code;
    this.message = (msg || defaultMsg) + (append || '');
    this.stack = (new Error()).stack;
  };

  ErrorClass.prototype = Object.create(Error.prototype);
  ErrorClass.prototype.constructor = ErrorClass;
  KeychainAccess.errors[errorType] = ErrorClass
}

KeychainAccess.errors = {};
errorClass('UnsupportedPlatform', 'Expected darwin platform, got: ');
errorClass('NoAccountProvided', 'An account is required');
errorClass('NoServiceProvided', 'A service is required');
errorClass('NoPasswordProvided', 'A password is required');
errorClass('ServiceFailure', 'Keychain failed to start child process: ');
errorClass('PasswordNotFound', 'Could not find password');


/**
 * Expose new Keychain Access
 */

module.exports = new KeychainAccess();
