import { CommonModule } from '@angular/common';
import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InvitationService } from '../../service/invitation.service';
import { Invitation } from '../../models/invitation.model';
import { AuthService } from '../../../auth/service/auth.service';

@Component({
  selector: 'app-invitation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invitation.html',
  styleUrl: './invitation.scss',
})
export class InvitationComponent implements OnInit {
  // Component state
  invitations = signal<Invitation[]>([]);
  isLoading = signal<boolean>(true);
  
  // Message handling (with timeout logic)
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  private messageTimeout: any;

  constructor(private invitationService: InvitationService, private authService : AuthService) {}

  ngOnInit() {
    this.loadInvitations();
  }

  loadInvitations() {
    this.isLoading.set(true);

    this.invitationService.getAll().subscribe({
      next: (data) => {
        
        this.invitations.set(data.filter(inv => inv.state === 'PENDING').map(inv => ({
          idInvitation: inv.idInvitation,
          state: inv.state,
          invitationDate: inv.invitationDate,
          idInvitedAccount: inv.idInvitedAccount,
          invitedAccountEmail: inv.invitedAccountEmail,
          idInvitingTeam: inv.idInvitingTeam,
          invitingTeamName: inv.invitingTeamName,
          senderName: inv.invitingTeamName
        })));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Error loading invitations.');
        this.isLoading.set(false);
        this.clearMessagesAfterDelay();
      }
    });
  }

  respond(idInvitation: number, accept: boolean) {
    this.invitationService.respond(idInvitation, accept)
    .subscribe({
      next: (res: any) => {
        console.log(res);
        if (accept && res.idInvitingTeam) {
          this.authService.updateTeamId(res.idInvitingTeam);
          this.authService.updateTeamName(res.invitingTeamName);
        }
        
        this.handleResponse(idInvitation, accept ? 'accepted' : 'declined');
      },
      error: () => {
        this.errorMessage.set("Error handling the invitation.");
        this.clearMessagesAfterDelay();
      }
    });
  }


  private handleResponse(id: number, action: 'accepted' | 'declined') {
    // Shows the success message and starts the 5-second timer
    this.successMessage.set(`Invitation ${action} successfully!`);
    this.errorMessage.set(null);
    this.clearMessagesAfterDelay();

    // Visually removes the invitation from the list by updating the signal
    this.invitations.update(current => current.filter(inv => inv.idInvitation !== id));
  }

  // Method to hide messages after 5 seconds
  private clearMessagesAfterDelay() {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    this.messageTimeout = setTimeout(() => {
      this.errorMessage.set(null);
      this.successMessage.set(null);
    }, 5000);
  }
}