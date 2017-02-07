const PubSubService = require('../base');
const WebSocket = require('ws');
const auth = require('./auth');
const res = require('./../../messages/');

class WsPubSubInterface {
    constructor(port = 8085, channel = 'main') {
        this.wss = new WebSocket.Server({port});
        this.pubSub = new PubSubService(channel);

        this.connections = {};
        this.subscriptions = {};
        this.middleware = [];

        this.use(this.handleAuth);

        this.wss.on('connection', ws => {
            do {
                ws.id = Date.now();
            } while (this.connections[ws.id]);
            ws.on('close', () => this.connections[ws.id] = undefined);
            ws.on('message', message => {
                try {
                    const obj = JSON.parse(message);
                    const eventConsumed = !this.middleware.length && this.middleware.some(md => md(ws, obj));
                    if (!eventConsumed) this.handleMessage(ws, obj);
                } catch (e) {
                    ws.send(res.status('error', 'not a JSON'));
                }
            })
        });
    }

    use(middleware) {
        this.middleware.push(middleware);
    }

    handleAuth(ws, {type, payload}) {
        if (ws.authToken) return false;
        if (type == 'auth' && auth.tokens.indexOf(payload) != -1) {
            ws.authToken = payload;
            ws.send(res.status('auth_success', ''));
            return false;
        }
        ws.send(res.status('auth_error', 'not authorized'));
        return true;
    }

    createChannel(channel) {
        console.log('creating channel', arguments[0]);
        this.subscriptions[channel] = [];
        this.pubSub.on(channel, this.broadcast(channel));
    }

    broadcast(channel) {
        return (payload) => {
            this.subscriptions[channel].forEach(ws => ws.send(res.event(channel, payload)))
        }
    }

    handleMessage(ws, {type, channel, payload}) {
        switch (type) {
            case 'event':
                this.pubSub.broadcast(channel, payload);
                break;

            case 'subscribe':
                if (!this.subscriptions[channel]) {
                    this.createChannel(channel);
                }
                this.subscriptions[channel].push(ws);
                break;

            case 'unsubscribe':
                if (this.subscriptions[channel]) {
                    this.subscriptions[channel] = this.subscriptions[channel].filter(sbs => sbs != ws);
                }
        }
    }
}

module.exports = new WsPubSubInterface();