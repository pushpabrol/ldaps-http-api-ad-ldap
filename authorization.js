import { expressjwt as jwt } from 'express-jwt';
import { expressJwtSecret } from 'jwks-rsa';
import { AUTH0_DOMAIN, API_AUDIENCE } from './configuration.js';

export const jwtCheck = jwt({
    secret: expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://" + AUTH0_DOMAIN + "/.well-known/jwks.json"
    }),
    audience: API_AUDIENCE,
    issuer: "https://" + AUTH0_DOMAIN + "/",
    algorithms: ['RS256']
});



// Check Authorization for API calls

export const checkAuthorization = function (req, res, next) {

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




