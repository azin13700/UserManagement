// core/components/login-form/login-form.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../services/api-service';
import { AuthService } from '../../services/auth-service';


@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    ReactiveFormsModule,
  
  ],
  providers: [MessageService],
  templateUrl: './login-form.html',
  styleUrls: ['./login-form.scss']
})
export class LoginForm implements OnInit {
  loading = false;
  showPassword = false;

  userForm!: FormGroup;
  constructor(
    private api: ApiService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private fb: FormBuilder,
  ) {}
  ngOnInit() {
    this.initForm();
  }
  isInvalid(field: string): boolean {
    const control = this.userForm.get(field);
    return !!(control?.invalid && (control?.touched || control?.dirty));
  }
  initForm(){

    this.userForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });
  }



  async onSubmit() {

    this.loading = true;
    
    const formData = new FormData();
    formData.append('userName', this.userForm.get('userName')?.value);
    formData.append('password', this.userForm.get('password')?.value);

    
    this.api
    .login(formData)
    .subscribe(res => {
      this.authService.setUserData(res);
      this.router.navigate(['/select-role']);
    });


    

  }
  }
