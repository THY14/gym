export const checkRole = (roles) => {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!role) {
      return res.status(403).json({ message: 'Access denied. No role found.', error: 'Missing role' });
    }

    if (roles.includes(role)) {
      return next();
    } else {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.', error: `Role ${role} not allowed` });
    }
  };
};