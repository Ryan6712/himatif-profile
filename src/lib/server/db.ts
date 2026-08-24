import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client.js";
import { DATABASE_HOST, DATABASE_PASSWORD, DATABASE_NAME, DATABASE_USER } from "$env/static/private";

const adapter = new PrismaMariaDb({
  host: DATABASE_HOST,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  
});
const prisma = new PrismaClient({ adapter });

export { prisma };

