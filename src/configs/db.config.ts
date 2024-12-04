export interface IDatabaseConfig {
  host: string;
  port: number;
  uri: string;
}

export const databaseConfig = () => ({
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    uri: process.env.DATABASE_URL,
  },
});
