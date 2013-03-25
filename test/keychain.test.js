var keychain = require('../');

describe('KeychainAccess', function(){
  var testService = 'KeychainAccess#test#' + Date.now();
  var testInternetService = 'KeychainAccess' + Date.now() + '.com';

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

    describe('when sent { account: "drudge", password: "test", service: "' + testService + '" }', function(){
      it('should return "test"', function(done){
        keychain.setPassword({ account: "drudge", password: "test", service: testService }, function(err) {
          if (err) throw err;
          done();
        });
      });
    });

    describe('when sent { account: "drudge", password: "test", service: "' + testService + '" }', function(){
      it('should return "test"', function(done){
        keychain.setPassword({ account: "drudge", password: "test", service: testService }, function(err) {
          if (err) throw err;
          done();
        });
      });
    });

    describe('when sent { account: "drudge", password: "test", service: "' + testInternetService + '", type:"internet" }', function(){
      it('should return "test"', function(done){
        keychain.setPassword({ account: "drudge", password: "test", service: testInternetService, type:"internet" }, function(err) {
          if (err) throw err;
          done();
        });
      });
    });

    describe('when sent { account: "drudge", password: "test", service: "' + testInternetService + '", type:"internet" }', function(){
      it('should return "test"', function(done){
        keychain.setPassword({ account: "drudge", password: "test", service: testInternetService, type:"internet" }, function(err) {
          if (err) throw err;
          done();
        });
      });
    });
  })

  describe('.getPassword(opts, fn)', function(){

    describe('when no account is given', function(){
      it('should return an error', function(done){
        keychain.setPassword({ password: 'baz', service: testService }, function(err) {
          if (!err) throw new Error();
          done();
        });
      });
    });

    describe('when no service is given', function(){
      it('should return an error', function(done){
        keychain.setPassword({ account: 'foo', password: 'baz' }, function(err) {
          if (!err) throw new Error();
          done();
        });
      });
    });

    describe('when sent { account: "drudge", service: "' + testService +'" }', function(){
      it('should return "test"', function(done){
        keychain.getPassword({ account: "drudge", service: testService }, function(err, pass) {
          if (err) throw err;

          pass.should.equal("test");
          done();
        });
      });
    });

    describe('when sent { account: "drudge", service: "' + testService + '#NOTEXIST' +'" }', function(){
      it('should return an error', function(done){
        keychain.getPassword({ account: "drudge", service: testService + '#NOTEXIST' }, function(err, pass) {
          if (!err) throw new Error();
          done();
        });
      });
    });

    describe('when sent { account: "drudge", service: "' + testInternetService + '", type:"internet" }', function(){
      it('should return "test"', function(done){
        keychain.getPassword({ account: "drudge", service: testInternetService, type: "internet" }, function(err, pass) {
          if (err) throw err;

          pass.should.equal("test");
          done();
        });
      });
    });

    describe('when sent { account: "drudge", service: "' + testInternetService + '#NOTEXIST", type:"internet" }', function(){
      it('should return an error', function(done){
        keychain.getPassword({ account: "drudge", service: testInternetService + '#NOTEXIST', type: "internet" }, function(err, pass) {
          if (!err) throw new Error();
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

    describe('when sent { account: "drudge", service: "' + testService + '" }', function(){
      it('should return a password of "test"', function(done){
        keychain.deletePassword({ account: "drudge", service: testService }, function(err) {
          if (err) throw err;
          done();
        });
      });
    });

    describe('when sent the same options again', function(){
      it('should return an error', function(done){
        keychain.deletePassword({ account: "drudge", service: testService }, function(err) {
          if (!err) throw new Error();
          done();
        });
      });
    });

    describe('when sent { account: "drudge", service: "' + testInternetService + '", type:"internet" }', function(){
      it('should return a password of "test"', function(done){
        keychain.deletePassword({ account: "drudge", service: testInternetService, type: "internet" }, function(err) {
          if (err) throw err;
          done();
        });
      });
    });

    describe('when sent the same options again', function(){
      it('should return an error', function(done){
        keychain.deletePassword({ account: "drudge", service: testInternetService, type: "internet" }, function(err) {
          if (!err) throw new Error();
          done();
        });
      });
    });

  });

});