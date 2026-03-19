import pg from 'pg';

const { Pool } = pg

const isDev = process.env.NODE_ENV === 'development'

const pool = new Pool({
    user: process.env.dbUser,
    host: process.env.dbHost,
    database: process.env.dbName,
    password: process.env.databasePassword,
    port: process.env.dbPort,
    ssl: { rejectUnauthorized: false }
})

export default pool