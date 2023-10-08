require('dotenv').config(); // Load environment variables from .env file

module.exports = {
  LDAP_URL: process.env.LDAP_URL || 'ldaps://desmaximus.com:636',
  LDAP_USER: process.env.LDAP_USER || 'CN=adsdad,desmaximus,DC=com',
  LDAP_PASSWORD: process.env.LDAP_PASSWORD || 'Wha',
  LDAP_USERS_OU: process.env.LDAP_USERS_OU || 'DC=desmaximus,DC=com',
  PORT: process.env.PORT || 8080,
  LDAP_IDLE_TIMEOUT_MS: process.env.LDAP_IDLE_TIMEOUT_MS || 60000,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN || 'oidc-tests.auth0.com',
  API_AUDIENCE: process.env.API_AUDIENCE || 'https://ldap.desmaximus.com/api',
};

