import { CommonModule } from '@angular/common';
import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Interfaccia per definire la struttura dei dati dell'invito
export interface Invitation {
  id: string;
  teamName: string;
  senderName: string;
  role: string;
  createdAt: Date;
}

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

  ngOnInit() {
    this.loadInvitations();
  }

  // Simula il caricamento dal backend
  loadInvitations() {
    this.isLoading.set(true);
    
    // TODO: Sostituisci questo setTimeout con la chiamata al tuo Service
    // Esempio: this.teamService.getInvitations().subscribe(...)
    setTimeout(() => {
      this.invitations.set([
        { id: '1', teamName: 'Progetto Alpha', senderName: 'Mario Rossi', role: 'Sviluppatore', createdAt: new Date() },
        { id: '2', teamName: 'Marketing Team1', senderName: 'Giulia Bianchi', role: 'Designer', createdAt: new Date(Date.now() - 86400000) },
        { id: '3', teamName: 'Marketing Team2', senderName: 'Giulia Bianchi', role: 'Designer', createdAt: new Date(Date.now() - 86400000) },
        { id: '4', teamName: 'Marketing Team3', senderName: 'Giulia Bianchi', role: 'Designer', createdAt: new Date(Date.now() - 86400000) },
        { id: '5', teamName: 'Marketing Team4', senderName: 'Giulia Bianchi', role: 'Designer', createdAt: new Date(Date.now() - 86400000) },
        { id: '6', teamName: 'Marketing Team5', senderName: 'Giulia Bianchi', role: 'Designer', createdAt: new Date(Date.now() - 86400000) },
        { id: '7', teamName: 'Marketing Team6', senderName: 'Giulia Bianchi', role: 'Designer', createdAt: new Date(Date.now() - 86400000) }
      ]);
      this.isLoading.set(false);
    }, 800);
  }

  acceptInvitation(id: string) {
    this.processAction(id, 'accettato');
  }

  rejectInvitation(id: string) {
    this.processAction(id, 'rifiutato');
  }

  private processAction(id: string, action: 'accettato' | 'rifiutato') {
    // TODO: Qui andrà la chiamata reale al backend per salvare la scelta
    
    // Mostra il messaggio di successo e fa partire il timer di 5 secondi
    this.successMessage.set(`Invito ${action} con successo!`);
    this.errorMessage.set(null);
    this.clearMessagesAfterDelay();

    // Rimuove visivamente l'invito dalla lista aggiornando il signal
    this.invitations.update(current => current.filter(inv => inv.id !== id));
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