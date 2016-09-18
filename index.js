var EventAggregator = require("droopy-events");

var MSG_TYPE = "droopy-postmessage";
var droopyPostMessage = {
	_eventer: new EventAggregator(),
	_config: {},
	_post: function(targetWindow, key, payload, responseKey) {
		var msg = JSON.stringify({
			key: key,
			payload: payload,
			responseKey: responseKey,
            type: MSG_TYPE
		});
		if (targetWindow && targetWindow.postMessage) {
			targetWindow.postMessage(msg, "*");
		} else {
			console.log("DROOPY POST MESSAGE ERROR: Invalid target or Post Message support");
			throw "Can not post message to invalid target window.";
		}
	},
    enabled: false,
	_recieve: function(event) {
		// this will actually fire on all postMessage events not just ours
		// so we need to be extra defensive
		try {
			var msg = JSON.parse(event.data);
			// Make sure it was a droopy event
			if (msg.key && msg.type === MSG_TYPE) {
				event.responseKey = msg.responseKey;
				event.respond = createRespondFunc(event);
				droopyPostMessage._eventer.trigger(msg.key, event, msg.payload);				
			}
		} catch(err) {
			// Couldn't JSON.parse the event.data so it must not have been sent by droopyPostMessage
		}
	},
	_turnOn: function() { 
        window.addEventListener("message", droopyPostMessage._recieve, false); 
        droopyPostMessage.enabled = true;
    },
	_turnOff: function() { 
        window.removeEventListener("message", droopyPostMessage._recieve, false);
        droopyPostMessage.enabled = false; 
    }
};

// Public methods
droopyPostMessage.subscribe = function(key, cb) {
    if (!droopyPostMessage.enabled) droopyPostMessage._turnOn();
	droopyPostMessage._eventer.on(key, cb)
};

droopyPostMessage.unsubscribe = function(key, cb) {
	droopyPostMessage._eventer.off(key, cb);
};

droopyPostMessage.post = function(targetWindow, key, payload, cb) {
    if (!droopyPostMessage.enabled) droopyPostMessage._turnOn();
    droopyPostMessage._post(targetWindow, key, payload);
};

droopyPostMessage.query = function(targetWindow, key, payload, cb) {
    var deferred = null;
    if (!droopyPostMessage.enabled) droopyPostMessage._turnOn();
    var responseKey = Date.now();
    
    // Use Post Message api to listen for a message back from the target window
    var responseHandler = function(e, payload) {
        // No point staying subscribed this this was a one and done thing
        droopyPostMessage.unsubscribe(responseKey, responseHandler);

        // invoke the initial callback
        if (cb && typeof cb === "function") {
            cb(payload);
        }
        if (deferred) {
            deferred.resolve(payload);
        }
    };
    // Listen for the parent window to respond
    droopyPostMessage.subscribe(responseKey, responseHandler);
	
    droopyPostMessage._post(targetWindow, key, payload, responseKey);
    if (typeof Promise !== "undefined") {
        return new Promise(function(resolve, reject) {
            deferred = { resolve: resolve, reject: reject };
        })
    }
};

droopyPostMessage.postParent = function(key, payload) {
	return droopyPostMessage.post(window.top, key, payload)
};

droopyPostMessage.queryParent = function(key, payload, cb) {
    return droopyPostMessage.query(window.top, key, payload, cb);
};

var createRespondFunc = function(postMessageEvent) {
	// If the modal requestor sent a responseKey, create an easy way to send a response back
	if (postMessageEvent && postMessageEvent.responseKey) {
		return function(payload) {
			return droopyPostMessage.post(postMessageEvent.source, postMessageEvent.responseKey, payload);
		}
	} else {
		return function() {};
	}
};

if (module) {
	module.exports = droopyPostMessage;
} 
droopyPostMessage._turnOn();
global.droopyPostMessage = droopyPostMessage;