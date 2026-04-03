import { Component, computed, effect, signal } from '@angular/core'; // <-- Aggiungi effect
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Team } from '../../models/team.model';
import { TeamService } from '../../service/team.service';
import { AuthService } from '../../../auth/service/auth.service';
import { MyTeamComponent } from '../my-team/my-team.component';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule, MyTeamComponent],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent {
  // Segnali per lo stato...
  teams = signal<Team[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string|null>('');
  searchQuery = signal<string>('');
  isLoggedIn = signal<boolean>(false);
  messageTimeout: any;

  // Computed
  filteredTeams = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.teams().filter(team => 
      team.name.toLowerCase().includes(query) || 
      (team.description && team.description.toLowerCase().includes(query))
    );
  });

  myTeam = signal<Team | null>(null); 
  selectedTeam = signal<Team | null>(null);

  constructor(private teamService: TeamService, private authService: AuthService) {
    effect(() => {
      const user = this.authService.user();
      
      if (user) {
        this.isLoggedIn.set(true);

        if (user.idTeam) {
          this.loadMyTeam(user.idTeam);
        } else {
          this.myTeam.set(null); 
          this.loadTeams();
        }
      } else {
        this.isLoggedIn.set(false);
        this.myTeam.set(null);
        this.loadTeams();
      }
    }, { allowSignalWrites: true }); 
  }


  loadMyTeam(teamId: number) {
    this.isLoading.set(true); 
    this.teamService.getTeamById(teamId).subscribe({
      next: (team) => {
        this.myTeam.set(team); 
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Errore nel recupero del team dell\'utente: ' + (err.message || ''));
        this.clearMessagesAfterDelay();
        this.myTeam.set(null);
        this.isLoading.set(false);
        this.loadTeams();
      }
    });
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
        this.clearMessagesAfterDelay(); 
        this.isLoading.set(false);
      }
    });
  }

  private clearMessagesAfterDelay() {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    
    this.messageTimeout = setTimeout(() => {
      this.errorMessage.set(null);
    }, 5000);
  }

  openCreateTeam() {
    // TODO: Qui puoi aprire un popup per creare il team o navigare verso la rotta di creazione
    console.log("Apertura modale/pagina di creazione team...");
    // Esempio: this.router.navigate(['/teams/create']);
  }

  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  openTeamDetails(team: Team) {
    this.selectedTeam.set(team);
    document.body.style.overflow = 'hidden';
  }

  closePopup() {
    this.selectedTeam.set(null);
    document.body.style.overflow = 'auto';
  }
}