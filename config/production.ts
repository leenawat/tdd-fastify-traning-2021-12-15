export default {
  myEnv: 'production',
  serverPort: 8080,
  database: {
    client: 'mysql2',
    port: 3306,
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'db-prod',
  },
  jwt: {
    secret: 'superscretkey',
  },
  uploadDir: 'uploads-prod',
  profileDir: 'profile',
}
