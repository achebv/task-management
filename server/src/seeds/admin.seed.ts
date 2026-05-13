import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User, UserRole, UserStatus } from '../entities/User';

export const seedAdmin = async (): Promise<void> => {
  const userRepository = AppDataSource.getRepository(User);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Administrator';

  const existingAdmin = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = userRepository.create({
    email: adminEmail,
    password: hashedPassword,
    name: adminName,
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  });

  await userRepository.save(admin);

  console.log('Admin user created successfully');
  console.log(`  Email: ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
};
