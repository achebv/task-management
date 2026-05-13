import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Register</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          @if (errorMessage) {
            <div class="error-message mb-2">{{ errorMessage }}</div>
          }

          @if (successMessage) {
            <div class="success-message mb-2">{{ successMessage }}</div>
          }

          <mat-form-field appearance="outline" class="form-field-full">
            <mat-label>Name</mat-label>
            <input matInput type="text" formControlName="name" placeholder="Enter your name">
            <mat-icon matSuffix>person</mat-icon>
            @if (registerForm.get('name')?.hasError('required') && registerForm.get('name')?.touched) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field-full">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="Enter your email">
            <mat-icon matSuffix>email</mat-icon>
            @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
              <mat-error>Email is required</mat-error>
            }
            @if (registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched) {
              <mat-error>Please enter a valid email</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field-full">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Enter your password">
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
              <mat-error>Password is required</mat-error>
            }
            @if (registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched) {
              <mat-error>Password must be at least 6 characters</mat-error>
            }
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" class="form-field-full" [disabled]="loading || registerForm.invalid">
            @if (loading) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              Register
            }
          </button>
        </form>
      </mat-card-content>
      <mat-card-actions align="end">
        <a mat-button routerLink="/auth/login">Already have an account? Login</a>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    mat-card {
      max-width: 400px;
      margin: 0 auto;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    mat-spinner {
      display: inline-block;
    }
  `],
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = response.message;
        this.registerForm.reset();
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      },
    });
  }
}
