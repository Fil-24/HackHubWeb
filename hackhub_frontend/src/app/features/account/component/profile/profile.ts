import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/service/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent {
  
  isEditing = signal(false);
  isSaving = signal(false); // Gestisce lo stato di caricamento del bottone
  passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  editName = '';
  editSurname = '';
  editNickname = '';
  editEmail = '';
  editOldPassword = '';
  editNewPassword = '';
  editConfirmPassword = '';

  constructor(public authService: AuthService) {
    effect(() => {
      const user = this.authService.user();
      if (user && !this.isEditing()) {
        this.editName = user.name || '';
        this.editSurname = user.surname || '';
        this.editNickname = user.nickname || '';
        this.editEmail = user.email || '';

      }
    });
  }
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;
  isOldPasswordVisible: boolean = false;

  toggleOldPasswordVisibility(): void {
    this.isOldPasswordVisible = !this.isOldPasswordVisible;
  }
  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  toggleEdit() {
    this.isEditing.set(true);
  }

  cancelEdit() {
    const user = this.authService.user();
    if (user) {
      this.editName = user.name || '';
      this.editSurname = user.surname || '';
      this.editNickname = user.nickname || '';
      this.editEmail = user.email || '';
    }
    this.isEditing.set(false);
  }

  saveChanges() {
    this.isSaving.set(true); // Disabilita il form/bottoni

    const dataToUpdate = {
      name: this.editName,
      surname: this.editSurname,
      nickname: this.editNickname,
      email: this.editEmail
    };

    // Chiamata pulita al Service!
    this.authService.updateProfile(dataToUpdate).subscribe({
      next: (res) => {
        console.log('Profilo aggiornato con successo!', res);
        this.isSaving.set(false);
        this.isEditing.set(false); // Chiude la modalità modifica
      },
      error: (err) => {
        console.error('Errore durante il salvataggio', err);
        this.isSaving.set(false);
        // Qui in futuro potrai mostrare un messaggio di errore a schermo (es. toast)
      }
    });
  }
}