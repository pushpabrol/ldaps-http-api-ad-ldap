export default function (user) {

    var mapped = {
      cn: user.username || user.email,
      sn: user.family_name || (user.email && user.email.split('@')[0]),
      givenName: user.given_name || (user.email && user.email.split('@')[0]),
      uid: user.username || user.email,
      mail: user.email,
      sAMAccountName : user.username || user.email.split('@')[0],
      userPassword: user.password,
      objectClass: ['top', 'person', 'organizationalPerson', 'user']
    }
      if(user.app_metadata)
      {
        const appMetadata = user.app_metadata;
        if(appMetadata.st) mapped.st = appMetadata.st;
        if(appMetadata.description) mapped.description = appMetadata.description;
        if(appMetadata.telephoneNumber) mapped.telephoneNumber = appMetadata.telephoneNumber;
        if(appMetadata.co) mapped.co = appMetadata.co;
        if(appMetadata.department) mapped.department = appMetadata.department;
        if(appMetadata.company) mapped.company = appMetadata.company;
        if(appMetadata.sAMAccountType) mapped.sAMAccountType = appMetadata.sAMAccountType;
        if(appMetadata.manager) mapped.manager = appMetadata.manager;

      }
      return mapped;
    
  };