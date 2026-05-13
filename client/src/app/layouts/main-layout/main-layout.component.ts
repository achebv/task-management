import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <h2>Project Manager</h2>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/projects" routerLinkActive="active">
            <mat-icon matListItemIcon>folder</mat-icon>
            <span matListItemTitle>Projects</span>
          </a>
          @if (authService.isAdmin()) {
            <mat-divider></mat-divider>
            <div class="nav-section-title">Admin</div>
            <a mat-list-item routerLink="/admin/users" routerLinkActive="active">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>Users</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="spacer"></span>
          <button mat-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
            <span>{{ authService.currentUser()?.name }}</span>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item disabled>
              <mat-icon>person</mat-icon>
              <span>{{ authService.currentUser()?.email }}</span>
            </button>
            <button mat-menu-item disabled>
              <mat-icon>badge</mat-icon>
              <span>Role: {{ authService.currentUser()?.role }}</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <main class="content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 250px;
      background: #fafafa;
    }

    .sidenav-header {
      padding: 16px;
      background: #3f51b5;
      color: white;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
    }

    .nav-section-title {
      padding: 16px 16px 8px;
      font-size: 12px;
      font-weight: 500;
      color: #666;
      text-transform: uppercase;
    }

    .active {
      background-color: rgba(63, 81, 181, 0.1);
    }

    .spacer {
      flex: 1 1 auto;
    }

    .content {
      padding: 24px;
      background: #f5f5f5;
      min-height: calc(100vh - 64px);
    }
  `],
})
export class MainLayoutComponent {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout().subscribe();
  }
}
