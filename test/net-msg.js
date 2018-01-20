
var Netmsg = require('..');
var Plan = require('./plan.js');
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

function mountRoutes(router) {
  // Without callback
  router.on('ping', function(data) {
    emitter.emit('ping', data);
  });

  // With callback
  router.on('getInfo', function(data, cb) {
    return cb(null, data);
  });
}

describe('NetMsg', function() {
  this.timeout(6000);
  var p1, p2, p3;

  after(function() {
    p1.stop();
    p2.stop();
  });

  it('should instanciate first peer', function(done) {
    p1 = new Netmsg({
      namespace : 'test',
      password : '123456',
      identity : {
        name : 'dashboard1'
      }
    });

    p1.start();

    p1.router('ping', function(data) {
      emitter.emit('ping', data);
    });

    p1.router('getInfo', function(data, reply) {
      return reply(null, data);
    });

    p1.once('ready', done);
  });

  it('should instanciate second peer and detect', function(done) {
    p2 = new Netmsg({
      namespace : 'test',
      password : '123456',
      identity : {
        name : 'dashboard2'
      },
      routes: mountRoutes
    });

    p2.start();

    p2.once('peer:connected', function() {
      done();
    });
  });

  it('should instanciate a unauthorized peer and not be accepted by others', function(done) {
    p3 = new Netmsg({
      namespace : 'test',
      password : 'WRONG-PASSWORD',
      identity : {
        name : 'dashboard3'
      },
      routes: mountRoutes
    });

    p3.start();

    p1.once('rejected', function() {
      p3.stop();
      done();
    });
  });


  it('should p3 now get authorized', function(done) {
    var plan = new Plan(3, done);

    p3 = new Netmsg({
      namespace : 'test',
      password : '123456',
      identity : {
        name : 'dashboard3'
      },
      routes: mountRoutes
    });

    p1.once('peer:connected', function(data) {
      assert.equal(data.identity.name, 'dashboard3');
      plan.ok(true);
    });

    p2.once('peer:connected', function(data) {
      assert.equal(data.identity.name, 'dashboard3');
      plan.ok(true);
    });

    p3.once('peer:connected', function() {
      plan.ok(true);
    });

    p3.start();
  });


  it('should p1 broadcast to p2 and p3', function(done) {
    var plan = new Plan(2, done);

    p1.socket_pool.broadcast('ping');

    // hack to verify that peers received a message
    emitter.on('ping', function(data) {
      plan.ok(true);
    });
  });

  it('should p1 broadcast to p2 and p3', function(done) {
    var plan = new Plan(2, done);

    p2.socket_pool.broadcast('getInfo', { data : true }, function(data) {
      plan.ok(true);
    });
  });

});
