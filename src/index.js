"use strict";

let rp = require("request-promise");

// simply call throw, to avoid changing the request-promise function
function request(uri, options, callback) {
    return rp(uri, options, callback);
}

// http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method
request.hash = function (str) {
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
};

request.getKey = function(requestParam) {
    if (typeof requestParam == "object") {
        if (requestParam.uri) {
            return requestParam.uri + " " + request.hash(JSON.stringify(requestParam));
        }
        return request.hash(JSON.stringify(requestParam));
    } else {
        return requestParam;
    }
};

/**
 * @param {Object} cache - cache instance generated with cache manager
 * @param {Object} [cacheOptions] - options used when setting the key (third param of wrap())
 * @param {int} [cacheOptions.ttl] - e.g. TTL in seconds
 * @return {Function} - request-promise function bound to given store
 */
request.bindToCache = function(cache, cacheOptions) {
    cacheOptions = cacheOptions || {};
    return function(uri, requestOptions, callback) {
        let key = request.getKey(uri);

        return cache.wrap(
            key,
            () => rp(uri, requestOptions, callback),
            cacheOptions,
            callback
        );
    };
};

module.exports = request;