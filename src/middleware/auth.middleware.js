import ApiError from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.js";

const authenticate = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    throw new ApiError(401, "Authentication token is required");
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiError(401, "Invalid authorization header format");
  }

  try {
    const decodedToken = verifyAccessToken(token);

    req.user = decodedToken;

    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired authentication token");
  }
};

export default authenticate;
