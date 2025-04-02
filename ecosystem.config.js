module.exports = {
  apps: [
    {
      name: "REST SERVER",
      script: "./dist/src/server.js", // הנתיב הנכון אחרי קומפילציה
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
