// Script to drop transactions and subscriptions tables
const { DataSource } = require('typeorm');

async function dropTables() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'quiz_db',
  });

  try {
    await dataSource.initialize();
    console.log('Connected to database');

    const queryRunner = dataSource.createQueryRunner();
    
    // Drop tables in correct order (foreign key dependencies)
    await queryRunner.query('DROP TABLE IF EXISTS transactions CASCADE');
    console.log('✓ Dropped transactions table');
    
    await queryRunner.query('DROP TABLE IF EXISTS subscriptions CASCADE');
    console.log('✓ Dropped subscriptions table');

    await queryRunner.release();
    await dataSource.destroy();
    
    console.log('✓ Tables dropped successfully - restart payment service to recreate with correct schema');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

dropTables();
