const MAX_PARAMS = 10;

const DB_SCHEMA = {
    tables: {
        pixels: {
            name: 'pixels',
            columns: {
                id: 'TEXT PRIMARY KEY',
                created_at: 'INTEGER',
                expires_at: 'INTEGER'
            }
        },
        events: {
            name: 'events',
            columns: {
                id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
                pixel_id: 'TEXT',
                timestamp: 'INTEGER',
                ip_hash: 'TEXT',
                country: 'TEXT',
                region: 'TEXT',
                browser: 'TEXT',
                os: 'TEXT',
                device_type: 'TEXT',
                params: 'TEXT',
                notes: 'TEXT'
            }
        }
    }
};

module.exports = { DB_SCHEMA, MAX_PARAMS };