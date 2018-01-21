
# Synapsis

Inter connect local machines together with a Express like socket router.
Data transfer is cipphered with Diffie Hellman algorithm (dynamic public / private key exchange between peers based on a shared password).

## Usage

Instanciate new peer:

```javascript
var Synapsis = require('synapsis');

var synapse = new Synapsis({
  namespace: 'namespace-name',
  password: '123456',
  // Identity will be shared to all peers
  identity: {
    name : 'dashboard1',
    hostname : process.env.HOSTNAME
  }
});
```

Now expose actions that can be triggered by other peers:

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

To send actions to other peers:

```javascript
// Broadcast a message to all nodes (w/o current) and do not wait for response
synapse.broadcast('command:restart');

// Broadcast a message + data to all nodes (w/o current) and do not wait for response
synapse.broadcast('command:restart', { some : 'data' });

// Broadcast a message to all nodes (w/o current) and receive messages from each (RPC like)
synapse.broadcast('command:sync_db', { my : { db : true } }, function(err, response) {
  console.log(err, response);
});
```

Extra:

```javascript
// Events
synapse.on('peer:connected', function(socket) {
  console.log('New peer detected', socket.identity);
});

synapse.on('peer:disconnected', function(identity) {
  console.error(identity);
});

synapse.on('error', function(err) {
  console.error(err);
});

synapse.on('ready', function() {
  // Ready
});
```

## License

MIT
