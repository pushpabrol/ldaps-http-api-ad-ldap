var ldap = require('ldapjs');
var exit = require('./exit');
var fs = require('fs');
var configuration = require('./configuration');
var client, binder;
var cb = require('cb');
function createConnection() {
var tlsOptions = null;
if (configuration.LDAP_URL.toLowerCase().substr(0, 5) === 'ldaps') {   
tlsOptions = {

ca: [ fs.readFileSync('cert1.pem') ]
};
}
    var connection = ldap.createClient({
        url: configuration.LDAP_URL

    });

    connection.on('close', function () {
        console.error('Connection to ldap was closed.');
        exit(1);
    });
    var LDAP_BIND_CREDENTIALS = configuration.LDAP_PASSWORD;

    connection.heartbeat = function (callback) {
        connection.search('', '(objectclass=*)', function (err, res) {
            if (err) {
                return callback(err);
            }

            var abort = setTimeout(function () {
                client.removeAllListeners('end');
                client.removeAllListeners('error');
                callback(new Error('No heartbeat response'));
            }, 5000);

            res.once('error', function (err) {
                client.removeAllListeners('end');
                clearTimeout(abort);
                callback(err);
            }).once('end', function () {
                client.removeAllListeners('error');
                clearTimeout(abort);
                callback();
            });
        });
    };

    function protect_with_timeout(func) {
        var original = connection[func];
        connection[func] = function () {
            var args = [].slice.call(arguments);
            var original_callback = args.pop();
            var timeoutable_callback = cb(original_callback).timeout(450000);
            var new_args = args.concat([timeoutable_callback]);
            return original.apply(this, new_args);
        };
    }

    protect_with_timeout('bind');
    protect_with_timeout('search');

    connection.bind(configuration.LDAP_USER, LDAP_BIND_CREDENTIALS, function (err) {
        if (err) {
            console.error("Error binding to LDAP", 'dn: ' + err.dn + '\n code: ' + err.code + '\n message: ' + err.message);
            return exit(1);
        }
        //console.log('admin bind done');
        function ping_recurse() {
            connection.heartbeat(function (err) {
                if (err) {
                    console.error('Error on heartbeat response from LDAP: ', err.message);
                    return exit(1);
                }
                //console.log('heartbeat ok at ' + new Date().toISOString());
                setTimeout(ping_recurse, configuration.LDAP_HEARTBEAT_SECONDS * 1000);
            });
        }

        setTimeout(ping_recurse, 10 * 1000);
    });



    return connection;
}

Object.defineProperty(module.exports, 'client', {
    enumerable: true,
    configurable: false,
    get: function () {
        client = client || createConnection();
        return client;
    }
});

Object.defineProperty(module.exports, 'binder', {
    enumerable: true,
    configurable: false,
    get: function () {
        binder = binder || createConnection();
        return binder;
    }
});