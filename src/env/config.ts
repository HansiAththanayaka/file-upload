export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  gql: process.env.STUDENT_SERVICE,
});
