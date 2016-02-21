"use strict";

let requestCached = require("../src/index"),
    nock = require("nock"),
    cm = require("cache-manager"),
    expect = require("chai").expect;

describe("request-cached-promise", () => {
    let cache;

    before(() => {
        cache = cm.caching({store: "memory"});
    });

    it("first makes request, then uses a cached value", done => {
        nock("http://example.com")
            .get("/test-path")
            .reply(200, "hello foo");

        let request = requestCached.bindToCache(cache);
        request("http://example.com/test-path")
            .then(body => {
                expect(body).to.equal("hello foo");
                // this request would not succeed without caching, because nock works only once
                return request("http://example.com/test-path");
            })
            .then(body => {
                expect(body).to.equal("hello foo");
                done();
            })
            .catch(done);
    });
});