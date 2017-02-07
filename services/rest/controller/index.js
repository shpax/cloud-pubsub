const PubSubService = require('../../base');
const authData = require('../auth');
const message = require('../../../messages');

const pubSub = new PubSubService();

function auth(req, res, next) {
    const {Authorization} = req.headers;
    if (Authorization && authData.tokens.indexOf(Authorization) != -1) {
        next();
    } else {
        res.end(message.status('error', 'Bad Auth'))
    }
}

function emit(req, res) {
    const {channel, payload} = req.body;
    if (channel) {
        pubSub.broadcast(channel, payload);
        res.end(message.status('success'));
    } else {
        res.end(message.status('error', 'no channel'));
    }
}

function subscribe(req, res) {
    // todo: webhooks
}

module.exports = {
    auth,
    emit
};