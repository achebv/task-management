export interface DashboardStats {
  projectCount: number;
  taskStats: {
    total: number;
    todo: number;
    in_progress: number;
    done: number;
  };
  recentProjects: {
    id: number;
    name: string;
    createdBy: {
      id: number;
      name: string;
    };
    createdAt: Date;
  }[];
  userCount?: number;
}
