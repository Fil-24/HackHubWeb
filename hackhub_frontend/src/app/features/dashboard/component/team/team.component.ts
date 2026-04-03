import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../service/team.service';
import { Team } from '../../models/team.model';

// Definisco l'interfaccia Account che mi hai fornito
export interface Account {
  idAccount: number;
  name: string;
  surname: string;
  nickname: string;
  email: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
  disabled: boolean;
  idTeam?: number | null;
  teamName?: string | null;
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {

  constructor(private teamService: TeamService) {}
  
  // ── STATO DELL'INTERFACCIA ──
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // ── DATI ──
  allTeams = signal<Team[]>([]);
  myTeam = signal<Team | null>(null);
  selectedTeam = signal<Team | null>(null);

  // ── RICERCA ──
  searchQuery = signal<string>('');
  
  // Calcola dinamicamente la lista dei team filtrati in base alla ricerca
  filteredTeams = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.allTeams();
    
    return this.allTeams().filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.projectTitle.toLowerCase().includes(query)
    );
  });

  // ── GESTIONE UTENTE ──
  isLoggedIn = signal<boolean>(true);
  
  // Mock di un utente connesso basato sulla tua interfaccia Account.
  // Nota: ho aggiunto `isTeamLeader` per far funzionare la logica di abbandono.
  currentUser = signal<(Account & { isTeamLeader?: boolean }) | null>({ 
    idAccount: 1, 
    name: 'Mario', 
    surname: 'Rossi', 
    nickname: 'marior',
    email: 'mario.rossi@example.com',
    role: 'USER',
    disabled: false,
    idTeam: 1, // Cambia in null per testare la vista "Esplora"
    teamName: 'Cyber Team',
    isTeamLeader: false 
  }); 

  // Segnale calcolato che restituisce true se l'utente ha un team
  hasTeam = computed(() => {
    const user = this.currentUser();
    return user !== null && user.idTeam !== null && user.idTeam !== undefined;
  });

  ngOnInit() {
    this.loadData();
  }

  // ── METODI DI CARICAMENTO ──

  loadData() {
    this.isLoading.set(true);
    this.clearMessages();

    this.teamService.getAllTeams().subscribe({
      next: (teams) => {
        this.allTeams.set(teams);
        
        // Se l'utente ha un team, carichiamo i dettagli specifici
        const user = this.currentUser();
        if (user && user.idTeam) {
          this.loadMyTeamDetails(user.idTeam);
        } else {
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        this.showError('Errore nel caricamento dei team. Riprova più tardi.');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  loadMyTeamDetails(teamId: number) {
    this.teamService.getTeamById(teamId).subscribe({
      next: (team) => {
        this.myTeam.set(team);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.showError('Impossibile caricare i dettagli del tuo team.');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  // ── LOGICA MODALE ──

  openTeamModal(team: Team) {
    this.selectedTeam.set(team);
  }

  closeModal() {
    this.selectedTeam.set(null);
  }

  // ── AZIONI DEL TEAM ──

  leaveCurrentTeam() {
    const user = this.currentUser();
    if (!user) return;

    this.isLoading.set(true);
    this.clearMessages();

    // Sceglie l'endpoint corretto dal service in base al ruolo
    const request = user.isTeamLeader 
      ? this.teamService.leaveTeamForLeader() 
      : this.teamService.leaveTeamForMember();

    request.subscribe({
      next: (res) => {
        this.showSuccess(res.message || 'Hai abbandonato il team con successo.');
        
        // Aggiorna lo stato locale per far sparire la schermata "Il mio Team"
        this.currentUser.update(u => u ? { 
          ...u, 
          idTeam: null, 
          teamName: null, 
          isTeamLeader: false 
        } : null);
        
        this.myTeam.set(null);
        this.loadData(); // Ricarica la lista per la pagina esplora
      },
      error: (err) => {
        this.showError('Errore durante l\'abbandono del team.');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  // ── UTILITY PER I MESSAGGI ──

  private showError(msg: string) {
    this.errorMessage.set(msg);
    setTimeout(() => this.errorMessage.set(null), 5000);
  }

  private showSuccess(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 5000);
  }

  private clearMessages() {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
}