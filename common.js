import pkg from 'ldapjs';
const { InvalidCredentialsError, EqualityFilter, NoSuchObjectError, InappropriateMatchingError, EntryAlreadyExistsError, Attribute, Change, UnavailableError } = pkg;
import { LDAP_USERS_OU } from './configuration.js';
import { client as _client, binder as _binder } from './ldap.js';
const client = _client;
const binder = _binder;
import profileMapper from './profileMapper.js';
import mapAuth0CreateUserProfileToLdap from './mapCreateUserToLdapProfile.js';

import PQueue from 'p-queue';
const bindQueue = new PQueue({ concurrency: 10 });

bindQueue.onIdle(function(){
  setTimeout(function(){
    console.log("All binds done!");
  }, 2000);
  
})

bindQueue.onEmpty(function(){
  setTimeout(function(){
    console.log("Queue is empty!");
  }, 2000);

  
})

function promisifySearch(client, opts) {
  return new Promise((resolve, reject) => {
    const entries = [];
    const startTime = Date.now();

// Perform some operation

    client.search(LDAP_USERS_OU, opts, (err, res) => {
      const endTime = Date.now();
      const elapsedTime = endTime - startTime;
      console.log(`Search Operation took ${elapsedTime} ms.`);

      if (err) {
        return reject(new WrappedLDAPError(err));
      }
      
      res.on('searchEntry', (entry) => {
        const profile = {};
        console.log(entry.pojo.attributes);
        entry.pojo.attributes.forEach((item) => {
          profile[item.type] = item.values[0];
        });
        profile["dn"] = entry.pojo.objectName;
        entries.push(profile);
      });

      res.on('error', (err) => {
        if (err.message === 'Size Limit Exceeded') {
          resolve(entries);
        } else {
          reject(new WrappedLDAPError(err));
        }
      });

      res.on('end', () => {
        resolve(entries);
      });
    });
  });
}

function promisifyCreate(client, ldapEntry) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    client.add(
      "CN=" + ldapEntry.cn + "," + LDAP_USERS_OU,
      ldapEntry,
      function (err) {
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;
        console.log(`Create Operation took ${elapsedTime} ms.`);
    
        if (err) {
          console.log(err);
          console.log(err.message);
          console.log(err.code);
          reject(new WrappedLDAPError(err));
        } else {
          delete ldapEntry.unicodePwd;
          delete ldapEntry.userPassword;
          delete ldapEntry.objectClass;
          delete ldapEntry.userAccountControl;
          resolve(ldapEntry)
        }

      });
  });
}

function promisifyChange(client, dn, modification) {

  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    client.modify(
      dn,
      modification,
      function (err) {
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;
        console.log(`Change Operation took ${elapsedTime} ms.`);        
        if (err) {

          console.log(err);
          reject(new WrappedLDAPError(err));
        } else resolve(true);
      });
  });

}

function promisifyDelete(client, dn) {

  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    client.del(
      dn,
      function (err) {
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;
        console.log(`Delete Operation took ${elapsedTime} ms.`);   
        if (err) {
          console.log(err);
          reject(new WrappedLDAPError(err));
        } else resolve();
      });
  });

}

async function promisifyBind(binder, dn, password) {
  return bindQueue.add(async () => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      binder.bind(dn, password, (err) => {
        const elapsedTime = Date.now() - startTime;
        console.log(`Bind Operation took ${elapsedTime} ms.`); 
        if (err) {
          console.log("Error in bind");
          console.log(err instanceof InvalidCredentialsError);
          const detailedError = new WrappedLDAPError(err);
          console.log(detailedError);
          reject(detailedError);
        } else {
          console.log("Items in queue: ", bindQueue.size);
          resolve(true);
        }
      });
    });
  });
}



