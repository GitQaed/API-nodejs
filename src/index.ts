import fastify from "fastify";
import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import fastifyMongodb from "@fastify/mongodb";
import { usersRoute } from "./Routes/users.routes";

const app = fastify();
const port = parseInt(process.env.PORT || "5353");
const host = process.env.HOST;
const dbUrl = process.env.DB_URL;
const tokenSecret = process.env.TOKEN_SECRET;

app.register(fastifyMongodb, {
  url: dbUrl,
  database: "test_a",
});

app.register(fastifyJwt, {
  secret: tokenSecret || "tokenSecret",
});

app.register(fp(usersRoute));

app.listen({ port: port, host: host }, () => {
  console.log(`En écoute sur http://${host}:${port}`);
});
