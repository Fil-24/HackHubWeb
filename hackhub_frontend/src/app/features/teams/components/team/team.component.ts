import { Component, computed, effect, signal } from '@angular/core'; // <-- Aggiungi effect
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Team } from '../../model/team.model';
import { TeamService } from '../../service/team.service';
import { AuthService } from '../../../auth/service/auth.service';
import { MyTeamComponent } from '../my-team/my-team.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  showCreateForm = signal<boolean>(false);

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

  // — Segnali per la form di creazione —
  newTeamName = '';
  newTeamDescription = '';
  isCreating = signal<boolean>(false);
  createErrorMessage = signal<string | null>(null);
  createSuccessMessage = signal<string | null>(null);

  constructor(private teamService: TeamService, protected authService: AuthService, private router : Router) {
    effect(() => {
      const user = this.authService.user();
      
      if (user) {
        this.isLoggedIn.set(true);
        if (user.idTeam) { 
          this.loadMyTeam();
          return; 
        }
        this.myTeam.set(null); 
        this.loadTeams();
      } else {
        this.isLoggedIn.set(false);
        this.myTeam.set(null);
        this.loadTeams();
      }
    }); 
  }


  loadMyTeam() {
    this.router.navigate(['/teams/my']);
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
        this.errorMessage.set('Error while loading teams.');
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
  
    this.showCreateForm.set(true);
    document.body.style.overflow = 'hidden';
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

  // — Chiude la form e resetta lo stato —
closeCreateForm() {
  this.showCreateForm.set(false);
  this.newTeamName = '';
  this.newTeamDescription = '';
  this.createErrorMessage.set(null);
  this.createSuccessMessage.set(null);
  this.isCreating.set(false);
  document.body.style.overflow = 'auto';
}

  // — Invia la richiesta di creazione —
  submitCreateTeam() {
    const name = this.newTeamName.trim();
    const description = this.newTeamDescription.trim();

    if (!name) {
      this.createErrorMessage.set('Team name is required.');
      return;
    }

    this.isCreating.set(true);
    this.createErrorMessage.set(null);
    this.createSuccessMessage.set(null);

    this.teamService.createTeam(name, description).subscribe({
      next: (team) => {
        this.isCreating.set(false);
        this.createSuccessMessage.set(`Team "${team.name}" created successfully!`);
        this.authService.updateTeamId(team.id);
        // Chiude la modale dopo un breve delay e aggiorna la vista
        setTimeout(() => {
          this.closeCreateForm();
          this.loadMyTeam(); // Il creatore diventa leader → carica il suo team
        }, 1500);
      },
      error: (err) => {
        this.isCreating.set(false);
        this.createErrorMessage.set(
          err?.error?.message || 'Error while creating the team. Please try again.'
        );
      }
    });
  }
}