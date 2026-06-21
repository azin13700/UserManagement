import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USER_KEY = 'user_data';
  private readonly ROLE_KEY = 'selected_role';
  private userSubject = new BehaviorSubject<any>(null);
  private roleSubject = new BehaviorSubject<any>(null);

  user$ = this.userSubject.asObservable();
  role$ = this.roleSubject.asObservable();
  constructor(private router: Router) {
    const userData = this.getUserData();
    if (userData) {
      this.userSubject.next(userData);
    }
    const roleData = this.getSelectedRole();
    if (roleData) {
      this.roleSubject.next(roleData);
    }
  }
  getUserId(): number | null {
    return this.getUserData()?.userId || null;
  }
  setUserData(data: any) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(data));
    this.userSubject.next(data);
  }
  
  setSelectedRole(data: any) {
    localStorage.setItem(this.ROLE_KEY, JSON.stringify(data));
    this.roleSubject.next(data);
  }

  getUserData(): any {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

 

  getSelectedRole(): any {
    const data = localStorage.getItem(this.ROLE_KEY);
    return data ? JSON.parse(data) : null;
  }

  getSelectedRoleName(): string | null {
    return this.getSelectedRole()?.roleName || null;
  }

  getUserPermissions(): string[] {
    const role = this.getSelectedRole();
    return role?.permissions || [];
  }

  isLoggedIn(): boolean {
    return !!this.getUserData();
  }

  hasSelectedRole(): boolean {
    return !!this.getSelectedRole();
  }

  logout() {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROLE_KEY);
  
    this.userSubject.next(null);
    this.roleSubject.next(null);
  
    this.router.navigate(['/login']);
  }
  hasPermission(permission: string): boolean {
    return this.getUserPermissions().includes(permission);
  }
}