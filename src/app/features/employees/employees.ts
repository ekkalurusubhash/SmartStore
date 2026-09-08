import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/services/auth.service';
import { LoaderService } from '../../shared/services/loader.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.html',
  styleUrl: './employees.scss',
})
export class Employees {

  private readonly employeeService = inject(EmployeeService);
  private readonly authService = inject(AuthService);
  private readonly loader = inject(LoaderService);

  readonly employees = this.employeeService.employees$;
  readonly employeeCount = this.employeeService.employeeCount;
  readonly isAdmin = computed(() => this.authService.isAdmin());

  showForm = signal(false);
  editingId = signal<string | null>(null);

  formData = signal({
    name: '',
    email: '',
    department: '',
    salary: 0,
  });

  readonly isFormValid = computed(() => {
    const form = this.formData();
    return (
      form.name.trim().length > 0 &&
      form.email.trim().length > 0 &&
      form.department.trim().length > 0 &&
      form.salary > 0
    );
  });

  updateName(name: string): void {
    this.formData.update(f => ({ ...f, name }));
  }

  updateEmail(email: string): void {
    this.formData.update(f => ({ ...f, email }));
  }

  updateDepartment(department: string): void {
    this.formData.update(f => ({ ...f, department }));
  }

  updateSalary(salary: number): void {
    this.formData.update(f => ({ ...f, salary }));
  }

  saveEmployee(): void {
    if (!this.isFormValid()) {
      return;
    }
    const isEdit = !!this.editingId();
    this.executeWithLoader(() => {
      const data = this.formData();
      const employee = {
        name: data.name,
        email: data.email,
        department: data.department,
        salary: data.salary,
      };
      if (isEdit) {
        this.employeeService.updateEmployee(
          this.editingId()!,
          employee as any
        );
      } else {
        this.employeeService.addEmployee(
          employee as any
        );
      }
      this.resetForm();
      Swal.fire({
        icon: 'success',
        title: isEdit ? 'Employee Updated' : 'Employee Added',
        text: isEdit
          ? 'Employee updated successfully.'
          : 'Employee added successfully.',
        timer: 1500,
        showConfirmButton: false
      });
    });
  }

  editEmployee(id: string): void {
    this.executeWithLoader(() => {
      const employee = this.employeeService.getEmployee(id);
      if (!employee) {
        return;
      }
      this.formData.set({
        name: employee.name,
        email: employee.email,
        department: employee.department,
        salary: employee.salary,
      });
      this.editingId.set(id);
      this.showForm.set(true);
    }, 800);
  }

  async deleteEmployee(id: string): Promise<void> {
    const result = await Swal.fire({
      title: 'Delete Employee?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (!result.isConfirmed) {
      return;
    }

    this.executeWithLoader(() => {
      this.employeeService.deleteEmployee(id);
      Swal.fire({
        title: 'Deleted!',
        text: 'Employee deleted successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    });
  }

  toggleForm(): void {
    this.showForm.update(value => !value);
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.formData.set({
      name: '',
      email: '',
      department: '',
      salary: 0,
    });
    this.editingId.set(null);
    this.showForm.set(false);
  }

  private executeWithLoader(action: () => void, delay = 1500): void {
    this.loader.show();
    setTimeout(() => {
      try {
        action();
      } finally {
        this.loader.hide();
      }
    }, delay);
  }

}