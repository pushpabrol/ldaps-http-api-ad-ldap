import dotenv from 'dotenv';
dotenv.config();
export const LDAP_URL = process.env.LDAP_URL || 'ldaps://desmaximus.com:636';
export const LDAP_USER = process.env.LDAP_USER || 'CN=adsdad,desmaximus,DC=com';
export const LDAP_PASSWORD = process.env.LDAP_PASSWORD || 'Wha';
export const LDAP_USERS_OU = process.env.LDAP_USERS_OU || 'DC=desmaximus,DC=com';
export const PORT = process.env.PORT || 8080;
export const LDAP_IDLE_TIMEOUT_MS = process.env.LDAP_IDLE_TIMEOUT_MS || 60000;
export const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || 'oidc-tests.auth0.com';
export const API_AUDIENCE = process.env.API_AUDIENCE || 'https://ldap.desmaximus.com/api';

