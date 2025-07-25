export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] ;

  console.log("🟡 Auth Header:", authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log("🔐 Received Token:", token);

  const JWT_SECRET = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.userType = decoded.role; // Assuming the role is stored in the token
    console.log("✅ Token verified, user ID:", req.userId, "User Type:", req.userType);
    next();
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};



