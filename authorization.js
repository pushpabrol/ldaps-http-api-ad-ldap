var { expressjwt: jwt } = require('express-jwt');
var jwks = require('jwks-rsa');
var configuration = require('./configuration');

var jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://" + configuration.AUTH0_DOMAIN + "/.well-known/jwks.json"
    }),
    audience: configuration.API_AUDIENCE,
    issuer: "https://" + configuration.AUTH0_DOMAIN + "/",
    algorithms: ['RS256']
});



// Check Authorization for API calls

var checkAuthorization = function (req, res, next) {

    var requiredPermission = [];
    console.log(req.path);
    switch (req.path) {
        case '/api/login': 
            requiredPermission = ['authenticate:users'];
            break;
        case '/api/delete': 
            requiredPermission = ['delete:users'];
            break;
        case '/api/changepassword': 
            requiredPermission = ['change:password'];
            break;
        case '/api/create': 
            requiredPermission = ['create:users'];
            break;

        default :
        requiredPermission = [];
        break;
    }
    if (requiredPermission.length === 0) next();
    for (var i = 0; i < requiredPermission.length; i++) {
        if (req.user.scope.includes(requiredPermission[i])) {
            next();
        } else {
            res.status(403).send({ message: 'Forbidden', scope_required: requiredPermission, scope_found : req.user.scope  });
        }
    }

}


module.exports = {

jwtCheck : jwtCheck,
checkAuthorization : checkAuthorization

}


