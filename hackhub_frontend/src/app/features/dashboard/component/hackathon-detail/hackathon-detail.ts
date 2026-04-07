import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { Hackathon } from '../../models/hackathon.model';
import { ActivatedRoute, Router } from '@angular/router';
import { HackathonService } from '../../service/hackathon.service';
import { AuthService } from '../../../auth/service/auth.service';
import { TeamService } from '../../../teams/service/team.service';
import { catchError, map, Observable, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Rule } from '../../models/rule.model';
import { DatePipe, JsonPipe } from '@angular/common'; // <-- Assicurati che ci sia JsonPipe qui
@Component({
  selector: 'app-hackathon-detail',
  standalone: true,
  imports: [DatePipe, JsonPipe, FormsModule],
  templateUrl: './hackathon-detail.html',
  styleUrl: './hackathon-detail.scss'
})
export class HackathonDetailComponent implements OnInit {

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  
  hackathon = signal<Hackathon | null>(null);
  modifiedHackathon = signal<Hackathon | null>(null);

  // True se l'utente corrente è l'organizzatore dell'hackathon
  isOrganizer = false;  

  inputFocused = signal(false);

  // Controlla la visibilità del form di modifica
  showModifyForm = false;

  /**
   * Computed value che controlla se il team dell'utente 
   * è registrato nell'hackathon corrente.
   */
  teamRegistered = computed(() => {
    const user = this.authService.user();
    const hackathon = this.hackathon();

    if (!user?.idTeam || !hackathon) return false;

    return hackathon.teams?.some(t => t.id === user.idTeam);
  });

  newMentorEmail = signal('');

  // Flag interno per tracciare se l'utente è leader del team
  private leaderInternal = signal(false);
  leader = computed(() => this.leaderInternal());
  
  // Regole disponibili
  rules = signal<Rule[]>([]);
  ruleSearch = signal('');
  selectedRule = signal<Rule | null>(null);

