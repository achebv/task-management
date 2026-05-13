import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Task } from '../entities/Task';
import { Project } from '../entities/Project';
import { ProjectMember } from '../entities/ProjectMember';
import { UserRole } from '../entities/User';
import { AuthRequest } from '../middleware/auth.middleware';

const taskRepository = () => AppDataSource.getRepository(Task);
const projectRepository = () => AppDataSource.getRepository(Project);
const memberRepository = () => AppDataSource.getRepository(ProjectMember);

const checkProjectAccess = async (
  projectId: number,
  userId: number,
  userRole: string
): Promise<boolean> => {
  if (userRole === UserRole.ADMIN) return true;

  const membership = await memberRepository().findOne({
    where: { projectId, userId },
  });

  return !!membership;
};

export const getProjectTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const project = await projectRepository().findOne({
      where: { id: parseInt(projectId) },
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const hasAccess = await checkProjectAccess(parseInt(projectId), req.user.id, req.user.role);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const tasks = await taskRepository().find({
      where: { projectId: parseInt(projectId) },
      relations: ['assignedTo', 'createdBy'],
      order: { createdAt: 'DESC' },
    });

    const result = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedTo: task.assignedTo
        ? {
            id: task.assignedTo.id,
            name: task.assignedTo.name,
          }
        : null,
      createdBy: {
        id: task.createdBy.id,
        name: task.createdBy.name,
      },
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));

    res.json(result);
  } catch (error) {
    console.error('Get project tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const task = await taskRepository().findOne({
      where: { id: parseInt(id) },
      relations: ['assignedTo', 'createdBy', 'project'],
    });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const hasAccess = await checkProjectAccess(task.projectId, req.user.id, req.user.role);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    res.json({
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedTo: task.assignedTo
        ? {
            id: task.assignedTo.id,
            name: task.assignedTo.name,
          }
        : null,
      createdBy: {
        id: task.createdBy.id,
        name: task.createdBy.name,
      },
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, dueDate, assignedToId } = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!title) {
      res.status(400).json({ message: 'Task title is required' });
      return;
    }

    const project = await projectRepository().findOne({
      where: { id: parseInt(projectId) },
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const hasAccess = await checkProjectAccess(parseInt(projectId), req.user.id, req.user.role);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    if (assignedToId) {
      const assigneeAccess = await checkProjectAccess(
        parseInt(projectId),
        parseInt(assignedToId),
        UserRole.USER
      );
      if (!assigneeAccess && req.user.role !== UserRole.ADMIN) {
        res.status(400).json({ message: 'Assignee must be a project member' });
        return;
      }
    }

    const task = taskRepository().create({
      projectId: parseInt(projectId),
      title,
      description: description || null,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      assignedToId: assignedToId ? parseInt(assignedToId) : null,
      createdById: req.user.id,
    });

    await taskRepository().save(task);

    res.status(201).json({
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedToId: task.assignedToId,
      createdById: task.createdById,
      createdAt: task.createdAt,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, assignedToId } = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const task = await taskRepository().findOne({
      where: { id: parseInt(id) },
    });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const hasAccess = await checkProjectAccess(task.projectId, req.user.id, req.user.role);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignedToId !== undefined) {
      task.assignedToId = assignedToId ? parseInt(assignedToId) : null;
    }

    await taskRepository().save(task);

    res.json({
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedToId: task.assignedToId,
      updatedAt: task.updatedAt,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const task = await taskRepository().findOne({
      where: { id: parseInt(id) },
    });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const hasAccess = await checkProjectAccess(task.projectId, req.user.id, req.user.role);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    await taskRepository().delete(parseInt(id));

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
