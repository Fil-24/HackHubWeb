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
  isSaving = signal(false); // Manages the loading state of the button
  passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  editName = signal('');
  editSurname = signal('');
  editNickname = signal('');
  //editEmail = signal('');
  editOldPassword = signal('');
  editNewPassword = signal('');
  editConfirmPassword = signal('');

  // computed — automatically updates when user() changes
  private user = computed(() => this.authService.user());

  constructor(public authService: AuthService) {
    effect(() => {
      const user = this.user();
      if (user && !this.isEditing()) {
        this.editName.set(user.name || '');
        this.editSurname.set(user.surname || '');
        this.editNickname.set(user.nickname || '');
      }
    });
  }
  
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;
  isOldPasswordVisible: boolean = false;
  messageTimeout: any; // To keep track of the message clearing timer

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
    }
    this.isEditing.set(false);
  }
  
  private clearMessagesAfterDelay() {
    // If a timer is already running, clear it (prevents bugs if the user clicks quickly)
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    
    // Set a new timer for 5000 milliseconds (5 seconds)
    this.messageTimeout = setTimeout(() => {
      this.errorMessage.set(null);
      this.successMessage.set(null);
    }, 5000);
  }

  saveChanges() {
    this.isSaving.set(true); // Disables the form/buttons

    const dataToUpdate: any = {
      name: this.editName(),
      surname: this.editSurname(),
      nickname: this.editNickname(),
      email: this.user()?.email // Email is not editable, but we need to include it in the update payload
    };
    
    // Add password data ONLY if the user entered something
      if (this.editOldPassword() || this.editNewPassword()) {
        
        // Check that the new passwords match
        
        if (this.editNewPassword() !== this.editConfirmPassword()) {
          this.errorMessage.set('Passwords do not match!');
          this.isSaving.set(false);
          return; 
        }

        // Check that the new password meets the Regex requirements
        if (!this.passwordRegex.test(this.editNewPassword())) {
          this.errorMessage.set('The new password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
         this.isSaving.set(false);
          return;
        }

        
        dataToUpdate.oldPassword = this.editOldPassword();
        dataToUpdate.newPassword = this.editNewPassword();
      }

    this.authService.updateProfile(dataToUpdate).subscribe({
      next: (res) => {
        this.successMessage.set('Profile updated successfully!');
        this.isSaving.set(false);
        this.isEditing.set(false); // Closes edit mode
        this.clearMessagesAfterDelay(); // Sets the timer to clear messages
        this.editOldPassword.set('');
        this.editNewPassword.set('');
        this.editConfirmPassword.set('');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err.message || 'Unknown error while updating profile');
        this.clearMessagesAfterDelay(); // Sets the timer to clear messages
      }
    });
  }
}