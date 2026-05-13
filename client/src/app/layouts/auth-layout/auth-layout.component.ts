import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-layout">
      <div class="auth-container">
        <div class="auth-header">
          <h1>Project Manager</h1>
        </div>
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .auth-container {
      width: 100%;
      max-width: 400px;
      padding: 20px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 24px;

      h1 {
        color: white;
        font-size: 28px;
        font-weight: 500;
      }
    }
  `],
})
export class AuthLayoutComponent {}
