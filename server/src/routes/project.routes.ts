import { Router } from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
} from '../controllers/project.controller';
import { getProjectTasks, createTask } from '../controllers/task.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', adminMiddleware, createProject);
router.put('/:id', adminMiddleware, updateProject);
router.delete('/:id', adminMiddleware, deleteProject);

router.get('/:id/members', getProjectMembers);
router.post('/:id/members', adminMiddleware, addProjectMember);
router.delete('/:id/members/:userId', adminMiddleware, removeProjectMember);

router.get('/:projectId/tasks', getProjectTasks);
router.post('/:projectId/tasks', createTask);

export default router;
