import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Team } from '../../models/team.model';
import { TeamService } from '../../service/team.service';


@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
  constructor(private teamService: TeamService) {}

  // Segnali per lo stato
  teams = signal<Team[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  
  // Segnale per la ricerca
  searchQuery = signal<string>('');
  
  // Computed per filtrare i team in base alla ricerca
  filteredTeams = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.teams().filter(team => 
      team.name.toLowerCase().includes(query) || 
      (team.description && team.description.toLowerCase().includes(query))
    );
  });

  // Segnale per la predisposizione del "Mio Team"
  // Quando questo sarà popolato, mostrerà la sezione dedicata al posto della lista
  myTeam = signal<Team | null>(null); 

  // Segnale per il popup dei dettagli
  selectedTeam = signal<Team | null>(null);

  ngOnInit() {
    this.loadTeams();
    // TODO: In futuro, inserire qui la chiamata per recuperare il team dell'utente corrente
    // this.checkMyTeam();
  }

  loadTeams() {
    this.isLoading.set(true);
    this.teamService.getAllTeams().subscribe({
      next: (data) => {
        this.teams.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Errore durante il caricamento dei team.');
        this.isLoading.set(false);
      }
    });
  }

  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  openTeamDetails(team: Team) {
    this.selectedTeam.set(team);
    // Blocca lo scroll del body quando il modale è aperto
    document.body.style.overflow = 'hidden';
  }

  closePopup() {
    this.selectedTeam.set(null);
    // Ripristina lo scroll
    document.body.style.overflow = 'auto';
  }
}