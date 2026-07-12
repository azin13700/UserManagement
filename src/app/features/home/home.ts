import { Component, inject, OnInit } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../core/services/auth-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {

  private authService = inject(AuthService);
  userFullName :string = '';
  userRole:string = '';
  private router = inject(Router);
  userUnit = '';
  userUnitName= '';
  loading = true;
  hasPermission = false;
  redirectPath = '';
  ngOnInit(): void {
    this.loadUserInfo();

  }


  loadUserInfo() {
      const userData  = this.authService.getUserData();
       this.userFullName = userData.fullName;
    const selectedRole = this.authService.getSelectedRole();
    this.userRole = selectedRole?.roleDescription || '';
    this.userUnitName = selectedRole?.unitName || 'واحد نامشخص';
  }
  logout() {
   this.authService.logout();
    }
    getRedirectLabel() {
    throw new Error('Method not implemented.');
    }
}
