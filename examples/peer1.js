
var Synapsis = require('..');

var synapse = new Synapsis({
  namespace: 'namespace-example-test',
  password: 'asda&43453i787sf;;;][23',
  identity: {
    name : require('os').hostname()
  }
});

synapse.start();

synapse.on('peer:connected', function(identity, socket) {
  console.log(`${new Date} New peer: ${identity.name}`);
});

synapse.on('peer:disconnected', function(identity) {
  console.log(`${new Date} Disconnected peer: ${identity.name}`);
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

  synapse.broadcast('command:sync_db', { my : { db : true } }, function(err, response, identity) {
    console.log(`Err= ${err} Response = ${response} from = ${identity.name}`);
  });
}, 2000);
