import { createDatabaseConnection } from './database/connection.js';
import { runMigrations } from './database/migrations.js';
import { seedDatabase } from './database/seeder.js';

let databaseInstance = null;

export function getDatabase() {
  if (!databaseInstance) {
    databaseInstance = createDatabaseConnection();
  }
  return databaseInstance;
}

export function initDatabase(database = getDatabase()) {
  runMigrations(database);
  seedDatabase(database);
  return database;
}

export const db = new Proxy({}, {
  get(target, prop) {
    const database = getDatabase();
    const value = database[prop];
    return typeof value === 'function' ? value.bind(database) : value;
  }
});
