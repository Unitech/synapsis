

var Synapsis = require('..');
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

  // With callback
  router.on('getInfoNoParam', function(cb) {
    return cb(null, {success:true});
  });
}


describe('Stop Start', function() {
  this.timeout(6000);
  var p1, p2, p3;

  after(function() {
    p1.stop();
    p2.stop();
  });

  it('should instanciate first peer', function(done) {
    p1 = new Synapsis({
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

    p1.router('getInfoNoParam', function(reply) {
      return reply(null, {success:true});
    });

    p1.once('ready', done);
  });

  it('should instanciate second peer and detect', function(done) {
    p2 = new Synapsis({
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

  it('should stop then start', function(done) {
    p2.stop(function() {
      p2.start();
      done()
    })

  });


});
