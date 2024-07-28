import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";

const swaggerApp = new Hono().get("/", swaggerUI({ url: "/doc" }));

export default swaggerApp;
