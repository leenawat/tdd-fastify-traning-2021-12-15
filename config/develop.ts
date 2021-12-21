export default {
  myEnv: 'develop',
  serverPort: 8080,
  database: {
    client: 'mysql2',
    port: 3306,
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'db-develop',
  },
  jwt: {
    secret: 'superscretkey',
  },
  uploadDir: 'uploads-dev',
  profileDir: 'profile',
}

