import { PrismaClient } from "@prisma/client";

const PrismaClientSingleton = () => {
  return new PrismaClient();
};

global.PrismaGlobal = global.PrismaGlobal || PrismaClientSingleton();

const prisma = global.PrismaGlobal;

export default prisma;
