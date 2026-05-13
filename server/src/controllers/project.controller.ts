import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Project } from '../entities/Project';
import { ProjectMember } from '../entities/ProjectMember';
import { User, UserRole } from '../entities/User';
import { AuthRequest } from '../middleware/auth.middleware';

const projectRepository = () => AppDataSource.getRepository(Project);
const memberRepository = () => AppDataSource.getRepository(ProjectMember);
const userRepository = () => AppDataSource.getRepository(User);

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    let projects: Project[];

    if (req.user.role === UserRole.ADMIN) {
      projects = await projectRepository().find({
        relations: ['createdBy', 'members', 'members.user'],
        order: { createdAt: 'DESC' },
      });
    } else {
      projects = await projectRepository()
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.createdBy', 'createdBy')
        .leftJoinAndSelect('project.members', 'members')
        .leftJoinAndSelect('members.user', 'user')
        .innerJoin('project.members', 'membership', 'membership.userId = :userId', {
          userId: req.user.id,
        })
        .orderBy('project.createdAt', 'DESC')
        .getMany();
    }

    const result = projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      createdBy: {
        id: project.createdBy.id,
        name: project.createdBy.name,
      },
      memberCount: project.members?.length || 0,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));

    res.json(result);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const project = await projectRepository().findOne({
      where: { id: parseInt(id) },
      relations: ['createdBy', 'members', 'members.user'],
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    if (req.user.role !== UserRole.ADMIN) {
      const isMember = project.members.some((m) => m.userId === req.user!.id);
      if (!isMember) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
    }

    res.json({
      id: project.id,
      name: project.name,
      description: project.description,
      createdBy: {
        id: project.createdBy.id,
        name: project.createdBy.name,
      },
      members: project.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        addedAt: m.addedAt,
      })),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!name) {
      res.status(400).json({ message: 'Project name is required' });
      return;
    }

    const project = projectRepository().create({
      name,
      description: description || null,
      createdById: req.user.id,
    });

    await projectRepository().save(project);

    res.status(201).json({
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await projectRepository().findOne({ where: { id: parseInt(id) } });
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;

    await projectRepository().save(project);

    res.json({
      id: project.id,
      name: project.name,
      description: project.description,
      updatedAt: project.updatedAt,
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await projectRepository().delete(parseInt(id));

    if (result.affected === 0) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProjectMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const project = await projectRepository().findOne({
      where: { id: parseInt(id) },
      relations: ['members', 'members.user'],
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    if (req.user.role !== UserRole.ADMIN) {
      const isMember = project.members.some((m) => m.userId === req.user!.id);
      if (!isMember) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
    }

    const members = project.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      addedAt: m.addedAt,
    }));

    res.json(members);
  } catch (error) {
    console.error('Get project members error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addProjectMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    const project = await projectRepository().findOne({ where: { id: parseInt(id) } });
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const user = await userRepository().findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const existingMember = await memberRepository().findOne({
      where: { projectId: parseInt(id), userId: parseInt(userId) },
    });

    if (existingMember) {
      res.status(400).json({ message: 'User is already a member of this project' });
      return;
    }

    const member = memberRepository().create({
      projectId: parseInt(id),
      userId: parseInt(userId),
    });

    await memberRepository().save(member);

    res.status(201).json({
      message: 'Member added successfully',
      member: {
        id: user.id,
        name: user.name,
        email: user.email,
        addedAt: member.addedAt,
      },
    });
  } catch (error) {
    console.error('Add project member error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeProjectMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, userId } = req.params;

    const result = await memberRepository().delete({
      projectId: parseInt(id),
      userId: parseInt(userId),
    });

    if (result.affected === 0) {
      res.status(404).json({ message: 'Member not found in project' });
      return;
    }

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove project member error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
