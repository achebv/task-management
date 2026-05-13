import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../shared/models';

@Component({
  selector: 'app-project-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.project ? 'Edit Project' : 'New Project' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="projectForm">
        @if (errorMessage) {
          <div class="error-message mb-2">{{ errorMessage }}</div>
        }

        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Project Name</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="4"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="loading || projectForm.invalid">
        @if (loading) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ data.project ? 'Update' : 'Create' }}
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
export class ProjectFormDialogComponent {
  projectForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private dialogRef: MatDialogRef<ProjectFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project?: Project }
  ) {
    this.projectForm = this.fb.group({
      name: [data.project?.name || '', Validators.required],
      description: [data.project?.description || ''],
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const request = this.data.project
      ? this.projectService.updateProject(this.data.project.id, this.projectForm.value)
      : this.projectService.createProject(this.projectForm.value);

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
