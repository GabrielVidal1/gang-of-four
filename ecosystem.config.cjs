module.exports = {
  apps: [
    {
      name: "front",
      script: "npm run dev",
      env: { DEBUG_COLORS: true, FORCE_COLOR: 1 },
    },
    {
      name: "api",
      script: "make up.api",
      env: { DEBUG_COLORS: true, FORCE_COLOR: 1 },
    },
  ],
};
