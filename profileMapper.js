
const objectGUIDToUUID = (objectGUID) => {
    const hexValue = Buffer.from(objectGUID, 'base64').toString('hex')
  
    return hexValue.replace(
      /([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{4})([0-9a-f]{10})/,
      '$4$3$2$1-$6$5-$8$7-$9-$10',
    )
  }
  
export default function (ldapData) {
    var profile = {
      id:         ldapData["objectGUID;binary"] ? objectGUIDToUUID(ldapData["objectGUID;binary"]) : ldapData.uid || ldapData.cn,
      displayName: ldapData.displayName,
      name: {
        familyName: ldapData.sn,
        givenName: ldapData.givenName
      },
      nickname: ldapData['sAMAccountName'] || ldapData['cn'] || ldapData['commonName'],
      groups: ldapData['groups'],
      emails: (ldapData.mail ? [{value: ldapData.mail }] : undefined)
    };
  
    profile['dn'] = ldapData['dn'];
    profile['st'] = ldapData['st'];
    profile['description'] = ldapData['description'];
    profile['postalCode'] = ldapData['postalCode'];
    profile['telephoneNumber'] = ldapData['telephoneNumber'];
    profile['distinguishedName'] = ldapData['distinguishedName'];
    profile['co'] = ldapData['co'];
    profile['department'] = ldapData['department'];
    profile['company'] = ldapData['company'];
    profile['mailNickname'] = ldapData['mailNickname'];
    profile['sAMAccountName'] = ldapData['sAMAccountName'];
    profile['sAMAccountType'] = ldapData['sAMAccountType'];
    profile['userPrincipalName'] = ldapData['userPrincipalName'];
    profile['manager'] = ldapData['manager'];
    profile['organizationUnits'] = ldapData['organizationUnits'];
    
    // if your LDAP service provides verified email addresses, uncomment this:
    // profile['email_verified'] = true;
    
    return profile;
  };