  /**
   * Lista calcolata di regole filtrate per la barra di ricerca.
   */
  filteredRules = computed(() => {
    const search = this.ruleSearch().toLowerCase();

    if (!search) return [];

    return this.rules().filter(r =>
      r.name.toLowerCase().includes(search) ||
      r.description.toLowerCase().includes(search)
    );
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hackathonService: HackathonService,
    private teamService: TeamService,
    protected authService: AuthService
  ) {
    // Effetto per calcolare se l'utente è leader del suo team
    effect(() => {
      const user = this.authService.user();
    
      if (!user?.idTeam) {
        this.leaderInternal.set(false);
        return;
      }

      this.teamService.getTeamById(user.idTeam).subscribe({
        next: team => {
          this.leaderInternal.set(
            team.leader?.id === user.idAccount
          );
        },
        error: () => {
          this.leaderInternal.set(false);
        }
      });
    });
  }

ngOnInit() {
    const id = this.route.snapshot.params['id'];

    this.hackathonService.getById(id).subscribe({
      next: (data: any) => { // Uso 'any' temporaneamente per il debug
        // 1. STAMPIAMO I DATI IN CONSOLE PER CAPIRE COSA MANDA IL BACKEND
        console.log('--- DATI HACKATHON DAL BACKEND ---', data);
        
        this.hackathon.set(data);

        const currentUserId = this.authService.userId;
        console.log('--- MIO ID UTENTE ---', currentUserId);

        // 2. Controllo flessibile per isOrganizer (controlla sia idAccount che id)
        this.isOrganizer =
          currentUserId !== null &&
          data.staff && 
          data.staff.organizer &&
          (data.staff.organizer.idAccount === currentUserId || data.staff.organizer.id === currentUserId);

        console.log('--- SONO ORGANIZZATORE? ---', this.isOrganizer);

        // 3. FIX CRASH: Se non c'è un giudice, creiamo un oggetto vuoto per non far esplodere il form HTML
        if (!data.staff.judge) {
          data.staff.judge = { idAccount: null, email: '' };
        }
        if (!data.staff.organizer) {
          data.staff.organizer = { idAccount: null, email: '' };
        }

        this.modifiedHackathon.set({ ...data });
        
        this.loadRules();
      },
      error: () => {
        this.router.navigate(['/hackathons']);
      }
    });
  }
  
  /**
   * Carica la lista delle regole dal backend.
   */
  loadRules() {
    this.errorMessage.set(null);
    this.hackathonService.getRules()
      .subscribe({
        next: data => this.rules.set(data),
        error: err => this.errorMessage.set(err.message)
      });
  }

  /**
   * Ritorna la durata dell'hackathon in giorni e ore.
   */
  getDuration(): string {
    const start = new Date(this.hackathon()?.startDate ?? '');
    const end = new Date(this.hackathon()?.endDate ?? '');

    const diff = end.getTime() - start.getTime();

    if (diff <= 0) return '0h';

    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    return days === 0
      ? `${hours}h`
      : `${days}gg ${hours}h`;
  }

  /**
   * Registra il team dell'utente all'hackathon.
   */
  registerTeam() {
    this.errorMessage.set(null);
    const id = this.hackathon()?.id!;
    
    this.hackathonService.register(id).subscribe({
      next: (res) => {
        alert(res);
        
        // Ricarica i dati dell'hackathon
        this.hackathonService.getById(id).subscribe(h => {
          this.hackathon.set(h);
        });
      },
      error: err => {
        this.errorMessage.set(err.message);
      }
    });
  }

  /**
   * Controlla se l'utente corrente è leader del team (Restituisce Observable).
   */
  isLeader(): Observable<boolean> {
    const teamId = this.authService.currentUser?.idTeam;
    if (!teamId) return of(false);

    return this.teamService.getTeamById(teamId).pipe(
      map(data => {
        const currentUserId = this.authService.userId;
        return currentUserId !== null && data.leader?.id === currentUserId;
      }),
      catchError(() => {
        this.errorMessage.set("You cannot register");
        return of(false);
      })
    );
  }

 /**
   * Rimuove un mentore dall'hackathon.
   * @param idAccount L'ID del mentore (Account) da rimuovere
   */
  removeMentor(idAccount: number) {
    this.errorMessage.set(null);
    const hackathonId = this.hackathon()?.id;

    if (!hackathonId) return;

    this.hackathonService.removeMentor(hackathonId, idAccount).subscribe({
      next: () => {
        this.successMessage.set("Mentore rimosso con successo!");

        // Aggiorna il signal locale rimuovendo il mentore dalla lista
        this.hackathon.update(h => {
          if (!h) return h;
          return {
            ...h,
            staff: {
              ...h.staff,
              // Filtra usando idAccount invece di id
              mentors: h.staff.mentors?.filter(m => m.idAccount !== idAccount) ?? []
            }
          };
        });

        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: err => {
        this.errorMessage.set(err.message);
      }
    });
  }

  /**
   * Aggiunge un mentore all'hackathon.
   */
  addMentor() {
    this.errorMessage.set(null);
    if (!this.newMentorEmail()) return;

    this.hackathonService.assignMentor(this.hackathon()?.id!, this.newMentorEmail()).subscribe({
      next: (res) => {
        if (!res) {
          this.errorMessage.set('Mentor already exists!');
          return;
        }

        this.successMessage.set("Mentor added!");
   
        this.hackathon.update(h => {
          if (!h) return h;
          return {
            ...h,
            staff: {
              ...h.staff,
              mentors: [...(h.staff.mentors ?? []), res]
            }
          };
        });

        setTimeout(() => this.successMessage.set(null), 3000);
        this.newMentorEmail.set('');
      },
      error: err => {
        this.errorMessage.set(err.message);
      }
    });
  }

  /**
   * Disiscrive il team dell'utente dall'hackathon.
   */
  unsubscribeTeam(){
    const id = this.hackathon()?.id!;

    this.hackathonService.unsubscribeTeam(this.authService.teamId!).subscribe({
      next: () => {
        this.successMessage.set("Team removed");
        
        // Ricarica i dati dell'hackathon
        this.hackathonService.getById(id).subscribe(h => {
          this.hackathon.set(h);
        });

        setTimeout(() => this.successMessage.set(null), 3000);
      }
    });
  }

  /**
   * Salva le modifiche fatte all'hackathon (solo per gli organizzatori).
   */
  modifyHackathon(){
    this.errorMessage.set(null);
    const modified = this.modifiedHackathon();
    
    if (!modified) return;

    const data: any = { 
      name: modified.name,
      location: modified.location,
      prize: modified.prize,
      maxTeamMembers: modified.maxTeamMembers,
      maxNumberTeams: modified.maxNumberTeams,
      startDate: modified.startDate,
      endDate: modified.endDate,
      // CORREZIONE: Preleviamo l'ID dall'oggetto judge
      idJudge: modified.staff.judge?.idAccount // <-- Modificato qui
    };

    this.hackathonService.updateHackathon(modified.id, data).subscribe({
      // ... resto del codice identico
      next: (hackathon) => {
        this.successMessage.set('Hackathon aggiornato');
        this.hackathon.set(hackathon);
        this.modifiedHackathon.set({ ...hackathon });
        this.showModifyForm = false;
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: err => {
        this.errorMessage.set(err.message);
      }
    });
  }

  /**
   * Aggiunge una regola all'hackathon.
   */
  addRule() {
    const rule = this.selectedRule();
    if (!rule) return;

    this.hackathonService.addRule(this.hackathon()!.id, rule.id).subscribe({
      next: (ruleData) => {
        this.successMessage.set('Rule added');

        this.hackathon.update(h => {
          if (!h) return h;
          return {
            ...h,
            rules: [...(h.rules ?? []), ruleData]
          };
        });

        this.selectedRule.set(null);
        this.ruleSearch.set('');
        setTimeout(() => this.successMessage.set(null), 3000);
      }
    });
  }

  /**
   * Rimuove una regola dall'hackathon.
   */
  removeRule(id: number){
    this.errorMessage.set(null);
    this.hackathonService.removeRule(this.hackathon()!.id, id).subscribe({
      next: () => {
        this.successMessage.set('Rule removed');

        this.hackathon.update(h => {
          if (!h) return h;
          return {
            ...h,
            rules: h.rules?.filter(r => r.id !== id) ?? []
          };
        });
        
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: err => {
        this.errorMessage.set(err.message);
      }
    });
  }

  get ruleSearchValue(): string {
    const rule = this.selectedRule();
    return rule ? `${rule.name}: ${rule.description}` : this.ruleSearch();
  }

  set ruleSearchValue(value: string) {
    this.ruleSearch.set(value);
    this.selectedRule.set(null);
  }

  selectRule(rule: Rule) {
    this.selectedRule.set(rule);
    this.ruleSearch.set(rule.name);
  }
}