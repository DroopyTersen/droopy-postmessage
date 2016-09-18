Droopy PostMessage
===================

Wrapper for HTML5 PostMessage api to add support for callbacks and promises.

----------

##Why?
Let's say you have 2 web apps, and want to iframe App B inside of App A (maybe you have a Wordpress site and want to embed a widget hosted by a separate custom web application).  For security reasons, windows can not communicate cross-origin.  So your IFramed custom widget will not be able to access `window.top` values.  To solve this problem we have the HTML5 PostMessage API.

The native PostMessage API is very simple and only allows passing a message string and a target window.  Droopy PostMessage builds on this native capability to allow sending javascript objects and handles querying another window and waiting for a response (through callbacks or promises).
##Install & Setup

**Option 1**:  Node.js
*Prereq:* Install <a href="https://nodejs.org/en/">Node.js</a>, go for highest version. 


``` bash
#Install the droopy-postmessage module in your project
npm install --save droopy-postmessage
```

**Option 2**: Global Include
1. Download <a href="https://raw.githubusercontent.com/DroopyTersen/droopy-postmessage/master/dist/droopyPostMessage.js">the source code</a> and include it on your page: 

**Setup** - Last, you need to include droopyPostMessage.js on both pages, the parent page, and the iframed page.

##Methods
* **`droopyPostMessage.subscribe(key, handler)`** - allows a page to listen for a particular key
* **`droopyPostMessage.unsubscribe(key, handler)`** - disables the handler function that is bound to that key
* **`droopyPostMessage.post(targetWindow, key, payload)`** - sends a message to another window.  If the targeted window has subscribed to the `key`, the targeted window's handler will receive the payload
* **`droopyPostMessage.postParent(key, payload)`** - syntax sugar that calls `.post()` with `window.top` as the target window
* **`droopyPostMessage.query(targetWindow, key, payload, cb)`**- sends a message to another window with the expectation that the target window is listening for that event key and will respond back.  The `cb` function will be invoked when the target window responds.  If the browser supports Promises, a `Promise` will be returned as an alternative to a callback
* **`droopyPostMessage.queryParent(key, payload, cb)`** - syntax sugar that calls `.query()` with `window.top` as the target window.


##Example Usage

**Parent Window** - has a global variable `_privateNumber`, and an IFramed widget.  The parent window trusts the IFramed widget and wants to allow it to get and set the `_privateNumber`
```javascript
window._privateNumber = 0;
var handlers = {
    setNumber: function(event, newNumber) {
	    // Update with a value passed from the IFramed Page
        window._privateNumber = newNumber;
    },
    getNumber: function(event) {
	    // Send a response back to the IFramed page
        event.respond(window._privateNumber);
    }
};
// Listen for the iframed window to send a message
droopyPostMessage.subscribe("get-number", handlers.getNumber);
droopyPostMessage.subscribe("set-number", handlers.setNumber);
```

**IFramed Window** - The IFamed window wants to be able to send messages to the parent to get and set the private number

```javascript
// This will throw an ERROR if cross-origin
var number = window.top._privateNumber

// Tell the parent window to update the number
droopyPostMessage.postParent("set-number", 5);

// Get the number from the parent window
droopyPostMessage.queryParent("get-number", null, function(num) {
	console.log("This number should be 5: " + num);
})

// PROMISE instead of callback
droopyPostMessage.queryParent("get-number").then(function(num) {
	console.log("This number should be 5: " + num);
})
```


