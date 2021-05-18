export default {
  project: process.env.PROJECT,
  database: {
    URI: process.env.DATABASE_URI
  },
  server: {
    secret: process.env.SERVER_SECRET
  },
  aws: {
    id: process.env.AWS_ID,
    region: process.env.AWS_REGION
  },
  stage: process.env.STAGE
}
