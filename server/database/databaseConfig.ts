import pg from 'pg';

const { Pool } = pg

function getEnvValue(...names: string[]) {
    for (const name of names) {
        const value = process.env[name]
        if (typeof value === 'string' && value.length > 0) {
            return value
        }
    }
    return undefined
}

function requireEnvValue(label: string, ...names: string[]) {
    const value = getEnvValue(...names)
    if (!value) {
        throw new Error(`Missing required environment variable for ${label}. Checked: ${names.join(', ')}`)
    }
    return value
}

const dbUser = requireEnvValue('database user', 'dbUser', 'DB_USER')
const dbHost = requireEnvValue('database host', 'dbHost', 'DB_HOST')
const dbName = requireEnvValue('database name', 'dbName', 'DB_NAME')
const dbPassword = requireEnvValue('database password', 'databasePassword', 'DB_PASSWORD', 'DATABASE_PASSWORD')
const dbPortValue = requireEnvValue('database port', 'dbPort', 'DB_PORT')
const dbPort = Number(dbPortValue)

if (Number.isNaN(dbPort)) {
    throw new Error(`Invalid database port: ${dbPortValue}`)
}

const pool = new Pool({
    user: dbUser,
    host: dbHost,
    database: dbName,
    password: dbPassword,
    port: dbPort,
    ssl: { rejectUnauthorized: false }
})

export default pool