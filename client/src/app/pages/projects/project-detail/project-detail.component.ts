import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { ProjectService } from '../../../core/services/project.service';
import { TaskService } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project, Task, User } from '../../../shared/models';
import { TaskFormDialogComponent } from '../../tasks/task-form/task-form-dialog.component';
import { AddMemberDialogComponent } from './add-member-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule,
  ],
  template: `
    <div class="project-detail-page">
      @if (loading) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (project) {
        <div class="page-header">
          <div>
            <a mat-button routerLink="/projects">
              <mat-icon>arrow_back</mat-icon>
              Back to Projects
            </a>
            <h1>{{ project.name }}</h1>
            <p class="description">{{ project.description || 'No description' }}</p>
          </div>
          <button mat-raised-button color="primary" (click)="openTaskDialog()">
            <mat-icon>add</mat-icon>
            Add Task
          </button>
        </div>

        <mat-tab-group>
          <mat-tab label="Tasks ({{ tasks.length }})">
            <div class="tab-content">
              @if (tasks.length === 0) {
                <div class="empty-state">
                  <mat-icon>assignment</mat-icon>
                  <p>No tasks yet</p>
                  <button mat-raised-button color="primary" (click)="openTaskDialog()">Create first task</button>
                </div>
              } @else {
                <div class="task-columns">
                  <div class="task-column">
                    <h3><mat-icon>pending_actions</mat-icon> To Do ({{ getTasksByStatus('todo').length }})</h3>
                    @for (task of getTasksByStatus('todo'); track task.id) {
                      <mat-card class="task-card" (click)="openTaskDialog(task)">
                        <mat-card-content>
                          <div class="task-header">
                            <span class="task-title">{{ task.title }}</span>
                            <span class="priority" [class]="task.priority">{{ task.priority }}</span>
                          </div>
                          @if (task.assignedTo) {
                            <span class="assignee">{{ task.assignedTo.name }}</span>
                          }
                          @if (task.dueDate) {
                            <span class="due-date"><mat-icon>event</mat-icon> {{ task.dueDate | date:'shortDate' }}</span>
                          }
                        </mat-card-content>
                      </mat-card>
                    }
                  </div>

                  <div class="task-column">
                    <h3><mat-icon>autorenew</mat-icon> In Progress ({{ getTasksByStatus('in_progress').length }})</h3>
                    @for (task of getTasksByStatus('in_progress'); track task.id) {
                      <mat-card class="task-card" (click)="openTaskDialog(task)">
                        <mat-card-content>
                          <div class="task-header">
                            <span class="task-title">{{ task.title }}</span>
                            <span class="priority" [class]="task.priority">{{ task.priority }}</span>
                          </div>
                          @if (task.assignedTo) {
                            <span class="assignee">{{ task.assignedTo.name }}</span>
                          }
                          @if (task.dueDate) {
                            <span class="due-date"><mat-icon>event</mat-icon> {{ task.dueDate | date:'shortDate' }}</span>
                          }
                        </mat-card-content>
                      </mat-card>
                    }
                  </div>

                  <div class="task-column">
                    <h3><mat-icon>check_circle</mat-icon> Done ({{ getTasksByStatus('done').length }})</h3>
                    @for (task of getTasksByStatus('done'); track task.id) {
                      <mat-card class="task-card done" (click)="openTaskDialog(task)">
                        <mat-card-content>
                          <div class="task-header">
                            <span class="task-title">{{ task.title }}</span>
                            <span class="priority" [class]="task.priority">{{ task.priority }}</span>
                          </div>
                          @if (task.assignedTo) {
                            <span class="assignee">{{ task.assignedTo.name }}</span>
                          }
                        </mat-card-content>
                      </mat-card>
                    }
                  </div>
                </div>
              }
            </div>
          </mat-tab>

          <mat-tab label="Members ({{ project.members?.length || 0 }})">
            <div class="tab-content">
              <div class="members-header">
                @if (authService.isAdmin()) {
                  <button mat-raised-button color="primary" (click)="openAddMemberDialog()">
                    <mat-icon>person_add</mat-icon>
                    Add Member
                  </button>
                }
              </div>
              <mat-list>
                @for (member of project.members; track member.id) {
                  <mat-list-item>
                    <mat-icon matListItemIcon>person</mat-icon>
                    <span matListItemTitle>{{ member.name }}</span>
                    <span matListItemLine>{{ member.email }}</span>
                    @if (authService.isAdmin()) {
                      <button mat-icon-button color="warn" (click)="removeMember(member.id)">
                        <mat-icon>remove_circle</mat-icon>
                      </button>
                    }
                  </mat-list-item>
                }
              </mat-list>
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .project-detail-page {
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;

        h1 { margin: 8px 0; }
        .description { color: #666; margin: 0; }
      }
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .empty-state {
      text-align: center;
      padding: 48px;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #ccc;
      }

      p { color: #666; margin: 16px 0; }
    }

    .task-columns {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;

      .task-column {
        background: #f5f5f5;
        border-radius: 8px;
        padding: 16px;
        min-height: 200px;

        h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 16px 0;
          font-size: 14px;
          color: #666;

          mat-icon { font-size: 18px; width: 18px; height: 18px; }
        }
      }
    }

    .task-card {
      margin-bottom: 8px;
      cursor: pointer;
      transition: box-shadow 0.2s;

      &:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
      &.done { opacity: 0.7; }

      .task-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
      }

      .task-title {
        font-weight: 500;
        flex: 1;
      }

      .priority {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        text-transform: uppercase;

        &.low { background: #e8f5e9; color: #388e3c; }
        &.medium { background: #fff3e0; color: #f57c00; }
        &.high { background: #ffebee; color: #d32f2f; }
      }

      .assignee {
        font-size: 12px;
        color: #666;
        display: block;
      }

      .due-date {
        font-size: 12px;
        color: #666;
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 4px;

        mat-icon { font-size: 14px; width: 14px; height: 14px; }
      }
    }

    .members-header {
      margin-bottom: 16px;
    }
  `],
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  tasks: Task[] = [];
  loading = true;
  projectId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private taskService: TaskService,
    public authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProject();
    this.loadTasks();
  }

  loadProject(): void {
    this.projectService.getProject(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Failed to load project', 'Close', { duration: 3000 });
        this.router.navigate(['/projects']);
      },
    });
  }

  loadTasks(): void {
    this.taskService.getProjectTasks(this.projectId).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.cdr.detectChanges();
      },
    });
  }

  getTasksByStatus(status: string): Task[] {
    return this.tasks.filter((t) => t.status === status);
  }

  openTaskDialog(task?: Task): void {
    const dialogRef = this.dialog.open(TaskFormDialogComponent, {
      width: '500px',
      data: { task, projectId: this.projectId, members: this.project?.members || [] },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        setTimeout(() => this.loadTasks());
      }
    });
  }

  openAddMemberDialog(): void {
    const dialogRef = this.dialog.open(AddMemberDialogComponent, {
      width: '400px',
      data: { projectId: this.projectId, existingMembers: this.project?.members || [] },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        setTimeout(() => this.loadProject());
      }
    });
  }

  removeMember(userId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Remove Member',
        message: 'Are you sure you want to remove this member from the project?',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.projectService.removeProjectMember(this.projectId, userId).subscribe({
          next: () => {
            this.snackBar.open('Member removed', 'Close', { duration: 3000 });
            setTimeout(() => this.loadProject());
          },
          error: (error) => {
            this.snackBar.open(error.error?.message || 'Failed to remove member', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }
}
