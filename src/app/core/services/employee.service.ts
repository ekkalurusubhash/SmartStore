import { Injectable, signal, computed } from '@angular/core';
import { Employee } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly employees = signal<Employee[]>([
    {
      id: 'emp_1',
      name: 'John Smith',
      email: 'john.smith@smartstore.com',
      department: 'Sales',
      salary: 45000,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: 'emp_2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@smartstore.com',
      department: 'Operations',
      salary: 52000,
      createdAt: new Date('2024-02-20'),
    },
    {
      id: 'emp_3',
      name: 'Mike Davis',
      email: 'mike.davis@smartstore.com',
      department: 'Sales',
      salary: 48000,
      createdAt: new Date('2024-03-10'),
    },
  ]);

  readonly employees$ = this.employees.asReadonly();
  readonly employeeCount = computed(() => this.employees().length);

  addEmployee(employee: Omit<Employee, 'id' | 'createdAt'>): Employee {
    const newEmployee: Employee = {
      ...employee,
      id: `emp_${Date.now()}`,
      createdAt: new Date(),
    };
    this.employees.update(list => [...list, newEmployee]);
    return newEmployee;
  }

  updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
    const employee = this.employees().find(e => e.id === id);
    if (!employee) return null;

    const updated = { ...employee, ...updates };
    this.employees.update(list =>
      list.map(e => (e.id === id ? updated : e))
    );
    return updated;
  }

  deleteEmployee(id: string): boolean {
    const initialLength = this.employees().length;
    this.employees.update(list => list.filter(e => e.id !== id));
    return this.employees().length < initialLength;
  }

  getEmployee(id: string): Employee | undefined {
    return this.employees().find(e => e.id === id);
  }

  getAllEmployees(): Employee[] {
    return this.employees();
  }
}
