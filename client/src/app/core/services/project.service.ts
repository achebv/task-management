import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Project,
  ProjectMember,
  CreateProjectRequest,
  UpdateProjectRequest,
  AddMemberRequest,
} from '../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly apiUrl = 'http://localhost:3000/api/projects';

  constructor(private http: HttpClient) {}

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  createProject(data: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, data);
  }

  updateProject(id: number, data: UpdateProjectRequest): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, data);
  }

  deleteProject(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  getProjectMembers(id: number): Observable<ProjectMember[]> {
    return this.http.get<ProjectMember[]>(`${this.apiUrl}/${id}/members`);
  }

  addProjectMember(projectId: number, data: AddMemberRequest): Observable<{ message: string; member: ProjectMember }> {
    return this.http.post<{ message: string; member: ProjectMember }>(`${this.apiUrl}/${projectId}/members`, data);
  }

  removeProjectMember(projectId: number, userId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${projectId}/members/${userId}`);
  }
}
