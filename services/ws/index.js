var pubsub = require('redis-pubsub');

// Subscribe to channel 'foobar' on a local server.
var channel = pubsub.createChannel(6379, 'localhost', 'foobar');
channel.on('connect', function() {
    channel.on('message', function(msg) {
        console.log(msg.greeting);
        channel.end();
    });
    channel.send({ greeting: 'Hello world!' });
});