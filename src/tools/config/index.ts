export const config = () => ({
  port: parseInt(process.env.PORT!, 10) || 4000,
  database: {
    url: process.env.DATABASE_URL!,
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT!,
    region: process.env.S3_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET || 'ezon-uploads',
  },
  session: {
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  },
});
