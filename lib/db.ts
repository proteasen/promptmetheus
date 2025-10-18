let PrismaClient: any
let prisma: any

function initializePrisma() {
  try {
    // Use require for synchronous import during build
    const PrismaModule = require("@prisma/client")
    PrismaClient = PrismaModule.PrismaClient

    const globalForPrisma = globalThis as unknown as {
      prisma: any | undefined
    }

    prisma = globalForPrisma.prisma ?? new PrismaClient()

    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

    return prisma
  } catch (error) {
    console.warn("[v0] PrismaClient not available - database operations will be disabled")

    // Create a mock client for preview mode
    return {
      user: { findMany: () => [], findUnique: () => null, create: () => null, update: () => null, delete: () => null },
      apiKey: {
        findMany: () => [],
        findUnique: () => null,
        create: () => null,
        update: () => null,
        delete: () => null,
      },
      project: {
        findMany: () => [],
        findUnique: () => null,
        create: () => null,
        update: () => null,
        delete: () => null,
      },
      chatMessage: {
        findMany: () => [],
        findUnique: () => null,
        create: () => null,
        update: () => null,
        delete: () => null,
      },
      tokenUsage: {
        findMany: () => [],
        findUnique: () => null,
        create: () => null,
        update: () => null,
        delete: () => null,
      },
      auditLog: {
        findMany: () => [],
        findUnique: () => null,
        create: () => null,
        update: () => null,
        delete: () => null,
      },
    }
  }
}

// Initialize Prisma client
prisma = initializePrisma()

export { prisma }
export const db = prisma
