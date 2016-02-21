"use strict";

let rp = require("request-promise"),
    cm = require("cache-manager");

// simply call throw, to avoid changing the request-promise function
function request(uri, options, callback) {
    return rp(uri, options, callback);
}

/**
 * @param {Object} cache - cache instance generated with cache manager
 * @param {Object} cacheOptions - options used when setting the key (third param wrap()) 
 * @param {int} cacheOptions.ttl - TTL in seconds
 * @return {Function} - request-promise function bound to given store
 */
request.bindToCache = function (cache, cacheOptions) {
    return function(uri, requestOptions, callback) {
        return cache.wrap(
            uri,
            () => rp(uri, requestOptions, callback),
            callback
        );
    }
}

module.exports = request;