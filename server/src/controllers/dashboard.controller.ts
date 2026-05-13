import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Project } from '../entities/Project';
import { Task, TaskStatus } from '../entities/Task';
import { User, UserRole } from '../entities/User';
import { ProjectMember } from '../entities/ProjectMember';
import { AuthRequest } from '../middleware/auth.middleware';

const projectRepository = () => AppDataSource.getRepository(Project);
const taskRepository = () => AppDataSource.getRepository(Task);
const userRepository = () => AppDataSource.getRepository(User);
const memberRepository = () => AppDataSource.getRepository(ProjectMember);

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const isAdmin = req.user.role === UserRole.ADMIN;

    let projectCount: number;
    let taskStats: { status: TaskStatus; count: number }[];
    let recentProjects: Project[];

    if (isAdmin) {
      projectCount = await projectRepository().count();

      taskStats = await taskRepository()
        .createQueryBuilder('task')
        .select('task.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('task.status')
        .getRawMany();

      recentProjects = await projectRepository().find({
        relations: ['createdBy'],
        order: { createdAt: 'DESC' },
        take: 5,
      });
    } else {
      const memberships = await memberRepository().find({
        where: { userId: req.user.id },
        select: ['projectId'],
      });

      const projectIds = memberships.map((m) => m.projectId);

      projectCount = projectIds.length;

      if (projectIds.length > 0) {
        taskStats = await taskRepository()
          .createQueryBuilder('task')
          .select('task.status', 'status')
          .addSelect('COUNT(*)', 'count')
          .where('task.projectId IN (:...projectIds)', { projectIds })
          .groupBy('task.status')
          .getRawMany();

        recentProjects = await projectRepository()
          .createQueryBuilder('project')
          .leftJoinAndSelect('project.createdBy', 'createdBy')
          .where('project.id IN (:...projectIds)', { projectIds })
          .orderBy('project.createdAt', 'DESC')
          .take(5)
          .getMany();
      } else {
        taskStats = [];
        recentProjects = [];
      }
    }

    const tasksByStatus = {
      todo: 0,
      in_progress: 0,
      done: 0,
    };

    taskStats.forEach((stat) => {
      tasksByStatus[stat.status as keyof typeof tasksByStatus] = parseInt(stat.count as unknown as string);
    });

    const totalTasks = tasksByStatus.todo + tasksByStatus.in_progress + tasksByStatus.done;

    let userCount: number | undefined;
    if (isAdmin) {
      userCount = await userRepository().count();
    }

    res.json({
      projectCount,
      taskStats: {
        total: totalTasks,
        ...tasksByStatus,
      },
      recentProjects: recentProjects.map((p) => ({
        id: p.id,
        name: p.name,
        createdBy: {
          id: p.createdBy.id,
          name: p.createdBy.name,
        },
        createdAt: p.createdAt,
      })),
      ...(isAdmin && { userCount }),
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
