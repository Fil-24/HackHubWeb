import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // <-- Modificato qui
import { AuthService } from '../../service/auth.service';
import { LoginRequest } from '../../models/auth.model';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    CommonModule,
    RouterModule
  ]
})
export class LoginComponent {
  // Inizializziamo il form
  loginForm: FormGroup;
  isPasswordVisible: boolean = false;
  
  errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService, 
    private router: Router,
    private fb: FormBuilder 
  ) {
    // Creiamo il gruppo di controlli con le validazioni
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Obbligatorio e formato email valido
      password: ['', [Validators.required]]                 // Obbligatorio
    });
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  login() {
    this.errorMessage.set(null);

    // Blocca l'invio se il form non è valido lato client
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Mostra gli errori visivi all'utente
      return;
    }

    // Estraiamo i valori in modo sicuro direttamente dal form
    const req: LoginRequest = { 
      email: this.loginForm.value.email, 
      password: this.loginForm.value.password 
    };

    this.authService.login(req).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.errorMessage.set(err.message || 'Errore durante il login. Controlla le credenziali.');
      }
    });
  }
}