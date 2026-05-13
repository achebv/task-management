import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats } from '../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatListModule,
  ],
  template: `
    <div class="dashboard">
      <h1>Welcome, {{ authService.currentUser()?.name }}</h1>

      @if (loading) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (stats) {
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon projects">
                <mat-icon>folder</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats.projectCount }}</span>
                <span class="stat-label">Projects</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon tasks">
                <mat-icon>assignment</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats.taskStats.total }}</span>
                <span class="stat-label">Total Tasks</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon todo">
                <mat-icon>pending_actions</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats.taskStats.todo }}</span>
                <span class="stat-label">To Do</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon in-progress">
                <mat-icon>autorenew</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats.taskStats.in_progress }}</span>
                <span class="stat-label">In Progress</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon done">
                <mat-icon>check_circle</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats.taskStats.done }}</span>
                <span class="stat-label">Done</span>
              </div>
            </mat-card-content>
          </mat-card>

          @if (stats.userCount !== undefined) {
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-icon users">
                  <mat-icon>people</mat-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ stats.userCount }}</span>
                  <span class="stat-label">Users</span>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>

        <mat-card class="recent-projects">
          <mat-card-header>
            <mat-card-title>Recent Projects</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (stats.recentProjects.length === 0) {
              <p class="no-data">No projects yet</p>
            } @else {
              <mat-list>
                @for (project of stats.recentProjects; track project.id) {
                  <mat-list-item>
                    <mat-icon matListItemIcon>folder</mat-icon>
                    <a matListItemTitle [routerLink]="['/projects', project.id]">{{ project.name }}</a>
                    <span matListItemLine>Created by {{ project.createdBy.name }}</span>
                  </mat-list-item>
                }
              </mat-list>
            }
          </mat-card-content>
          <mat-card-actions>
            <a mat-button color="primary" routerLink="/projects">View All Projects</a>
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .dashboard {
      h1 {
        margin-bottom: 24px;
        color: #333;
      }
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      mat-card-content {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
      }
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        color: white;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      &.projects { background: #3f51b5; }
      &.tasks { background: #9c27b0; }
      &.todo { background: #ff9800; }
      &.in-progress { background: #2196f3; }
      &.done { background: #4caf50; }
      &.users { background: #607d8b; }
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 600;
      color: #333;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
    }

    .recent-projects {
      max-width: 600px;
    }

    .no-data {
      color: #666;
      text-align: center;
      padding: 24px;
    }
  `],
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;

  constructor(
    private dashboardService: DashboardService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
