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
  this.executablePath = '/usr/bin/python';
}


/**
 * Returns if this module is supported by the platform
 *
 * @api public
 */

KeychainAccess.prototype.isSupported = function() {
	var fs = require('fs');
	if (fs.existsSync != undefined) {
    	return fs.existsSync(this.executablePath);
	} else {
		return require('path').existsSync(this.executablePath);
	}
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

  var security = spawn(this.executablePath, [ __dirname+'/gkeyring.py', '-p', 'user='+opts.account+',key='+opts.service, '-1' ]);
  var keychain = '';
  var password = '';

  security.stdout.on('data', function(d) {
    password += d.toString();
  });

  // For better or worse, the last line (containing the actual password) is actually written to stderr instead of stdout.
  // Reference: http://blog.macromates.com/2006/keychain-access-from-shell/
  security.stderr.on('data', function(d) {
   password += d.toString();
  });

  security.on('exit', function(code, signal) {
	// console.log('password='+password+'');
    if (code !== 0) {
      err = new Error('Could not find password');
      fn(err, null);
      return;
    }

	fn(null, password);
  });
};

KeychainAccess.prototype.getID = function(opts, fn) {
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

  var security = spawn(this.executablePath, [ __dirname+'/gkeyring.py', '-p', 'user='+opts.account+',key='+opts.service, '--output=id' ]);
  var id = '';

  security.stdout.on('data', function(d) {
    id += d.toString();
  });

  // For better or worse, the last line (containing the actual password) is actually written to stderr instead of stdout.
  // Reference: http://blog.macromates.com/2006/keychain-access-from-shell/
  security.stderr.on('data', function(d) {

  });

  security.on('exit', function(code, signal) {
    if (code !== 0) {
      err = new Error('Could not find password');
      fn(err, null);
      return;
    }

	fn(null, id);
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

  var security = spawn(this.executablePath, [ __dirname+'/gkeyring.py', '--set', '-n', opts.service, '-p', 'user='+opts.account+',key='+opts.service, '-w', opts.password ]);
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

  var keychain = new KeychainAccess();
  var executablePath = this.executablePath;
  keychain.getID(opts, function(err, id) {
	// console.log('got id: '+id)
    var security = spawn(executablePath, [ __dirname+'/gkeyring.py', '--delete', '--id='+id ]);

    security.on('exit', function(code, signal) {
      if (code !== 0) {
        err = new Error('Could not find password');
        fn(err);
        return;
      }
      fn(null);
    });	
  });
};

/**
 * Expose new Keychain Access
 */

module.exports = new KeychainAccess();
