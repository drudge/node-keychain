#  Basic Keychain Access on Mac computers running Node.js 
[![Build Status](https://travis-ci.org/drudge/node-keychain.svg)](https://travis-ci.org/drudge/node-keychain)

  This module adds methods for basic Keychain access in Node.js by way of the `security` command-line tool.

## Requirements

 * Mac OS X 10.6+

## Installation

    npm install keychain

## Examples

### Generic Password Example

```javascript
var keychain = require('keychain');

keychain.setPassword({ account: 'foo', service: 'FooBar', password: 'baz' }, function(err) {
  keychain.getPassword({ account: 'foo', service: 'FooBar' }, function(err, pass) {
    console.log('Password is', pass);
    // Prints: Password is baz
  });
});
```

### Internet Password Example
```javascript
var keychain = require('keychain');

keychain.setPassword({ account: 'foo', service: 'FooBar.com', type: 'internet', password: 'baz' }, function(err) {
  keychain.getPassword({ account: 'foo', service: 'FooBar.com', type: 'internet' }, function(err, pass) {
    console.log('Password is', pass);
    // Prints: Password is baz
  });
});
```

## Usage

The available 
```js
keychain.setPassword(options[, callback]);
keychain.getPassword(options, callback);
keychain.deletePassword(options[, callback]);
```

### Options

Available params you can pass to the options object:

| Param | Description |
| ----- | ----------- |
| `account` | Specify account name (required) |
| `service` | Specify service name (required) |
| `password` | Specify password to be added (required for `setPassword`) |
| `type` | The type of password to get or save. Supported values are `generic` and `internet`. See [docs](https://developer.apple.com/legacy/library/documentation/Darwin/Reference/ManPages/man1/security.1.html). Default: `generic` |

## Contributors

The following are the major contributors of `node-keychain` (in no specific order).

  * Nicholas Penree ([drudge](https://github.com/drudge))
  * Tejesh Mehta ([tjmehta](https://github.com/tjmehta))
  * Benjamin Hutchins ([benhutchins](https://github.com/benhutchins))

## License

(The MIT License)

Copyright (c) 2013 Nicholas Penree &lt;nick@penree.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
