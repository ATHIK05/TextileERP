// Database configuration for SQL Server
export const dbConfig = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'OrangeSizingERP',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
    instanceName: process.env.DB_INSTANCE,
    port: parseInt(process.env.DB_PORT || '1433'),
    connectionTimeout: 60000,
    requestTimeout: 60000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

export const connectionConfig = {
  connectionString: `Server=${dbConfig.server};Database=${dbConfig.database};User Id=${dbConfig.user};Password=${dbConfig.password};Encrypt=${dbConfig.options.encrypt};TrustServerCertificate=${dbConfig.options.trustServerCertificate};Connection Timeout=${dbConfig.options.connectionTimeout};`,
  options: {
    enableArithAbort: dbConfig.options.enableArithAbort,
    trustServerCertificate: dbConfig.options.trustServerCertificate,
    instanceName: dbConfig.options.instanceName,
    port: dbConfig.options.port,
    connectionTimeout: dbConfig.options.connectionTimeout,
    requestTimeout: dbConfig.options.requestTimeout,
  },
  pool: dbConfig.pool,
};