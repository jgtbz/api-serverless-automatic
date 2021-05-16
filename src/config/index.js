export default {
  project: process.env.PROJECT,
  aws: {
    id: process.env.AWS_ID,
    region: process.env.AWS_REGION
  },
  stage: process.env.STAGE
}
