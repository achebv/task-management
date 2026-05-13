export interface ProjectMember {
  id: number;
  name: string;
  email: string;
  addedAt?: Date;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  createdBy: {
    id: number;
    name: string;
  };
  memberCount?: number;
  members?: ProjectMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

export interface AddMemberRequest {
  userId: number;
}
