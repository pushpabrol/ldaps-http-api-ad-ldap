# ad-ldap-api-https


- A project showing how to use a HTTP API template for hosting a custom database connection to AD using LDAP. This API is called via the auth0 custom database login script to login, create , update , change password of the user


- The required settings in the .env file ( please rename .env.sample to .env)
```
LDAP_URL :'ldap://xxxxx:389', -- The LDAP Url
LDAP_USER: 'cn=admin,dc=...,dc=...,dc=com', -- The bind ID to communicate with LDAP
LDAP_PASSWORD: '...', -- The bind password for the admin account above
LDAP_USERS_OU: 'ou=users,dc=...,dc=...,dc=com', -- The users OU
PORT: 8080
LDAP_IDLE_TIMEOUT_MS: 300 // In seconds - Set this to a value lower than the ldap idle timeout
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

# API Usage

- [Endpoints](#endpoints)
  - [Create User](#create-user)
  - [User Login](#user-login)
  - [Delete User](#delete-user)
  - [Get User Information](#get-user-information)
  - [Change Password](#change-password)
  - [Set Email Verified](#set-email-verified)

## Endpoints

### Create User

- **Endpoint:** `/api/create`
- **Method:** POST
- **Description:** This endpoint allows you to create a new user account. Users can provide their registration information, including **username**, **password**,**given_name**, **family_name** and **email** in the request body. At a minimum **email** and **password** are required. 
- This is the logic that is used to map the data provided to the LDAP record - https://github.com/pushpabrol/ldaps-http-api-ad-ldap/blob/main/common.js#L166

**Request Example:**
```json
POST /api/create
Authorization: Bearer <your_auth_token_here>
{
  "username": "example_user",
  "password": "secure_password",
  "email": "user@example.com",
  "family_name" : "test",
  "given_name":"user"
 }
```

**Response Example:**
```json
{
    "cn": "example_user",
    "sn": "test",
    "givenName": "user",
    "uid": "example_user",
    "mail": "testadd.user@aduser.com",
    "sAMAccountName": "testadd.user"
}
```

### User Login

- **Endpoint:** `/api/login`
- **Method:** POST
- **Description:** Users can use this endpoint to log in to their accounts by providing their credentials. Either **email** or **username** along with **password** is required
**Request Example:**
```json
POST /api/login
Authorization: Bearer <your_auth_token_here>
{
  "username": "example_user",
  "password": "secure_password"
}
```

**Response Example:**
```json
{
    "user_id": "889db215-1da7-42a4-bd14-638a9067386e",
    "family_name": "test",
    "given_name": "user",
    "nickname": "testadd.user@aduser.com",
    "email": "testadd.user@aduser.com",
    "email_verified": true
}
or 
HTTP 401
{
    "error": "Invalid Credentials"
}
```

### Delete User

- **Endpoint:** `/api/delete`
- **Method:** POST
- **Description:** This endpoint allows to delete user accounts by **id**. Users need to provide their authentication token in the request headers for authentication. In this sample the AD objectGUID is returned as user_id and is the id to use for deletion 

**Request Example:**
```json
POST /api/delete
Authorization: Bearer <your_auth_token_here>
{
    "id": "889db215-1da7-42a4-bd14-638a9067386e"
}
```

**Response Example:**
```json
{
    "success": true
}
```

### Get User

- **Endpoint:** `/api/getuser`
- **Method:** POST
- **Description:** Users information using this endpoint. Authentication is required, and caller must include their authentication token in the request headers.Either **email** or **username** is required to be passed in the body

**Request Example:**
```json
POST /api/getuser
Authorization: Bearer your_auth_token_here
{
     "email" : "testadd.user@aduser.com"   
}
or
{
     "username" : "testadd.user"   
}
```

**Response Example:**
```json
{
    "user_id": "889db215-1da7-42a4-bd14-638a9067386e",
    "family_name": "testadd.user",
    "given_name": "testadd.user",
    "nickname": "testadd.user@aduser.com",
    "email": "testadd.user@aduser.com",
    "email_verified": true
}
```

### Change Password

- **Endpoint:** `/api/changepassword`
- **Method:** POST
- **Description:** this endpoint is to change account password. Caller must provide new passwords in the request body along with email or username and include their authentication token in the request headers.Either **email** or **username** along with the new password  **new_password** is required

**Request Example:**
```json
POST /api/changepassword
Authorization: Bearer your_auth_token_here
{
   "email": "",
  "new_password": "new_secure_password"
}
or
{
   "username": "",
  "new_password": "new_secure_password"
}
```

**Response Example:**
```json
{
    "status": true
}
```

### Set Email Verified

- **Endpoint:** `/api/set-email-verified`
- **Method:** POST
- **Description:** TO DO







#### Note - This is only a development version of the service. In production this should only run over HTTPS
#### Note - TO create, modify in AD the ldap has to be over ssl , i.e simple ldaps is required