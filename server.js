const fs = require("fs");
const path = require("path");
const app = require("fastify")({ logger: false });

app.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

app.get("/", async (req, res) => {
  return res.send("hello");
});

app.listen({ port: 9876, host: "127.0.0.1" });
