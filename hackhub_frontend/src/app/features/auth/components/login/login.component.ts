import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { LoginRequest } from '../../models/auth.model';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule,
    CommonModule,
    RouterModule]
})
export class LoginComponent {
  email = '';
  password = '';
  isPasswordVisible: boolean = false;

  
  errorMessage = signal<string | null>(null);

  constructor(private authService: AuthService, private router: Router) {}
  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
  login() {
    this.errorMessage.set(null);
    const req: LoginRequest = { email: this.email, password: this.password };

    this.authService.login(req).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.errorMessage.set(err.message);
      }
      

    });
    
  }
}