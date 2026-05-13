import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TaskService } from '../../../core/services/task.service';
import { Task, ProjectMember } from '../../../shared/models';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.task ? 'Edit Task' : 'New Task' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="taskForm">
        @if (errorMessage) {
          <div class="error-message mb-2">{{ errorMessage }}</div>
        }

        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title">
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="todo">To Do</mat-option>
              <mat-option value="in_progress">In Progress</mat-option>
              <mat-option value="done">Done</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Priority</mat-label>
            <mat-select formControlName="priority">
              <mat-option value="low">Low</mat-option>
              <mat-option value="medium">Medium</mat-option>
              <mat-option value="high">High</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Due Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="dueDate">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Assign To</mat-label>
          <mat-select formControlName="assignedToId">
            <mat-option [value]="null">Unassigned</mat-option>
            @for (member of data.members; track member.id) {
              <mat-option [value]="member.id">{{ member.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions>
      @if (data.task) {
        <button mat-button color="warn" (click)="deleteTask()">
          <mat-icon>delete</mat-icon>
          Delete
        </button>
      }
      <span class="spacer"></span>
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="loading || taskForm.invalid">
        @if (loading) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ data.task ? 'Update' : 'Create' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 400px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 8px;
    }

    .form-row {
      display: flex;
      gap: 16px;

      mat-form-field {
        flex: 1;
      }
    }

    .spacer {
      flex: 1 1 auto;
    }
  `],
})
export class TaskFormDialogComponent {
  taskForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<TaskFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task?: Task; projectId: number; members: ProjectMember[] }
  ) {
    this.taskForm = this.fb.group({
      title: [data.task?.title || '', Validators.required],
      description: [data.task?.description || ''],
      status: [data.task?.status || 'todo'],
      priority: [data.task?.priority || 'medium'],
      dueDate: [data.task?.dueDate ? new Date(data.task.dueDate) : null],
      assignedToId: [data.task?.assignedTo?.id || null],
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const formData = { ...this.taskForm.value };

    const request = this.data.task
      ? this.taskService.updateTask(this.data.task.id, formData)
      : this.taskService.createTask(this.data.projectId, formData);

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

  deleteTask(): void {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Delete Task',
        message: 'Are you sure you want to delete this task?',
      },
    });

    confirmRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && this.data.task) {
        this.taskService.deleteTask(this.data.task.id).subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.errorMessage = error.error?.message || 'Failed to delete task';
          },
        });
      }
    });
  }
}
