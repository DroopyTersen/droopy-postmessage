// PARENT PAGE
(function(droopyPostMessage){
    var handlers = {
        resizeIframe: function(event, size) {
            //find iframe and use size.width and size.height to resize
        },
        queryStringValue: function(event, key) {
            // poor "getQueryStringValue" implementation used for brevity
            var value = window.location.search.match(new RegExp(key + "=([^&]*)"))[1];
            event.respond(value)
        }
    };

    droopyPostMessage.subscribe("resize-iframe", handlers.resizeIframe);
    droopyPostMessage.subscribe("get-querystring", handlers.queryStringValue);
})();


//IFramed Paged
(function(droopyPostMessage){

    // Typical PostMessage Usage
    droopyPostMessage.post(window.top, "resize-iframe", { width: "800px", height: "500px" });
    droopyPostMessage.postParent("resize-iframe", { width: "800px", height: "500px" });

    // Update the iframe content based on a parent window's query string param
    var loadProfile = function(username) {
        // get data and show it... blah blah blah
        // The important magic is that the data driver 'username' was retrieved from the parent window querystring
    };

    droopyPostMessage.query(window.top, "get-querystring", "username", loadProfile);
    droopyPostMessage.queryParent("get-querystring", "username", loadProfile);

    droopyPostMessage.query(window.top, "get-querystring", "username").then(loadProfile);
    droopyPostMessage.queryParent("get-querystring", "username").then(loadProfile);

})();