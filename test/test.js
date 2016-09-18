mocha.setup('bdd');
chai.should();

describe("Public API", function() {
    it("Should have subscribe and unsubscribe methods", function() {
        droopyPostMessage.should.have.property("subscribe");
        droopyPostMessage.should.have.property("unsubscribe");
        droopyPostMessage.subscribe.should.be.a("function");
        droopyPostMessage.unsubscribe.should.be.a("function");
    });
    it("Should have post and query methods", function() {
        droopyPostMessage.should.have.property("post");
        droopyPostMessage.should.have.property("query");
        droopyPostMessage.post.should.be.a("function");
        droopyPostMessage.query.should.be.a("function");
    });
    it("Should have postParent and queryParent methods", function() {
        droopyPostMessage.should.have.property("postParent");
        droopyPostMessage.should.have.property("queryParent");
        droopyPostMessage.postParent.should.be.a("function");
        droopyPostMessage.queryParent.should.be.a("function");
    });
});

describe("droopyPostMessage.post()", function() {
    it("Should allow you to send a message to another window", function(done) {
        window.top._privateNumber.should.equal(0);
        droopyPostMessage.post(window.top, "set-number", 5);

        setTimeout(function() {
            window.top._privateNumber.should.equal(5);
            done();
        }, 50)
    })
});

describe("droopyPostMessage.postParent()", function() {
    it("Should allow you to send a message to the parent window", function(done) {
        droopyPostMessage.postParent("set-number", 6);

        setTimeout(function() {
            window.top._privateNumber.should.equal(6);
            done();
        }, 50)
    })
});

describe("droopyPostMessage.query() w/ callback", function() {
    it("Should allow to to request a value from another window", function(done) {
        droopyPostMessage.query(window.top, "get-number", null, function(number) {
            window.top._privateNumber.should.equal(number);
            done();
        })
    })
})

describe("droopyPostMessage.queryParent() w/ callback", function() {
    it("Should allow to to request a value from another window", function(done) {
        droopyPostMessage.queryParent("get-number", null, function(number) {
            window.top._privateNumber.should.equal(number);
            done();
        })
    })
})

if (Promise) {
    describe("droopyPostMessage.queryParent() w/ Promise", function() {
    it("Should allow to to request a value from another window", function(done) {
        droopyPostMessage.queryParent("get-number")
            .then(function(number) {
                window.top._privateNumber.should.equal(number);
                done();
            })
    })
})
}
mocha.run();