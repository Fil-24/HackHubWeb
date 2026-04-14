import { Component, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/service/auth.service';
import { waitForAsync } from '@angular/core/testing';
import { timeout } from 'rxjs';

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
  editName = signal('');
  editSurname = signal('');
  editNickname = signal('');
  editEmail = signal('');
  editOldPassword = signal('');
  editNewPassword = signal('');
  editConfirmPassword = signal('');

  // computed — si aggiorna automaticamente quando user() cambia
  private user = computed(() => this.authService.user());

  constructor(public authService: AuthService) {
    effect(() => {
      const user = this.user();
      if (user && !this.isEditing()) {
        this.editName.set(user.name || '');
        this.editSurname.set(user.surname || '');
        this.editNickname.set(user.nickname || '');
        this.editEmail.set(user.email || '');
      }
    });
  }
  
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;
  isOldPasswordVisible: boolean = false;
  messageTimeout: any; // Per tenere traccia del timer di cancellazione dei messaggi

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
      this.editName.set(user.name || '');
      this.editSurname.set(user.surname || '');
      this.editNickname.set(user.nickname || '');
      this.editEmail.set(user.email || '');
    }
    this.isEditing.set(false);
  }
  private clearMessagesAfterDelay() {
    // Se c'è già un timer in corso, lo cancella (evita bug se l'utente clicca velocemente)
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    
    // Imposta un nuovo timer di 5000 millisecondi (5 secondi)
    this.messageTimeout = setTimeout(() => {
      this.errorMessage.set(null);
      this.successMessage.set(null);
    }, 5000);
  }

  saveChanges() {
    this.isSaving.set(true); // Disabilita il form/bottoni

    const dataToUpdate: any = {
      name: this.editName,
      surname: this.editSurname,
      nickname: this.editNickname,
      email: this.editEmail
    };
    // 2. Aggiungi i dati della password SOLO se l'utente ha inserito qualcosa
      if (this.editOldPassword || this.editNewPassword) {
        
        // Controlla che le nuove password coincidano
        if (this.editNewPassword !== this.editConfirmPassword) {
          this.errorMessage.set('Le password non coincidono!');
          this.isSaving.set(false);
          return; 
        }

        // Controlla che la nuova password rispetti la Regex
        if (!this.passwordRegex.test(this.editNewPassword())) {
          this.errorMessage.set('La nuova password deve essere lunga almeno 8 caratteri e contenere almeno una lettera maiuscola, una minuscola e un numero.');
         this.isSaving.set(false);
          return;
        }

        
        dataToUpdate.oldPassword = this.editOldPassword;
        dataToUpdate.newPassword = this.editNewPassword;
      }

    this.authService.updateProfile(dataToUpdate).subscribe({
      next: (res) => {
        this.successMessage.set('Profilo aggiornato con successo!');
        this.isSaving.set(false);
        this.isEditing.set(false); // Chiude la modalità modifica
          this.clearMessagesAfterDelay(); // Imposta il timer per cancellare i messaggi
        this.editOldPassword.set('');
        this.editNewPassword.set('');
        this.editConfirmPassword.set('');
      
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err.message || 'Errore sconosciuto durante l\'aggiornamento del profilo');
        this.clearMessagesAfterDelay(); // Imposta il timer per cancellare i messaggi
      }
    });
  }
}