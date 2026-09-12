import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication required" });
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);

    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export const roles =
  (...allowed) =>
  (req, res, next) => {
    if (allowed.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      message: "Insufficient permission",
    });
  };

export const permission =
  (allowedRoles = []) =>
  (req, res, next) => {
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      message: "Insufficient permission",
    });
  };