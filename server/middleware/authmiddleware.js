import JWT from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication failed" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const userToken = JWT.verify(token, process.env.JWT_SECRET_KEY);
    req.body.user = {
      userId: userToken.userId,
    };
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
}; 


export default userAuth;
