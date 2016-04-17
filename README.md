[![build status](https://api.travis-ci.org/disjunction/node-request-cached-promise.png)](https://travis-ci.org/disjunction/node-request-cached-promise)

# request-cached-promise

Cache proxy class for request-promise: essentially a
combination of **request-promise** and **cache-manager** with
some hashing logic. See:

* promisified variation of request: https://github.com/request/request-promise
* multilayer flexible cache: https://github.com/BryanDonovan/node-cache-manager

Note: request-promise uses **Bluebird** for promises,
so you get not a ES6 native Promise but a Bluebird one.
This should be a little concern, since Bluebird
is Promises/A+ complient.

## Usage

You can bind the lib to a cache-manager cache and then use,
as it were request-promise with all its features.


```javascript
const rcp = require("request-cached-promise");
const request = rcp.bindToCache(someCache);
request(/* ... */ )
    .then (/* ... */)
    .catch(/* ... */);
```

You can bind multiple times to have different caches
used for different requests.

```javascript
const requestMem = rcp.bindToCache(memoryCache);
const requestMultilayer = rcp.bindToCache(multilayerCache);

requestMem(/*...*/).then(/*...*/);
requestMultilayer(/*...*/).then(/*...*/);
```

## Example

... with a simple memory cache, though in real
live you might want to use also redis or mongo etc.

```javascript
const
    cacheManager = require("cache-manager"),
    cache = cacheManager.caching({
        store: 'memory',
        max: 100,
        ttl: 10 // seconds
    }),
    request = require("request-cached-promise").bindToCache(cache);

function getUserProfile(userId) {
    return request({
        uri: "http://some.service/providing/user/" + userId,
        json: true
    });
}

getUserProfile("john.doe").then(data => {
   console.log(data);
   // ... and other important stuff
});
```

## How it works

The library takes request first parameter and generates
a key out of it. If the param is a string, then the key is the URI itself.
Otherwise the key is URI with a hash added at the end.
This schema is used for easier debugging of cached responses
when they're saved in say mongo.

The example above could produce the following record when using **cache-manager-mongoose** store:

```
{
    "_id" : "http://some.service/providing/user/john.doe _978826362",
    "exp" : ISODate("2016-04-17T11:34:32.853Z"),
    "val" : {
        "id": "john.doe",
        "firstName" : "John",
        "lastName": "Doe"
    }
}
```

Here `_978826362` is a hash generated from the request param:
```json
{
    "uri": "http://some.service/providing/user/john.doe",
    "json": true
}
```

## Customization

The module exports two functions, which you can override
if you want.

Override examples:

```javascript
const rcp = require("request-cached-promise");

rcp.hash = function(str) {
    /* my implementation of hashig, e.g. MD5 */
};

rcp.getKey = function(requestParam) {
    // in my case all requests have unique URI
    // i don't want to hash request params
    return requestParam.uri || requestParam;
};
```