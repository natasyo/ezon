import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: String(process.env.DATABASE_URL),
  }),
});
export async function clearDatabase() {
  const tablesName = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables
    WHERE schemaname='public' AND tablename NOT IN ('_prisma_migrations')
  `;
  const tables = tablesName.map((t) => `"${t.tablename}"`).join(', ');
  if (tables) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${tables}  RESTART IDENTITY CASCADE;`,
    );
    console.log('The database has been successfully cleaned.');
  }
  console.log(tables);
}
