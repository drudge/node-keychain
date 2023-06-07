var keychain = require('../');
var chai = require('chai');

chai.should();

describe('KeychainAccess', function(){
  var testService = 'KeychainAccess#test#' + Date.now();
  var testInternetService = 'KeychainAccess' + Date.now() + '.com';

  var asciiPW = "test";
  var mixedPW = "∆elta";
  var unicodePW = "∆˚ˆ©ƒ®∂çµ˚¬˙ƒ®†¥";
  var asciiComplexPW = "password: 0x4e6573746564";
  var keychainName = "test.keychain";

  it('should be running on a mac', function(){
    require('os').platform().should.equal('darwin');
  })

  it('should have access to ' + keychain.executablePath, function(){
    require('fs').existsSync(keychain.executablePath).should.equal(true);
  })

  describe('.setPassword(opts, fn)', function(){

    describe('when no account is given', function(){
      it('should return an error', function(done){
        keychain.setPassword({ password: 'baz', service: testService }, function(err) {
          if (!err) throw new Error();
          done();
        });
      })
    });

    describe('when no service is given', function(){
      it('should return an error', function(done){
        keychain.setPassword({ account: 'foo', password: 'baz' }, function(err) {
          if (!err) throw new Error();
          done();
        });
      })
    });

    describe('when no password is given', function(){
      it('should return an error', function(done){
        keychain.setPassword({ account: 'foo', service: testService }, function(err) {
          if (!err) throw new Error();
          done();
        });
      })
    });

    describe('when sent { account: "asciiAccount", password: "' + asciiPW + '", service: "' + testService + '" }', function(){
      it('should return "' + asciiPW, function(done){
        keychain.setPassword({ account: "asciiAccount", password: asciiPW, service: testService }, function(err, pass) {
          if (err) throw err;
          pass.should.equal(asciiPW);
          done();
        });
      });
    });

    describe('when sent { account: "asciiAccount", password: "' + asciiPW + '", service: "' + testInternetService + '", type:"internet" }', function(){
      it('should return ' + asciiPW, function(done){
        keychain.setPassword({ account: "asciiAccount", password: asciiPW, service: testInternetService, type:"internet" }, function(err, pass) {
          if (err) throw err;
          pass.should.equal(asciiPW);
          done();
        });
      });
    });

    describe('when sent { account: "unicodeAccount", password: "' + unicodePW + '", service: "' + testService + '" }', function(){
      it('should return "' + unicodePW, function(done){
        keychain.setPassword({ account: "unicodeAccount", password: unicodePW, service: testService }, function(err, pass) {
          if (err) throw err;
          pass.should.equal(unicodePW);
          done();
        });
      });
    });

    describe('when sent { account: "complexAccount", password: "' + asciiComplexPW + '", service: "' + testService + '" }', function(){
      it('should return "' + asciiComplexPW, function(done){
        keychain.setPassword({ account: "complexAccount", password: asciiComplexPW, service: testService }, function(err, pass) {
          if (err) throw err;
          pass.should.equal(asciiComplexPW);
          done();
        });
      });
    });

    describe('when sent { account: "mixedAccount", password: "' + mixedPW + '", service: "' + testService + '" }', function(){
      it('should return "' + mixedPW, function(done){
        keychain.setPassword({ account: "mixedAccount", password: mixedPW, service: testService }, function(err, pass) {
          if (err) throw err;
          pass.should.equal(mixedPW);
          done();
        });
      });
    });
  })

  describe('.getPassword(opts, fn)', function(){

    describe('when no account is given', function(){
      it('should return an error', function(done){
        keychain.getPassword({ password: 'baz', service: testService }, function(err) {
          err.should.be.instanceOf(Error).and.have.property('message', 'An account is required');
          done();
        });
      });
    });

    describe('when no service is given', function(){
      it('should return an error', function(done){
        keychain.getPassword({ account: 'foo', password: 'baz' }, function(err) {
          err.should.be.instanceOf(Error).and.have.property('message', 'A service is required');
          done();
        });
      });
    });

    describe('when sent { account: "asciiAccount", service: "' + testService +'" }', function(){
      it('should return "test"', function(done){
        keychain.getPassword({ account: "asciiAccount", service: testService }, function(err, pass) {
          if (err) throw err;

          pass.should.equal(asciiPW);
          done();
        });
      });
    });

    describe('when sent { account: "asciiAccount", service: "' + testService + '#NOTEXIST' +'" }', function(){
      it('should return an error', function(done){
        keychain.getPassword({ account: "asciiAccount", service: testService + '#NOTEXIST' }, function(err, pass) {
          err.should.be.instanceOf(Error).and.have.property('message', 'Could not find password');
          err.should.be.instanceOf(keychain.constructor.errors.PasswordNotFoundError).and.have.property('code', 'PasswordNotFound');
          done();
        });
      });
    });

    describe('when sent { account: "asciiAccount", service: "' + testInternetService + '", type:"internet" }', function(){
      it('should return ' + asciiPW, function(done){
        keychain.getPassword({ account: "asciiAccount", service: testInternetService, type: "internet" }, function(err, pass) {
          if (err) throw err;

          pass.should.equal(asciiPW);
          done();
        });
      });
    });

    describe('when sent { account: "asciiAccount", service: "' + testInternetService + '#NOTEXIST", type:"internet" }', function(){
      it('should return an error', function(done){
        keychain.getPassword({ account: "asciiAccount", service: testInternetService + '#NOTEXIST', type: "internet" }, function(err, pass) {
          err.should.be.instanceOf(Error).and.have.property('message', 'Could not find password');
          done();
        });
      });
    });

    describe('when sent { account: "unicodeAccount", service: "' + testService +'" }', function(){
      it('should return ' + unicodePW, function(done){
        keychain.getPassword({ account: "unicodeAccount", service: testService }, function(err, pass) {
          if (err) throw err;

          pass.should.equal(unicodePW);
          done();
        });
      });
    });

    describe('when sent { account: "complexAccount", service: "' + testService +'" }', function(){
      it('should return ' + asciiComplexPW, function(done){
        keychain.getPassword({ account: "complexAccount", service: testService }, function(err, pass) {
          if (err) throw err;

          pass.should.equal(asciiComplexPW);
          done();
        });
      });
    });

    describe('when sent { account: "mixedAccount", service: "' + testService +'" }', function(){
      it('should return ' + mixedPW, function(done){
        keychain.getPassword({ account: "mixedAccount", service: testService }, function(err, pass) {
          if (err) throw err;

          pass.should.equal(mixedPW);
          done();
        });
      });
    });
  });

  describe('.deletePassword(opts, fn)', function(){

    describe('when no account is given', function(){
      it('should return an error', function(done){
        keychain.deletePassword({ password: 'baz', service: testService }, function(err) {
          if (err) {
            done();
            return;
          }
          done(new Error());
        });
      })
    });

    describe('when no service is given', function(){
      it('should return an error', function(done){
        keychain.deletePassword({ account: 'foo', password: 'baz' }, function(err) {
          if (!err) throw new Error();
          done();
        });
      });
    });

    describe('when sent { account: "asciiAccount", service: "' + testService + '" }', function(){
      it('should return a password of "test"', function(done){
        keychain.deletePassword({ account: "asciiAccount", service: testService }, function(err) {
          if (err) throw err;
          done();
        });
      });
    });

    describe('when sent the same options again', function(){
      it('should return an error', function(done){
        keychain.deletePassword({ account: "asciiAccount", service: testService }, function(err) {
          if (!err) throw new Error();
          done();
        });
      });
    });

    describe('when sent { account: "asciiAccount", service: "' + testInternetService + '", type:"internet" }', function(){
      it('should return a password of "test"', function(done){
        keychain.deletePassword({ account: "asciiAccount", service: testInternetService, type: "internet" }, function(err) {
          if (err) throw err;
          done();
        });
      });
    });

    describe('when sent the same options again', function(){
      it('should return an error', function(done){
        keychain.deletePassword({ account: "asciiAccount", service: testInternetService, type: "internet" }, function(err) {
          if (!err) throw new Error();
          done();
        });
      });
    });

  });

  describe('.createKeychain(opts, fn)', function(){
    describe('when no keychain name is given', function(){
      it('should return an error', function(done){
        keychain.createKeychain({ password: 'baz' }, function(err) {
          if (err) {
            done();
            return;
          }
          done(new Error());
        });
      })
    });

    describe('when no password is given', function(){
      it('should return an error', function(done){
        keychain.createKeychain({ keychainName: keychainName }, function(err) {
          if (err) {
            done();
            return;
          }
          done(new Error());
        });
      })
    });

    describe('when sent { keychainName: "' + keychainName + '", password: "' + asciiPW +'" }', function(){
      it('should return ' + keychainName, function(done){
        keychain.createKeychain({ keychainName: keychainName, password: asciiPW }, function(err, name) {
          if (err) throw err;

          name.should.equal(keychainName);
          done();
        });
      });
    });

    describe('when sent the same options again', function(){
      it('should return an error', function(done){
        keychain.createKeychain({ keychainName: keychainName, password: asciiPW }, function(err) {
          if (!err) throw new Error();
          done();
        });
      });
    });

  });

  describe('.setDefaultKeychain(opts, fn)', function(){

    describe('when no keychain name is given', function(){
      it('should return an error', function(done){
        keychain.setDefaultKeychain({ password: 'baz' }, function(err) {
          if (err) {
            done();
            return;
          }
          done(new Error());
        });
      })
    });

    describe('when sent { keychainName: "' + keychainName + '"}', function(){
      it('should return ' + keychainName, function(done){
        keychain.setDefaultKeychain({ keychainName: keychainName }, function(err, name) {
          if (err) throw err;

          name.should.equal(keychainName);
          done();
        });
      });
    });

    describe('when sent { keychainName: "missing"}', function(){
      it('should return an error', function(done){
        keychain.setDefaultKeychain({ keychainName: 'missing' }, function(err) {
          if (err) {
            done();
            return;
          }
          done(new Error());
        });
      })
    });

    describe('when sent { keychainName: "login.keychain"}', function(){
      it('should return ' + keychainName, function(done){
        keychain.setDefaultKeychain({ keychainName: "login.keychain" }, function(err, name) {
          if (err) throw err;

          name.should.equal("login.keychain");
          done();
        });
      });
    });

  });

  describe('.deleteKeychain(opts, fn)', function(){

    describe('when no keychain name is given', function(){
      it('should return an error', function(done){
        keychain.deleteKeychain({ password: 'baz' }, function(err) {
          if (err) {
            done();
            return;
          }
          done(new Error());
        });
      })
    });

    describe('when sent { keychainName: "' + keychainName + '"}', function(){
      it('should return ' + keychainName, function(done){
        keychain.deleteKeychain({ keychainName: keychainName }, function(err, name) {
          if (err) throw err;

          name.should.equal(keychainName);
          done();
        });
      });
    });

    describe('when sent the same options again', function(){
      it('should return an error', function(done){
        keychain.deletePassword({ account: keychainName, password: asciiPW }, function(err) {
          if (!err) throw new Error();
          done();
        });
      });
    });
  });

});
