import { Component, OnInit, signal } from '@angular/core';
import { Hackathon } from '../../models/hackathon.model';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/service/auth.service';
import { HackathonService } from '../../service/hackathon.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hackathons',
  imports: [RouterLink, FormsModule],
  templateUrl: './hackathons.component.html',
  styleUrl: './hackathons.component.scss',
})
export class HackathonsComponent implements OnInit {
  hackathon = signal<Hackathon[]>([]);
  errorMessage = signal<string | null>(null);
  
  // Segnali dei filtri
  searchTerm = signal<string>('');
  filtroTempo = signal('tutti');
  filtroPartecipazione = signal('tutti'); // NUOVO SEGNALE
  ordinamento = signal('data-asc');
  
  showFiltri = false;

  constructor(private hackathonService: HackathonService, protected authService: AuthService) { }
  
  ngOnInit(): void {
    this.caricaHackathon();
  }

  caricaHackathon(): void {
    this.hackathonService.getAll().subscribe({
      next: (data) => {
        const ordinati = data
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        this.hackathon.set(ordinati);
      },
      error: (err) => {
        this.errorMessage.set(err.message);
      }
    });
  }

  filtro(): Hackathon[] {
  if (!this.hackathon()) {
    return [];
  }
  const dataAttuale = new Date();
  
  // Otteniamo l'utente corrente dal segnale dell'AuthService
  const currentUser = this.authService.user(); 

  return this.hackathon()!.filter(hackathon => {
    
    // 1. Filtro Nome
    const termine = this.searchTerm();
    const nomeMatch = !termine || hackathon.name.toLowerCase().includes(termine.toLowerCase());
    
    // 2. Filtro Tempo
    let tempoMatch = true;
    if (this.filtroTempo() === 'futuri') {
      tempoMatch = new Date(hackathon.startDate) > dataAttuale;
    } else if (this.filtroTempo() === 'passati') {
      tempoMatch = new Date(hackathon.endDate) < dataAttuale;
    }

    // 3. Filtro Partecipazione (Logica integrata dal Componente 2)
    let partecipazioneMatch = true;
    if (this.filtroPartecipazione() === 'miei') {
        if (!currentUser) {
            partecipazioneMatch = false; 
        } else if (this.authService.isStaff()) {
            partecipazioneMatch = hackathon.staff.organizerId === currentUser.idAccount 
                                      || hackathon.staff.judgeId === currentUser.idAccount 
                                        || hackathon.staff.mentors.some(m => m.idAccount === currentUser.idAccount) 
        } else {
            partecipazioneMatch = !!hackathon.teams?.some((team: any) => {
          // Caso A: L'utente ha un idTeam e corrisponde a quello del team
          if (currentUser.idTeam && team.idTeam === currentUser.idTeam) return true;
          
          // Caso B: L'utente è il leader del team
          if (team.leader && team.leader.idTeamMember === currentUser.idAccount) return true;
          
          // Caso C: L'utente è un membro all'interno dell'array members
          if (team.members && team.members.some((m: any) => m.idTeamMember === currentUser.idAccount)) return true;
          
          return false;
        });
        }
    }

    return nomeMatch && tempoMatch && partecipazioneMatch;

  }).sort((a, b) => {
      switch (this.ordinamento()) {
        case 'data-asc':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'data-desc':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'az':
          return a.name.localeCompare(b.name);
        case 'za':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }

  setFiltroPartecipazione(filtro: string) {
    this.filtroPartecipazione.set(filtro);
  }

  setFiltroTempo(filtro: string) {
    this.filtroTempo.set(filtro);
  }

  setOrdinamento(ord: string) {
    this.ordinamento.set(ord);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('it-IT', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}