async function getProfileByMailCNorUID(input, client) {
  const opts = {
    scope: 'sub',
    filter: '(|(mail=' + input + ')(cn=' + input + ')(uid=' + input + ')(samAccountName=' + input + '))',
    timeLimit: 100,
    attributes: ['objectGUID;binary', 'dn', 'cn', 'name', 'uid', 'displayName', 'sn', 'givenName', 'mail','sAMAccountName', 'st','description','postalCode','telephoneNumber','distinguishedName','co','department','company','mailNickname','sAMAccountType','userPrincipalName','manager','organizationUnits' ]
     
  };

  try {
    console.log(opts);
    const entries = await promisifySearch(client, opts);
    console.log(entries.length);
    if (entries.length === 0) return null;
    console.log(entries[0]);
    return entries[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}


async function getDnByMailorUsername(mailOrUserName, client) {
  const opts = {
    scope: 'sub',
    filter: '(|(mail=' + mailOrUserName + ')(cn=' + mailOrUserName + ')(sAMAccountName=' + mailOrUserName + ')(uid=' + mailOrUserName + '))',
    attributes: ['dn'],
    timeLimit: 1
  };

  try {
    const entries = await promisifySearch(client, opts);
    if (entries.length === 0) return null;
    return entries[0];
  } catch (err) {
    console.log(err);
    throw new err;
  }
}


async function getDNsByAuth0UserId(Id, client) {
  var opts = {
    scope: 'sub',
    filter: '(|(mail=' + Id + ')(cn=' + Id + ')(sAMAccountName=' + Id + ')(uid=' + Id + '))',
    attributes: ['dn'],
    timeLimit: 1
  };
  if (isGuidFormat(Id)) {
    opts.filter = new EqualityFilter({
      attribute: 'objectGUID',
      value: guid_to_byte_array(Id)
    });
  }


  try {
    const entries = await promisifySearch(client, opts);
    return entries;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function searchWithLdap(email) {
  if (!client) {
    console.log(err);
    throw new Error('User repository not available');
  }

  try {
    const profile = await getProfileByMailCNorUID(email, client);
    if (!profile) return null;

    return profileMapper(profile);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function deleteWithLdap(id) {
  try {
    const entries = await getDNsByAuth0UserId(id, client);
    if (!entries || entries.length === 0) {
      throw new WrappedLDAPError(new NoSuchObjectError("User with Id " + id + " is not registered"));
      return;
    }
    else if (entries.length > 1) {
      throw new WrappedLDAPError(new InappropriateMatchingError("There are multiple users with that id"));
      return
    } else {
      const deleted = await promisifyDelete(client, entries[0].dn)
      return deleted;
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function createWithLdap(user) {
  try {
    const profile = await getDnByMailorUsername(user.email, client);
    if (profile) {
      throw new WrappedLDAPError(new EntryAlreadyExistsError("Email address " + user.email + " already registered"));
    }
    const ldapEntry = mapAuth0CreateUserProfileToLdap(user);
    ldapEntry.userAccountControl = 512;
    ldapEntry.unicodePwd = convertPassword(ldapEntry.userPassword);
    ldapEntry.objectClass = ["top", "person", "organizationalPerson", "user"];
    console.log(ldapEntry);
    return await promisifyCreate(client, ldapEntry);
  } catch (err) {
    throw err;
  }
}

function convertPassword(password) {
  return new Buffer('"' + password + '"', 'utf16le').toString();
}

function getPasswordResetChange(password) {
  const attr = new Attribute({
    type: 'unicodePwd',
    values: convertPassword(password)
  });

  const change = new Change({
    operation: 'replace',
    modification: attr
  });

  return change;
}

export async function changePasswordWithLdap(mail, newPassword) {
  try {
    const profile = await getDnByMailorUsername(mail, client);

    if (!profile) {
      throw new WrappedLDAPError( new NoSuchObjectError("Email address " + mail + " is not registered"));
    }
    return await promisifyChange(client, profile.dn, getPasswordResetChange(newPassword))
    //await client.modify(profile.dn, getPasswordResetChange(newPassword));

  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function validateWithLdap(email, password) {
  if (!binder) {
    console.log('User repository not available');
    throw new WrappedLDAPError(new UnavailableError('User repository not available'));
  }

  try {
    const profile = await getProfileByMailCNorUID(email, client);
    if (!profile) {
      throw new WrongUsernameOrPasswordError("Invalid Credentials");
    }
    const result = await promisifyBind(binder, profile.dn, password);
    if (result) return profileMapper(profile);
    else return null;
  } catch (err) {
    console.error(err);
    throw err;
  }
}


class WrongUsernameOrPasswordError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.statusCode = 401;
    this.originalError = originalError;
  }
}

class WrappedLDAPError extends Error {
  constructor(error){
    super(error);
    this.name = error.name;
    this.statusCode = this.statusByErrorName() || 500;
    this.code = error.code || 1000;
    this.message = this.messageByErrorName();
    Error.captureStackTrace(this, error);
  }
  statusByErrorName = function() {
    return {
       "InvalidCredentialsError" : 401, 
       "NoSuchObjectError" : 404, 
       "EntryAlreadyExistsError" : 409 ,
       "InappropriateMatchingError" : 409
    }[this.name] || 400;
  };

  messageByErrorName = function() {
    return {
      "UnwillingToPerformError" : "Invalid Password Strength", 
   }[this.name] || this.message
  }
}

function isGuidFormat(str) {
  const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return guidRegex.test(str);
}


function guid_to_byte_array(uuid_string) {
  let bytes = [];

  uuid_string.split("-").map((number, index) => {

    if (number) {
      let match = number.match(/.{1,2}/g);
      if (match) {
        let bytesInChar = index < 3 ? match.reverse() : match;

        bytesInChar.map((byte) => {
          bytes.push(parseInt(byte, 16));
        });
      }
    }
  });
  return bytes;
}


