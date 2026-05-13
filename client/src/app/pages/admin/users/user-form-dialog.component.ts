import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../shared/models';

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.user ? 'Edit User' : 'Add User' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="userForm">
        @if (errorMessage) {
          <div class="error-message mb-2">{{ errorMessage }}</div>
        }

        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email">
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password" [placeholder]="data.user ? 'Leave blank to keep current' : ''">
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role">
            <mat-option value="user">User</mat-option>
            <mat-option value="admin">Admin</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="active">Active</mat-option>
            <mat-option value="inactive">Inactive</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="loading || userForm.invalid">
        @if (loading) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ data.user ? 'Update' : 'Create' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 350px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 8px;
    }
  `],
})
export class UserFormDialogComponent {
  userForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user?: User }
  ) {
    this.userForm = this.fb.group({
      name: [data.user?.name || '', Validators.required],
      email: [data.user?.email || '', [Validators.required, Validators.email]],
      password: ['', data.user ? [] : Validators.required],
      role: [data.user?.role || 'user', Validators.required],
      status: [data.user?.status || 'active', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const formData = { ...this.userForm.value };
    if (!formData.password) {
      delete formData.password;
    }

    const request = this.data.user
      ? this.userService.updateUser(this.data.user.id, formData)
      : this.userService.createUser(formData);

    request.subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Operation failed';
      },
    });
  }
}
