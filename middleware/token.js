import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, "SECRET_KEY");

    req.user = decoded; // { id, role }
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;
