export const checkRole = (roles) => {
    return (req, res, next) => {
        const userType = req.user?.userType ;

        if (!userType) {
            return res.status(403).json({ message: 'Access denied. No role found.' });
        }

        if (roles.includes(userType)) {
            return next();
        } else {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }
    };
}