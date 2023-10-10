const ldapjs = require('ldapjs');
const configuration = require('./configuration');
const ldap_clients = require('./ldap.js');
const client = ldap_clients.client;
const binder = ldap_clients.binder;


function promisifySearch(client, opts) {
  return new Promise((resolve, reject) => {
    const entries = [];
    client.search(configuration.LDAP_USERS_OU, opts, (err, res) => {
      if (err) return reject(new WrappedLDAPError(err.lde_message || "Error while searching", null, err));

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
          reject(new WrappedLDAPError(err.lde_message || "Error while searching", null, err));
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
    client.add(
      "CN=" + ldapEntry.cn + "," + configuration.LDAP_USERS_OU,
      ldapEntry,
      function (err) {
        if (err) {
          console.log(err);
          console.log(err.message);
          console.log(err.code);
          reject(new WrappedLDAPError(err.lde_message || "Error while searching", 400, err));
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

    client.modify(
      dn,
      modification,
      function (err) {
        if (err) {

          console.log(err);
          reject(new WrappedLDAPError(err.lde_message || "Error while searching", null, err));
        } else resolve(true);
      });
  });

}

function promisifyDelete(client, dn) {

  return new Promise((resolve, reject) => {
    client.del(
      dn,
      function (err) {
        if (err) {
          console.log(err);
          reject(new WrappedLDAPError(err.lde_message || "Error while searching", null, err));
        } else resolve();
      });
  });

}

function promisifyBind(binder, dn, password) {

  return new Promise((resolve, reject) => {
    return binder.bind(dn, password, function onLogin(err) {
      if (err) {
        console.log(err);
        reject(new WrappedLDAPError(err.lde_message || "Error while searching", null, err));
      } else resolve(true);
    });
  });
}


async function getProfileByMailCNorUID(input, client) {
  const opts = {
    scope: 'sub',
    filter: '(|(mail=' + input + ')(cn=' + input + ')(uid=' + input + ')(samAccountName=' + input + '))',
    timeLimit: 100,
    attributes: ['objectGUID;binary', 'dn', 'cn', 'name', 'uid', 'displayName', 'sn', 'givenName', 'mail','sAMAccountName' ]
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

function mapLdapProfile(profile) {
  // TODOL define a single ID
  var userId = profile.uid;
  if (profile['objectGUID;binary']) userId = objectGUIDToUUID(profile['objectGUID;binary']);
  return {
    user_id: userId,
    name: profile.displayName,
    family_name: profile.sn,
    given_name: profile.givenName,
    nickname: profile.uid || profile.cn,
    email: profile.mail,
    email_verified: true
  };
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

function mapAuth0Profile(profile) {
  return {
    cn: profile.username || profile.email,
    sn: profile.family_name || (profile.email && profile.email.split('@')[0]),
    givenName: profile.given_name || (profile.email && profile.email.split('@')[0]),
    uid: profile.username || profile.email,
    mail: profile.email,
    sAMAccountName : profile.username || profile.email.split('@')[0],
    userPassword: profile.password,
    objectClass: ['top', 'person', 'organizationalPerson', 'user']
  };
}


async function getDNsByAuth0UserId(Id, client) {
  var opts = {
    scope: 'sub',
    filter: '(|(mail=' + Id + ')(cn=' + Id + ')(sAMAccountName=' + Id + ')(uid=' + Id + '))',
    attributes: ['dn'],
    timeLimit: 1
  };
  if (isGuidFormat(Id)) {
    opts.filter = new ldapjs.EqualityFilter({
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

async function searchWithLdap(email) {
  if (!client) {
    console.log(err);
    throw new Error('User repository not available');
  }

  try {
    const profile = await getProfileByMailCNorUID(email, client);
    if (!profile) return null;

    return mapLdapProfile(profile);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function deleteWithLdap(id) {
  try {
    const entries = await getDNsByAuth0UserId(id, client);
    if (!entries || entries.length === 0) {
      throw new Error("User with Id " + id + " is not registered");
      return;
    }
    else if (entries.length > 1) {
      throw new Error("There are multiple users with that id");
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

async function createWithLdap(user) {
  try {
    const profile = await getDnByMailorUsername(user.email, client);
    if (profile) {
      throw new WrappedLDAPError("Email address " + user.email + " already registered", 409, null);
    }
    const ldapEntry = mapAuth0Profile(user);
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
  const attr = new ldapjs.Attribute({
    type: 'unicodePwd',
    values: convertPassword(password)
  });

  const change = new ldapjs.Change({
    operation: 'replace',
    modification: attr
  });

  return change;
}

async function changePasswordWithLdap(mail, newPassword) {
  try {
    const profile = await getDnByMailorUsername(mail, client);

    if (!profile) {
      throw new WrappedLDAPError("Email address " + mail + " is not registered", 404, null);
    }
    return await promisifyChange(client, profile.dn, getPasswordResetChange(newPassword))
    //await client.modify(profile.dn, getPasswordResetChange(newPassword));

  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function validateWithLdap(email, password) {
  if (!binder) {
    console.log('User repository not available');
    throw new Error('User repository not available');
  }

  try {
    const profile = await getProfileByMailCNorUID(email, client);
    if (!profile) {
      throw new WrongUsernameOrPasswordError("Invalid Credentials");
    }
    const result = await promisifyBind(binder, profile.dn, password);
    if (result) return mapLdapProfile(profile);
    else return null;
  } catch (err) {
    console.error(err);
    if (err instanceof WrongUsernameOrPasswordError) {
      throw err;
    } else {
      throw new WrappedLDAPError(err.message, 400, err);
    }
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
  constructor(message, statusCode = 500, originalError = null) {
    super(message); // Call the super constructor with the error message

    // Set the error name to the class name
    this.name = this.constructor.name;

    // Set the statusCode property
    this.statusCode = statusCode;

    // Set the originalError property
    this.originalError = originalError;

    // Capture the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

function isGuidFormat(str) {
  const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return guidRegex.test(str);
}

const objectGUIDToUUID = (objectGUID) => {
  const hexValue = Buffer.from(objectGUID, 'base64').toString('hex')

  return hexValue.replace(
    /([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{4})([0-9a-f]{10})/,
    '$4$3$2$1-$6$5-$8$7-$9-$10',
  )
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


module.exports = {
  validateWithLdap: validateWithLdap,
  createWithLdap: createWithLdap,
  changePasswordWithLdap: changePasswordWithLdap,
  deleteWithLdap: deleteWithLdap,
  searchWithLdap: searchWithLdap
};
