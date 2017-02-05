

function status(status, payload) {
    return JSON.stringify({status, payload})
}

function event (channel, payload) {
    return JSON.stringify({channel, payload})
}

module.exports = {
    status,
    event
};