# ldap-api-http


- A project showing how to use a HTTP API template for hosting a custom database connection to LDAP. This API is called via the auth0 custom database login script to login the user


 
 
- The required settings in the configuration.js ( please rename configuration.sample.js to configuration.js)
```
LDAP_URL :'ldap://xxxxx:389', -- The LDAP Url
LDAP_USER: 'cn=admin,dc=...,dc=...,dc=com', -- The bind ID to communicate with LDAP
LDAP_PASSWORD: '...', -- The bind password for the admin account above
LDAP_USERS_OU: 'ou=users,dc=...,dc=...,dc=com', -- The users OU
PORT: 8080
LDAP_HEARTBEAT_SECONDS: 300 // In seconds - Set this to a value lower than the ldap idle timeout
AUTH0_DOMAIN: 'xxx.auth0.com', -- auth0 domain
API_AUDIENCE: 'https://ldap.api.com/api' - The identifier of this API as defined within Auth0

```
## How to use
- Download or clone the project
- Run npm install to download the dependencies from npm
- Go to the project directory and rename configuration.sample.js to configuration.js and set the required settings to your LDAP there
- Run the application with `node index.js`

```
Test the API to login a user as shown below:

1. Cretate a new API in Auth0 under https://manage.auth0.com/#/apis
2. Note the `Identifier` in the Auth0 API settings. This identifier is the API_AUDIENCE setting within the configuration
3. Define the following scopes for the API in Auth0:

        -- delete:users
        -- create:users
        -- change:password
        -- authenticate:users

 
4. Next create a new Non Interactive Client in Auth0.

5. Unde the API in Auth0 Management console authorize this non interactive client to have some scopes for the API

6. Use the client credentials grant flow to obtain an access token for this API

curl --request POST \
  --url https://tenant.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{"client_id":"client_id","client_secret":"client_secret","audience":"https://ldap.api.com/api","grant_type":"client_credentials"}'


7. Use the access_token received in the step 6 as Bearer header to call the API:

    curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer access_token" -H     "Cache-Control: no-cache" -d '{
            "email" :"johnfoo1@gmail.com",
            "password" : "password"
}' "https://ldap.api.com/api/login"


```
Test the other endpoints too:

```
/api/create
/api/login
/api/delete
/api/getuser
/api/changepassword
/api/verify_email
```


#### Note - This is only a development version of the service. In production this should only run over HTTPS and should have a caching layer to keep a LDAP Connection open for re use
