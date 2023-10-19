import pkg from 'ldapjs';
const { createClient } = pkg;
import exit from './exit.js';
import { LDAP_URL, LDAP_IDLE_TIMEOUT_MS, LDAP_USER, LDAP_PASSWORD } from './configuration.js';
var client, binder;

function createConnection(type) {
var tlsOptions = null;
        
        var connection = createClient({
            url: LDAP_URL,
            idleTimeout : LDAP_IDLE_TIMEOUT_MS,
            reconnect: {
                initialDelay: 10,
                maxDelay: 5000,
                failAfter: 60000
            }

        });

    connection.on('close', function () {
        console.error('Connection to ldap was closed.');
        exit(1);
    });

    connection.on("connect", function(){
        console.log(`Connected! ${type}`);
    })
    connection.on("unbind", function(){
        console.log("i unbinded!");
    })

    connection.on("connectError", function(err){
        console.log(err);
        console.log("connect Error");
    })

    connection.on("bind", function(){
        console.log("i binded!");
    })

    connection.on("error", function(err){
        console.log(err);
    })
    connection.on('idle', function () {
        console.log('Idle time reached!, will try to bind again!');

        connection.bind(LDAP_USER, LDAP_PASSWORD, function (err) {
            if (err) {
                console.error("Error binding to LDAP", 'dn: ' + err.dn + '\n code: ' + err.code + '\n message: ' + err.message);
                return exit(1);
            }
            console.log(`Bind on idle timeout: ${type}`);
    
        });
    });

    connection.bind(LDAP_USER, LDAP_PASSWORD, function (err) {
        if (err) {
            console.error("Error binding to LDAP", 'dn: ' + err.dn + '\n code: ' + err.code + '\n message: ' + err.message);
            return exit(1);
        }
        console.log(`Bound at startup: ${type}`);
    });


    return connection;
}

export var client = client || createConnection("client");
export var binder = binder || createConnection("binder");

