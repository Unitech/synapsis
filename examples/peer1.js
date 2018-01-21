
var Synapsis = require('..');

var synapse = new Synapsis({
  namespace: 'namespace-example-test',
  password: '123456',
  identity: {
    name : require('os').hostname()
  }
});

synapse.start();

synapse.on('peer:connected', function(identity, socket) {
  console.log('New peer detected', identity);
});

synapse.on('peer:disconnected', function(identity) {
  console.error(identity);
});

synapse.on('error', function(err) {
  console.error(err);
});

synapse.on('ready', function() {
  console.log('Peer ready');
});

synapse.router('command:restart', () => {
  console.log('Got Restart');
});

synapse.router('command:sync_db', (new_db, reply) => {
  reply(null, 'DB Synced');
});

setTimeout(function() {
  synapse.broadcast('command:restart');

  synapse.broadcast('command:sync_db', { my : { db : true } }, function(err, response) {
    console.log(err, response);
  });
}, 2000);
