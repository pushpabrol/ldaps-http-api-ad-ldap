module.exports = {

LDAP_URL :'ldap://xxxxx:389',
LDAP_USER: 'cn=admin,dc=...,dc=...,dc=com',
LDAP_PASSWORD: '...',
LDAP_USERS_OU: 'ou=users,dc=...,dc=...,dc=com',
PORT: 8080,
LDAP_HEARTBEAT_SECONDS : 240 // Set this to a value lower than the ldap idle timeout

}

