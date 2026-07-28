import { execSync } from 'child_process';
import { clearDatabase } from 'e2e/e2e-auth/helpers/db';

async function globalSetup() {
  console.log(`[Global setup] Starting test environment preparation...`);
  try {
    await clearDatabase();
    console.log(
      `[Global Setup] The database has been successfully prepared for testing.`,
    );
    execSync('npm run seed', { stdio: 'inherit' });
    console.log(
      '[Global Setup] Test database successfully cleared and seeded.',
    );
  } catch (error) {
    console.error('[Global Setup] Error while clearing the database:', error);
    process.exit(1);
  }
}
export default globalSetup;
