# ldap-api-http


- A project showing how to use a HTTP API template for hosting a custom database connection to LDAP. This API is called via the auth0 custom database login script to login the user


 
 
- The required settings in the configuration.js ( please rename configuration.sample.js to configuration.js)
```
LDAP_URL :'ldap://xxxxx:389', -- The LDAP Url
LDAP_USER: 'cn=admin,dc=...,dc=...,dc=com', -- The bind ID to communicate with LDAP
LDAP_PASSWORD: '...', -- The bind password for the admin account above
LDAP_USERS_OU: 'ou=users,dc=...,dc=...,dc=com', -- The users OU
PORT: 8080

```
## How to use
- Download or clone the project
- Run npm install to download the dependencies from npm
- Go to the project directory and rename configuration.sample.js to configuration.js and set the required settings to your LDAP there
- Run the application with `node index.js`

```
Test the API to create a user as shown below:

curl -X POST -H "Content-Type: application/json" -H "Cache-Control: no-cache" -d '{
            "email": "johnfoo4@gmail.com",
            "username" : "johnfoo4",
            "password": "xxxxxxxx""
   
   
}' "http://localhost:8080/api/create"

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

