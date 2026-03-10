import pg from 'pg';

const { Pool } = pg

const pool = new Pool({
    user: process.env.dbUser,
    host: process.env.dbHost,
    database: process.env.dbName,
    password: process.env.databasePassword,
    port: process.env.dbPort
})

export default pool