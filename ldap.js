var ldap = require('ldapjs');
var exit = require('./exit');
var fs = require('fs');
var configuration = require('./configuration');
var client, binder;
var cb = require('cb');
function createConnection(type) {
var tlsOptions = null;
        
        var connection = ldap.createClient({
            url: configuration.LDAP_URL,
            idleTimeout : configuration.LDAP_IDLE_TIMEOUT_MS,
            reconnect: {
                initialDelay: 0,
                maxDelay: 5000,
                failAfter: 60000
            }

        });

    connection.on('close', function () {
        console.error('Connection to ldap was closed.');
        exit(1);
    });

    if(type === "client") connection.on('idle', function () {
        console.log('Idle time reached!, will try to bind again!');
        connection.bind(configuration.LDAP_USER, LDAP_BIND_CREDENTIALS, function (err) {
            if (err) {
                console.error("Error binding to LDAP", 'dn: ' + err.dn + '\n code: ' + err.code + '\n message: ' + err.message);
                return exit(1);
            }
            console.log('admin bind done');
    
        });
    });

    var LDAP_BIND_CREDENTIALS = configuration.LDAP_PASSWORD;


    connection.bind(configuration.LDAP_USER, LDAP_BIND_CREDENTIALS, function (err) {
        if (err) {
            console.error("Error binding to LDAP", 'dn: ' + err.dn + '\n code: ' + err.code + '\n message: ' + err.message);
            return exit(1);
        }
        //console.log('admin bind done');
    });

    return connection;
}

Object.defineProperty(module.exports, 'client', {
    enumerable: true,
    configurable: false,
    get: function () {
        client = client || createConnection("client");
        return client;
    }
});

Object.defineProperty(module.exports, 'binder', {
    enumerable: true,
    configurable: false,
    get: function () {
        binder = binder || createConnection("binder");
        return binder;
    }
});