import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User, UserStatus } from '../entities/User';
import { AuthRequest } from '../middleware/auth.middleware';

const userRepository = () => AppDataSource.getRepository(User);

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await userRepository().findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name', 'role', 'status'],
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    if (user.status !== UserStatus.ACTIVE) {
      res.status(401).json({ message: 'Account is not active. Please contact admin.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    req.session.user = sessionUser;

    res.json({
      message: 'Login successful',
      user: sessionUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

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
      status: UserStatus.INACTIVE,
    });

    await userRepository().save(user);

    res.status(201).json({
      message: 'Registration successful. Please wait for admin approval.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: 'Could not logout' });
        return;
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logout successful' });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await userRepository().findOne({
      where: { id: req.user.id },
      select: ['id', 'email', 'name', 'role', 'status', 'createdAt'],
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
