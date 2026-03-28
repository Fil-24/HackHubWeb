import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import { RegisterRequest } from '../../models/auth.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ]
})
export class RegisterComponent {
  passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  name = '';
  surname = '';
  nickname = '';
  email = '';
  password = '';
  confirmPassword = '';
  role: 'USER' | 'STAFF' = 'USER';
  errorMessage = signal<string | null>(null);

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.errorMessage.set(null);

    if (!this.passwordRegex.test(this.password)) {
      this.errorMessage.set("Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, and 1 number.");
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set("Passwords do not match");
      return;
    }

    const req: RegisterRequest = {
      name: this.name,
      surname: this.surname,
      nickname: this.nickname,
      email: this.email,
      password: this.password,
      role: this.role
    };

    this.authService.signup(req).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },

      error: err => {
        this.errorMessage.set(err.message);
      }

    });
  }
}