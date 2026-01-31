import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /*
      decoded contains:
      {
        id: user._id,
        role: "student" | "tutor",
        name,
        email
      }
    */
    req.user = decoded;

    next();
  } catch (err) {
    console.error("JWT ERROR:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;
