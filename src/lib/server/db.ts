import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client.js";
import { DATABASE_HOST, DATABASE_PASSWORD, DATABASE_NAME, DATABASE_USER, DATABASE_PORT } from "$env/static/private";

const adapter = new PrismaMariaDb({
  host: DATABASE_HOST,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  port: Number(DATABASE_PORT),
  ssl: {
        rejectUnauthorized: false
  }
});
const prisma = new PrismaClient({ adapter });

export { prisma };

