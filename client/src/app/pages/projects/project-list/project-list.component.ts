import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project } from '../../../shared/models';
import { ProjectFormDialogComponent } from '../project-form/project-form-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="project-list-page">
      <div class="page-header">
        <h1>Projects</h1>
        @if (authService.isAdmin()) {
          <button mat-raised-button color="primary" (click)="openProjectDialog()">
            <mat-icon>add</mat-icon>
            New Project
          </button>
        }
      </div>

      @if (loading) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (projects.length === 0) {
        <mat-card class="empty-state">
          <mat-card-content>
            <mat-icon>folder_off</mat-icon>
            <p>No projects found</p>
            @if (authService.isAdmin()) {
              <button mat-raised-button color="primary" (click)="openProjectDialog()">Create your first project</button>
            }
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="projects-grid">
          @for (project of projects; track project.id) {
            <mat-card class="project-card">
              <mat-card-header>
                <mat-icon mat-card-avatar>folder</mat-icon>
                <mat-card-title>
                  <a [routerLink]="['/projects', project.id]">{{ project.name }}</a>
                </mat-card-title>
                <mat-card-subtitle>by {{ project.createdBy.name }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p class="description">{{ project.description || 'No description' }}</p>
                <div class="meta">
                  <span><mat-icon>people</mat-icon> {{ project.memberCount }} members</span>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <a mat-button [routerLink]="['/projects', project.id]">View</a>
                @if (authService.isAdmin()) {
                  <button mat-button (click)="openProjectDialog(project)">Edit</button>
                  <button mat-button color="warn" (click)="deleteProject(project)">Delete</button>
                }
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .project-list-page {
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;

        h1 { margin: 0; }
      }
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 48px;
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

      p {
        color: #666;
        margin: 16px 0;
      }
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .project-card {
      mat-card-header {
        mat-icon[mat-card-avatar] {
          background: #3f51b5;
          color: white;
          padding: 8px;
          border-radius: 50%;
        }
      }

      .description {
        color: #666;
        margin-bottom: 16px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .meta {
        display: flex;
        gap: 16px;
        color: #666;
        font-size: 14px;

        span {
          display: flex;
          align-items: center;
          gap: 4px;

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }
      }
    }
  `],
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  loading = true;

  constructor(
    private projectService: ProjectService,
    public authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Failed to load projects', 'Close', { duration: 3000 });
      },
    });
  }

  openProjectDialog(project?: Project): void {
    const dialogRef = this.dialog.open(ProjectFormDialogComponent, {
      width: '400px',
      data: { project },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        setTimeout(() => this.loadProjects());
      }
    });
  }

  deleteProject(project: Project): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Delete Project',
        message: `Are you sure you want to delete "${project.name}"? All tasks will be deleted.`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.projectService.deleteProject(project.id).subscribe({
          next: () => {
            this.snackBar.open('Project deleted successfully', 'Close', { duration: 3000 });
            setTimeout(() => this.loadProjects());
          },
          error: (error) => {
            this.snackBar.open(error.error?.message || 'Failed to delete project', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }
}
