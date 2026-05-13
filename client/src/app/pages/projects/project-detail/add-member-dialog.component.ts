import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { User, ProjectMember } from '../../../shared/models';

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Add Member</h2>
    <mat-dialog-content>
      @if (errorMessage) {
        <div class="error-message mb-2">{{ errorMessage }}</div>
      }

      <mat-form-field appearance="outline" class="form-field-full">
        <mat-label>Select User</mat-label>
        <mat-select [(value)]="selectedUserId">
          @for (user of availableUsers; track user.id) {
            <mat-option [value]="user.id">{{ user.name }} ({{ user.email }})</mat-option>
          }
        </mat-select>
      </mat-form-field>

      @if (availableUsers.length === 0 && !loadingUsers) {
        <p class="no-users">No available users to add</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="loading || !selectedUserId">
        @if (loading) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          Add
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 300px;
      padding-top: 8px;
    }

    .no-users {
      color: #666;
      text-align: center;
    }
  `],
})
export class AddMemberDialogComponent implements OnInit {
  availableUsers: User[] = [];
  selectedUserId: number | null = null;
  loading = false;
  loadingUsers = true;
  errorMessage = '';

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private dialogRef: MatDialogRef<AddMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: number; existingMembers: ProjectMember[] },
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        setTimeout(() => {
          const existingIds = this.data.existingMembers.map((m) => m.id);
          this.availableUsers = users.filter(
            (u) => u.status === 'active' && !existingIds.includes(u.id)
          );
          this.loadingUsers = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.loadingUsers = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSubmit(): void {
    if (!this.selectedUserId) return;

    this.loading = true;
    this.errorMessage = '';

    this.projectService.addProjectMember(this.data.projectId, { userId: this.selectedUserId }).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Failed to add member';
        this.cdr.detectChanges();
      },
    });
  }
}
