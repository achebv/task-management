import { DataSource } from 'typeorm';
import { User, Project, ProjectMember, Task } from '../entities';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'parola123',
  database: process.env.DB_NAME || 'project_manager',
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Project, ProjectMember, Task],
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('Connected to MySQL database');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};
