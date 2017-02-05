const pubsub = require('redis-pubsub');
const EventEmitter = require('events');

class PubSubService extends EventEmitter {

    constructor(channel = 'main') {
        super();
        this.client = pubsub.createChannel(6379, 'localhost', channel);
        this.client.on('connect', () => {
            this.client.on('message', ({channel, data}) => {
                this.emit(channel, data);
            })
        })
    }

    broadcast(channel, data) {
        this.client.send({channel, data});
    }
}

module.exports = PubSubService;