
# Synapsis

Inter connect local machines together with a Express like socket router.
Data transfer is cipphered with Diffie Hellman algorithm (dynamic public / private key exchange between peers based on a shared password).

![http://inkican.com/wp-content/uploads/2016/11/67300035-mesh-wallpapers-1-1024x576.jpg](http://inkican.com/wp-content/uploads/2016/11/67300035-mesh-wallpapers-1-1024x576.jpg)

## Usage

### Instanciate Peer

Instanciate new peer:

```javascript
var Synapsis = require('synapsis');

var synapse = new Synapsis({
  namespace: 'namespace-name',
  password: 'long-password-16-random-caracters-recommended',
  // Identity will be shared to all peers
  identity: {
    name : require('os').hostname()
  }
});

// Now start the peer
synapse.start();
```

### Expose Socket Routes

Now expose socket routes that can be triggered by other peers:

```javascript
synapse.router('command:restart', () => {
  console.log('Got Restart');
});

synapse.router('command:sync_db', (new_db, reply) => {
  fs.writeFile('current_db.json', new_db, (err) => {
     if (err)
       return reply(err);
     reply(null, 'DB Synced');
  });
});
```

### Send/Broadcast Actions to Peers

To send actions to other peers:

```javascript
// Broadcast a message to all nodes (w/o current) and do not wait for response
synapse.broadcast('command:restart');

// Broadcast a message + data to all nodes (w/o current) and do not wait for response
synapse.broadcast('command:restart', { some : 'data' });

// Broadcast a message to all nodes (w/o current) and receive messages from each (RPC like)
synapse.broadcast('command:sync_db', { my : { db : true } }, function(err, response, identity) {
  console.log(`Err= ${err} Response = ${response} from = ${identity.name}`);
});
```

Or send to a specific peer:

```javascript
var peer = synapse.getPeers()[0];

synapse.send(peer.id, 'command:restart');
```

### Event Handling

```javascript
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
  console.log('Peer Ready');
});
```

## Test

Checkout test/ folder for more examples/

## License

MIT
