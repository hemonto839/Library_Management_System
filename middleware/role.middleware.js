// authorizeRoles middleware factory
// Usage: authorizeRoles("admin", "librarian")
// Must be used AFTER the protect middleware so that req.user is already set.
function authorizeRoles(...roles) {
    return function (req, res, next) {
        if (!req.user) {
            return res.status(401).json({
                message: "Not authorized",
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Allowed roles: ${roles.join(", ")}`,
            });
        }

        next();
    };
}

module.exports = { authorizeRoles };
