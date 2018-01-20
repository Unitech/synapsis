
const EventEmitter = require('events').EventEmitter;
const Swarm  = require('discovery-swarm');
const SocketPool = require('./socket-pool.js');
const os = require('os');

class NetMsg extends EventEmitter {
  constructor(opts) {
    super();

    this.namespace = opts.namespace;
    this.password = opts.password;
    this.identity = opts.identity;
    this.routes = opts.routes;

    this._routes_v2 = {};

    this.socket_pool = new SocketPool();

    this.command_swarm = Swarm({
      dns : {
        server : [
          'discovery1.publicbits.org',
          'discovery2.publicbits.org'
        ],
        interval : 1000
      },
      dht : false
    });
  }

  router(event_name, cb) {
    this._routes_v2[event_name] = cb;
  }

  bindRouter(router) {
    Object.keys(this._routes_v2).forEach((route_name) => {
      router.on(route_name, this._routes_v2[route_name]);
    });
  }

  stop() {
    this.command_swarm.close();
    this.socket_pool.close();
  }

  start() {
    this.command_swarm.listen(0);
    this.command_swarm.join(this.namespace.toString('hex'));

    /**
     * Action when a new socket connection has been established
     */
    this.command_swarm.on('connection', (socket) => {
      this.emit('new:peer', socket);

      /**
       * Exchange ciphering keys, authenticate and identify Peer
       */
      this.socket_pool
        .add({
          socket         : socket,
          local_identity : this.identity,
          password       : this.password
        })
        .then(router => {
          this.emit('peer:connected', router);

          if (this.routes)
            this.routes(router);
          this.bindRouter(router);

        })
        .catch(e => {
          this.emit('rejected', e);
          socket.destroy();
        });
    });

    return new Promise((resolve, reject) => {
      this.command_swarm.on('error', (e) => {
        this.emit('error', e);
        reject(e);
      });

      this.command_swarm.on('listening', () => {
        let port = this.command_swarm._tcp.address().port;
        this.emit('ready');
        resolve();
      });
    });
  }

  mountActions(router) {
    router.on('ping', (cb) => {
      console.log('Received a PING');
      //return cb(null, 'pong');
    });
  };

}

module.exports = NetMsg;
