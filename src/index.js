"use strict";

let rp = require("request-promise");

// simply call throw, to avoid changing the request-promise function
function request(uri, options, callback) {
    return rp(uri, options, callback);
}

function quickHash(str) {
    let hash = 0, char;
    if(!str.length) {
        return hash;
    }
    for (let i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return "_" + hash;
}

request.getKey = function(requestParam) {
    if (typeof requestParam == "object") {
        if (requestParam.uri) {
            return requestParam.uri + " " + quickHash(JSON.stringify(requestParam));
        }
        return quickHash(JSON.stringify(requestParam));
    } else {
        return requestParam;
    }
};

/**
 * @param {Object} cache - cache instance generated with cache manager
 * @param {Object} cacheOptions - options used when setting the key (third param wrap())
 * @param {int} cacheOptions.ttl - TTL in seconds
 * @return {Function} - request-promise function bound to given store
 */
request.bindToCache = function(cache, cacheOptions) {
    return function(uri, requestOptions, callback) {
        let key = request.getKey(uri);

        return cache.wrap(
            key,
            () => rp(uri, requestOptions, callback)
                .then(data => {
                    if (typeof data == "object") {
                        return JSON.stringify(data);
                    } else {
                        return data;
                    }
                }),
            callback
        );
    };
};

module.exports = request;