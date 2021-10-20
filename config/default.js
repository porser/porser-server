const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
  host: "localhost",
  port: 3030,
  paginate: {
    default: 10,
    max: 50
  },
  ts: true,
  authentication: {
    entity: "user",
    service: "users",
    secret: JWT_SECRET,
    authStrategies: ["jwt", "local"],
    jwtOptions: {
      header: { typ: "access" },
      audience: "https://yourdomain.com",
      issuer: "feathers",
      algorithm: "HS256",
      expiresIn: "1d"
    },
    local: {
      usernameField: "email",
      passwordField: "password"
    }
  },
  nedb: "../data"
};
