module.exports = {
  apps: [
    {
      name: "syncmeet-backend",
      script: "./src/app.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 8000,
      },
    },
  ],
};
