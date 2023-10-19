import { createClient, filters } from 'ldapjs';


const objectID = "10fedcf8-50aa-4b82-917a-01c6bb0d87f3"; // Read the object ID from command line arguments

const bindDN = 'CN=pushpabrol,CN=Users,DC=msdirectoryservices,DC=desmaximus,DC=com'; // Specify your BIND_DN
const searchBase = `CN=Users,DC=msdirectoryservices,DC=desmaximus,DC=com`; // Specify the search base

const client = createClient({
  url: 'ldaps://psedomain.msdirectoryservices.desmaximus.com:636', // Specify your LDAP server URL
});

client.bind(bindDN, 'Whats4@me12345', (err) => {
  if (err) {
    console.error('LDAP Bind Error:', err);
    return;
  }
  var myFilter = new filters.EqualityFilter({
    attribute: 'objectGUID',
    value: guid_to_byte_array(objectID)
});

 


  const options = {
    filter: myFilter,
    scope: 'sub',
    attributes: ['objectGUID', 'userPrincipalName', 'sAMAccountName'],
  };

  client.search(searchBase, options, (searchErr, searchRes) => {
    if (searchErr) {
      console.error('LDAP Search Error:', searchErr);
      return;
    }

    searchRes.on('searchEntry', (entry) => {
      console.log('LDAP Entry:', entry.pojo);
    });

    searchRes.on('end', () => {
      client.unbind();
    });
  });
});

function guid_to_byte_array(uuid_string ) {
    let bytes = [];

    uuid_string.split("-").map((number, index) => {
   
      if(number){
        let match =  number.match(/.{1,2}/g);
        if(match){
          let bytesInChar = index < 3 ? match.reverse() : match;

          bytesInChar.map((byte) => {
            bytes.push(parseInt(byte, 16));
          });
        }
      }
    });
    return bytes;
  }

  
  // Example usage
  