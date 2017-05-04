  var ldapjs = require('ldapjs');
  var configuration = require('./configuration');



  function getLdapClientAsync(cb) {
    var client = ldapjs.createClient({
      url: configuration.LDAP_URL,
      connectTimeout: 500,
      timeout: 1500
    }); 
    client.bind(      
      configuration.LDAP_USER,
      configuration.LDAP_PASSWORD,
      function onBind(err){
        if (err) return cb(err);        
        cb(null, client);
      });
  }

    function getLdapClient() {
    return ldapjs.createClient({
      url: configuration.LDAP_URL,
      bindDN: configuration.LDAP_USER,
      bindCredentials: configuration.LDAP_PASSWORD,
      connectTimeout: 500,
      timeout: 1500
    }); 
  }
  
  function getProfileByMail(mail, client, cb) {
    const opts = {
      scope:  'sub',
      filter: '(|(mail=' + mail + ')(cn=' + mail + '))',
      timeLimit: 1,
      attributes: ['objectGUID','dn','cn','name','uid','displayName','sn','givenName', 'commonName','mail']
    };

    const entries = [];

    const done = function (err) {
      if (err) {
        console.log(err);
        return cb(new Error('Unable to search user'));
      }

      if (entries.length === 0) return cb();
      cb(null, entries[0]);
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
  

  
  function mapLdapProfile(profile){
    // TODOL define a single ID
    return {
      user_id: profile.cn,
      name: profile.displayName,
      family_name: profile.sn,
      given_name: profile.givenName,
      nickname: profile.cn || profile.commonName,
      email: profile.mail,
      email_verified: true
    };
  }

  
  function getDnByMail(mail, client, cb) {
    const opts = {
      scope:  'sub',
      filter: '(|(mail=' + mail + ')(cn=' + mail + '))',
      attributes: ['dn'],
      timeLimit: 1
    };

    const entries = [];

    const done = function (err) {
      if (err) {
        console.log(err);
        return cb(new Error('Unable to search user'));
      }

      if (entries.length === 0) return cb();
      cb(null, entries[0]);
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


    function mapAuth0Profile(profile){
    return {
      cn: profile.username || profile.email,
      sn : 'User',
      givenName: profile.given_name || profile.name || (profile.email && profile.email.split('@')[0]),
      uid: profile.username || profile.email,
      mail: profile.email,      
      userPassword: profile.password,
      objectClass: ['top', 'person', 'inetOrgPerson']
    };
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


    function searchWithLdap(email, cb) {
    getLdapClientAsync(function onClientReady(err,client) {
      if (err || !client) {
        console.log(err);
        return cb(new Error('User repository not available'));
      }

      function done(err, profile) {
        client.destroy();
        cb(err, profile);
      }

      getProfileByMail(email, client, function onProfile(err, profile){
        if (err) return done(err);
        if (!profile) return done(null, null);
        return done(null,mapLdapProfile(profile.object));
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
  
 


  function createWithLdap(user, cb) {
    const client = getLdapClient();
    
    function done(err) {
      client.destroy();
      cb(err);
    }
    
    getDnByMail(user.email, client, function(err, profile){
      if (err) return done(err);
    
      if (profile) return done(new ValidationError("user_exists", "Email address " + user.email + " already registered"));
      
      const ldapEntry = mapAuth0Profile(user);
      client.add(
        "cn=" + ldapEntry.cn + "," + configuration.LDAP_USERS_OU,
        ldapEntry, 
        function(err) {
          if (err) {
            console.log(err);
            console.log(err.message);
            console.log(err.code);
            return done(new Error('User could not be created in directory'));
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
  
  function getPasswordResetChange(password) {
    return new ldapjs.Change({
      operation: 'replace',
      modification: {
        userPassword: password
      }
    });
  }
  
  function changePasswordWithLdap(mail, newPassword, cb) {
    const client = getLdapClient();
    
    function done(err, changed) {
      client.destroy();
      cb(err, changed);
    }
    
    getDnByMail(mail, client, function(err, profile){
      if (err) return done(err);
    
      if (!profile) return done(new ValidationError("user_does_not_exist", "Email address " + mail + " is not registered"));

      client.modify(
        profile.object.dn,
        getPasswordResetChange(newPassword), 
        function(err) {
          if (err) {
			
            console.log(err);
            return done(null, false);
          }
          
          done(null, true);
        });
    });
  }
  

  function validateWithLdap(email, password, cb) {
    getLdapClientAsync(function onClientReady(err,client) {
    
      if (err || !client) {
        console.log(err);
        return cb(new Error('User repository not available'));
      }
    
      function done(err, profile) {
        client.destroy();
        cb(err, profile);
      }

      getProfileByMail(email, client, function onProfile(err, profile){
        if (err) return done(err);

        if (!profile) return done(new WrongUsernameOrPasswordError(email, "Invalid Credentials"));

        client.bind(profile.dn, password, function onLogin(err) {
          if (err) return done(new WrongUsernameOrPasswordError(email, "Invalid Credentials"));
  
          return done(null,mapLdapProfile(profile.object));
        });
      });
    });
  }
  
 

  function WrongUsernameOrPasswordError(error, message) {
    this.error = error;
    this.message = (message || "");
}
WrongUsernameOrPasswordError.prototype = Error.prototype;


module.exports =  { 
    
    validateWithLdap : validateWithLdap,
    createWithLdap : createWithLdap,
    changePasswordWithLdap : changePasswordWithLdap,
    deleteWithLdap : deleteWithLdap,
    searchWithLdap : searchWithLdap

};