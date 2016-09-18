/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module, global) {var EventAggregator = __webpack_require__(2);

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
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)(module), (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 2 */
/***/ function(module, exports) {

	var EventAggregator = function() {
		this.eventKeys = {};
		this.lastSubscriptionId = -1;
	};

	EventAggregator.prototype.on = function(key, callback) {
		if (typeof callback === "function") {
			if (!this.eventKeys[key]) {
				this.eventKeys[key] = {
					subscriptions: {}
				};
			}
			var token = (++this.lastSubscriptionId).toString();
			this.eventKeys[key].subscriptions[token] = callback;
			return token;
		} else {
			return false;
		}
	};

	EventAggregator.prototype.off = function(key, tokenOrCallback) {
		if (typeof tokenOrCallback === 'function') {
			//Callback reference was passed in so find the subscription with the matching function
			if (this.eventKeys[key]) {
				var eventSubscriptions = this.eventKeys[key].subscriptions;
				var matchingId = null;
				//foreach subscription see if the functions match and save the key if yes
				for (var subscriptionId in eventSubscriptions) {
					if (eventSubscriptions.hasOwnProperty(subscriptionId)) {
						if (eventSubscriptions[subscriptionId] === tokenOrCallback) {
							matchingId = subscriptionId;
						}
					}
				}
				if (matchingId !== null) {
					delete eventSubscriptions[matchingId];
				}
			}
		} else {
			//Token was passed in
			if (this.eventKeys[key] && this.eventKeys[key].subscriptions[tokenOrCallback]) {
				delete this.eventKeys[key].subscriptions[tokenOrCallback];
			}
		}
	};

	EventAggregator.prototype.trigger = function(key) {
		var self = this;
		if (self.eventKeys[key]) {
			var values = Array.prototype.slice.call(arguments, 1);
			//If passing less than values pass them individually
			var a1 = values[0],
				a2 = values[1],
				a3 = values[2];
			//Else if passing more than 3 values group as an args array
			if (values.length > 3) {
				a1 = values;
			}

			var subscriptions = self.eventKeys[key].subscriptions;
			setTimeout(function() {
				for (var token in subscriptions) {
					if (subscriptions.hasOwnProperty(token)) {
						subscriptions[token](a1, a2, a3);
					}
				}
			}, 0);
		}
	};

	module.exports = EventAggregator;

/***/ }
/******/ ]);