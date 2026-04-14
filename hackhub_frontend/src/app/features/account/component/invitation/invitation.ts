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
  // Stato del componente
  invitations = signal<Invitation[]>([]);
  isLoading = signal<boolean>(true);
  
  // Gestione messaggi (con la logica del timeout)
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
        this.errorMessage.set('Errore nel caricamento degli inviti.');
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
        
        this.handleResponse(idInvitation, accept? 'accettato' : 'rifiutato');
      },
      error: () => {
        this.errorMessage.set("Errore nella gestione dell'invito.");
        this.clearMessagesAfterDelay();
      }
    });
  }


  private handleResponse(id: number, action: 'accettato' | 'rifiutato') {
    // Mostra il messaggio di successo e fa partire il timer di 5 secondi
    this.successMessage.set(`Invito ${action} con successo!`);
    this.errorMessage.set(null);
    this.clearMessagesAfterDelay();

    // Rimuove visivamente l'invito dalla lista aggiornando il signal
    this.invitations.update(current => current.filter(inv => inv.idInvitation !== id));
  }

  // Metodo per nascondere i messaggi dopo 5 secondi
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