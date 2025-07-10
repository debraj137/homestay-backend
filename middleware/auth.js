const jwt = require('jsonwebtoken');

async function verifyToken(req, res, next){
    // console.log('req in verifyToken: ',req)
  const token = req.headers['authorization'];
//   console.log('token: ',token);
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = {verifyToken}
