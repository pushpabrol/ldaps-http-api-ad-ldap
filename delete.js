

var express = require('express');
var router = express.Router();
var ldapjs = require('ldapjs');
var configuration = require('./configuration');
router.route('/')
    .post(function (req, res) {
        
    console.log(req.body);
    var id = req.body.id;
   deleteWithLdap(id, function(error,profile){
if(error)
                    {

                        res.statusCode = 500;
                        res.json(error);
                    }
                    else
                    {
                        
                        res.statusCode = 200;
                        res.json(profile);
                    }

   });

    });

    module.exports = router;


 
    
  function getLdapClient() {
    return ldapjs.createClient({
      url: configuration.LDAP_URL,
      bindDN: configuration.LDAP_USER,
      bindCredentials: configuration.LDAP_PASSWORD,
      connectTimeout: 500,
      timeout: 1500
    }); 
  }
  
  function getDNsById(id, client, cb) {
    // TODO: define single ID field
    const opts = {
      scope:  'sub',
      filter: '(uid=' + id + ')',
      attributes: ['dn'],
      timeLimit: 1
    };

    const entries = [];

    const done = function (err) {
      if (err) {
        console.log(err);
        return cb(new Error('Unable to search user'));
      }

      cb(null, entries);
    };

    client.search(configuration.LDAP_USERS_OU, opts, function(err, res){
      if (err) return done(err);
      
      res.on('searchEntry', function (entry) {
        entries.push(entry);
      }).once('error', function(err) {
        if (err.message === 'Size Limit Exceeded') {
          return done();
        }
        done(err);
      }).once('end', function() {
          return done();
      });
    });
  }
  
  function deleteWithLdap(id, cb) {
    const client = getLdapClient();
    
    function done(err) {
      client.destroy();
      cb(err);
    }

    getDNsById(id, client, function(err, entries){
      if (err) return done(err);
      
      console.log(entries);
    
      if (!entries || entries.length === 0) return done(new ValidationError("user_does_not_exist", "User with Id " + id + " is not registered"));      
      if (!entries || entries.length > 1) return done(new ValidationError("multiple_users", "There are multiple users with that id"));

      client.del(
        entries[0].object.dn,
        function(err) {
          if (err) {
            console.log(err);
            return done(new Error('User could not be deleted'));
          }
          
          done();
        });
    });
  }
  
 
 function ValidationError(error, message) {
    this.error = error;
    this.message = (message || "");
}
ValidationError.prototype = Error.prototype;