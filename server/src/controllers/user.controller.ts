import { Response } from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { AuthRequest } from '../middleware/auth.middleware';

const userRepository = () => AppDataSource.getRepository(User);

export const getUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await userRepository().find({
      select: ['id', 'email', 'name', 'role', 'status', 'createdAt', 'updatedAt'],
      order: { createdAt: 'DESC' },
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await userRepository().findOne({
      where: { id: parseInt(id) },
      select: ['id', 'email', 'name', 'role', 'status', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name, role, status } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ message: 'Email, password and name are required' });
      return;
    }

    const existingUser = await userRepository().findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = userRepository().create({
      email,
      password: hashedPassword,
      name,
      role: role || 'user',
      status: status || 'active',
    });

    await userRepository().save(user);

    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, password, name, role, status } = req.body;

    const user = await userRepository().findOne({ where: { id: parseInt(id) } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (email && email !== user.email) {
      const existingUser = await userRepository().findOne({ where: { email } });
      if (existingUser) {
        res.status(400).json({ message: 'Email already in use' });
        return;
      }
      user.email = email;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (status) user.status = status;

    await userRepository().save(user);

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user && req.user.id === parseInt(id)) {
      res.status(400).json({ message: 'Cannot delete your own account' });
      return;
    }

    const result = await userRepository().delete(parseInt(id));

    if (result.affected === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
