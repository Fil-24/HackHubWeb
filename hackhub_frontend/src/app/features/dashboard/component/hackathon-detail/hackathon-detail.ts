import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DatePipe, JsonPipe } from '@angular/common'; 
import { RouterLink } from '@angular/router';
import { Hackathon } from '../../models/hackathon.model';
import { Rule } from '../../models/rule.model';
import { Account } from '../../../account/models/account.model';

import { HackathonService } from '../../service/hackathon.service';
import { AuthService } from '../../../auth/service/auth.service';
import { TeamService } from '../../../teams/service/team.service';
import { StaffService } from '../../service/staff.service';


@Component({
  selector: 'app-hackathon-detail',
  standalone: true,
  imports: [RouterLink,DatePipe, FormsModule],
  templateUrl: './hackathon-detail.html',
  styleUrl: './hackathon-detail.scss'
})
export class HackathonDetailComponent implements OnInit {

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  
  // Timer per evitare sovrapposizioni se l'utente clicca più volte
  private successTimeoutId: any;
  private errorTimeoutId: any;
  
  hackathon = signal<Hackathon | null>(null);
  modifiedHackathon = signal<Hackathon | null>(null);

  isOrganizer = false;  
  showModifyForm = false;

  teamRegistered = computed(() => {
    const user = this.authService.user();
    const hackathon = this.hackathon();
    
    if (!user || !hackathon || !hackathon.teams) return false;

    return hackathon.teams.some((team: any) => {
      if (user.idTeam && team.idTeam == user.idTeam) return true;
      if (team.leader && team.leader.idTeamMember == user.idAccount) return true;
      if (team.members && team.members.some((m: any) => m.idTeamMember == user.idAccount)) return true;
      return false;
    });
  });
  
  private leaderInternal = signal(false);
  leader = computed(() => this.leaderInternal());
  
  // --- LISTE DATI ---
  rules = signal<Rule[]>([]);
  accounts: Account[] = []; 

  // --- STATI E RICERCA MENU A TENDINA ---
  ruleSearch = '';
  ruleFocused = signal(false);
  filteredRules = signal<Rule[]>([]);
  selectedRule = signal<Rule | null>(null);

  mentorSearch = '';
  mentorFocused = signal(false);
  filteredMentors = signal<Account[]>([]);
  newMentorEmail = signal('');

  judgeFocused = signal(false);
  filteredJudges = signal<Account[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hackathonService: HackathonService,
    private teamService: TeamService,
    private staffService: StaffService,
    protected authService: AuthService
  ) {
    effect(() => {
      const user = this.authService.user();
      if (!user?.idTeam) {
        this.leaderInternal.set(false);
        return;
      }

      this.teamService.getTeamById(user.idTeam).subscribe({
        next: team => this.leaderInternal.set(team.leader?.idAccount === user.idAccount),
        error: () => this.leaderInternal.set(false)
      });
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];

    this.hackathonService.getById(id).subscribe({
      next: (data: any) => {
        console.log('--- HACKATHON DATA FROM BACKEND ---', data);
        
        this.hackathon.set(data);
        const currentUserId = this.authService.userId;

        this.isOrganizer =
          currentUserId != null &&
          data.staff && 
          (data.staff.organizerId == currentUserId || 
           data.staff.organizer?.idAccount == currentUserId || 
           data.staff.organizer?.id == currentUserId);

        if (!data.staff) {
          data.staff = { organizerId: null, organizerEmail: '', judgeId: null, judgeEmail: '', mentors: [] };
        } else if (!data.staff.mentors) {
          data.staff.mentors = [];
        }

        this.modifiedHackathon.set({ ...data });
        
        this.loadRules();
        
        if (this.isOrganizer) {
          this.loadAccounts();
        }
      },
      error: () => {
        this.router.navigate(['/hackathons']);
      }
    });
  }

  // --- METODI HELPER PER MESSAGGI (5 Secondi) ---
  
  private showSuccess(message: string) {
    this.successMessage.set(message);
    if (this.successTimeoutId) clearTimeout(this.successTimeoutId);
    this.successTimeoutId = setTimeout(() => this.successMessage.set(null), 5000);
  }

  private showError(err: any) {
    // Estrae il messaggio di errore dall'API, gestendo vari formati standard
    const backendMessage = err?.error?.message || err?.error || err?.message || 'Si è verificato un errore imprevisto';
    this.errorMessage.set(backendMessage);
    
    if (this.errorTimeoutId) clearTimeout(this.errorTimeoutId);
    this.errorTimeoutId = setTimeout(() => this.errorMessage.set(null), 5000);
  }

  // ----------------------------------------------

  loadRules() {
    this.errorMessage.set(null);
    this.hackathonService.getRules().subscribe({
      next: data => {
        this.rules.set(data);
        this.filteredRules.set(data);
      },
      error: err => this.showError(err)
    });
  }

  loadAccounts() {
    this.staffService.getStaff().subscribe({
      next: (data: Account[]) => {
        this.accounts = data;
        this.filteredMentors.set(data);
        this.filteredJudges.set(data);
      },
      error: err => console.error("Impossibile caricare gli account", err)
    });
  }

  getDuration(): string {
    const start = new Date(this.hackathon()?.startDate ?? '');
    const end = new Date(this.hackathon()?.endDate ?? '');
    const diff = end.getTime() - start.getTime();

    if (diff <= 0) return '0h';

    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    return days === 0 ? `${hours}h` : `${days}d ${hours}h`; 
  }

  registerTeam() {
    this.errorMessage.set(null);
    const id = this.hackathon()?.id!;
    
    this.hackathonService.register(id).subscribe({
      next: (res: any) => {
        this.showSuccess(res.message || "Team registered successfully!");
        this.hackathonService.getById(id).subscribe(h => this.hackathon.set(h));
      },
      error: err => this.showError(err)
    });
  }

  isLeader(): Observable<boolean> {
    const teamId = this.authService.currentUser?.idTeam;
    if (!teamId) return of(false);

    return this.teamService.getTeamById(teamId).pipe(
      map(data => {
        const currentUserId = this.authService.userId;
        return currentUserId !== null && data.leader?.idAccount === currentUserId;
      }),
      catchError((err) => {
        this.showError(err);
        return of(false);
      })
    );
  }

  unsubscribeTeam(){
    const id = this.hackathon()?.id!;
    this.hackathonService.unsubscribeTeam(id).subscribe({
      next: () => {
        this.showSuccess("Team removed successfully!");
        this.hackathonService.getById(id).subscribe(h => this.hackathon.set(h));
      },
      error: err => this.showError(err)
    });
  }

  modifyHackathon(){
    this.errorMessage.set(null);
    const modified = this.modifiedHackathon();
    if (!modified) return;

    const data: any = { 
      idHackathon: modified.id, 
      name: modified.name,
      location: modified.location,
      prize: modified.prize,
      maxTeamMembers: modified.maxTeamMembers,
      maxNumberTeams: modified.maxNumberTeams,
      startDate: modified.startDate,
      endDate: modified.endDate,
      idJudge: modified.staff?.judgeId 
    };

    this.hackathonService.updateHackathon(data).subscribe({
      next: (hackathon) => {
        this.showSuccess('Hackathon updated successfully!');
        this.hackathon.set(hackathon);
        this.modifiedHackathon.set({ ...hackathon });
        this.showModifyForm = false;
      },
      error: err => this.showError(err)
    });
  }

  // --- SEZIONE REGOLE ---

  filterRules() {
    const val = this.ruleSearch.toLowerCase();
    this.filteredRules.set(
      this.rules().filter(r => val === '' || r.name.toLowerCase().includes(val) || r.description.toLowerCase().includes(val))
    );
  }

  selectRule(r: Rule) {
    this.ruleSearch = r.name;
    this.selectedRule.set(r);
    this.ruleFocused.set(false);
  }

  addRule() {
    const rule = this.selectedRule();
    if (!rule) return;

    this.hackathonService.addRule(this.hackathon()!.id, rule.id).subscribe({
      next: (ruleData) => {
        this.showSuccess('Rule added successfully!');
        this.hackathon.update(h => {
          if (!h) return h;
          return { ...h, rules: [...(h.rules ?? []), ruleData] };
        });
        this.selectedRule.set(null);
        this.ruleSearch = '';
      },
      error: err => this.showError(err)
    });
  }

  removeRule(id: number){
    this.errorMessage.set(null);
    this.hackathonService.removeRule(this.hackathon()!.id, id).subscribe({
      next: () => {
        this.showSuccess('Rule removed successfully!');
        this.hackathon.update(h => {
          if (!h) return h;
          return { ...h, rules: h.rules?.filter(r => r.id !== id) ?? [] };
        });
      },
      error: err => this.showError(err)
    });
  }

  // --- SEZIONE GIUDICI ---

  filterJudges() {
    const val = this.modifiedHackathon()?.staff.judgeEmail?.toLowerCase() || '';
    this.filteredJudges.set(
      this.accounts.filter(a => val === '' || a.email.toLowerCase().includes(val))
    );
  }

  selectJudge(j: Account) {
    this.modifiedHackathon()!.staff.judgeEmail = j.email;
    this.modifiedHackathon()!.staff.judgeId = j.idAccount; 
    this.judgeFocused.set(false);
  }

  // --- SEZIONE MENTORI ---

  filterMentors() {
    const val = this.mentorSearch.toLowerCase();
    this.filteredMentors.set(
      this.accounts.filter(a => val === '' || a.email.toLowerCase().includes(val))
    );
  }

  selectMentor(m: Account) {
    this.mentorSearch = m.email; 
    this.newMentorEmail.set(m.email); 
    this.mentorFocused.set(false);
  }

  addMentor() {
    this.errorMessage.set(null);
    if (!this.newMentorEmail()) return;

    this.hackathonService.assignMentor(this.hackathon()?.id!, this.newMentorEmail()).subscribe({
      next: (res) => {
        if (!res) {
          this.showError({ error: 'Mentor already exists!' });
          return;
        }

        this.showSuccess("Mentor added successfully!");
        this.hackathon.update(h => {
          if (!h) return h;
          return { ...h, staff: { ...h.staff, mentors: [...(h.staff.mentors ?? []), res] } };
        });
        
        this.newMentorEmail.set('');
        this.mentorSearch = '';
      },
      error: err => this.showError(err)
    });
  }

  removeMentor(idAccount: number) {
    this.errorMessage.set(null);
    const hackathonId = this.hackathon()?.id;
    if (!hackathonId || !idAccount) {
      console.error("ID Hackathon o ID Account mancante", { hackathonId, idAccount });
      return;
    }

    this.hackathonService.removeMentor(hackathonId, idAccount).subscribe({
      next: () => {
        this.showSuccess("Mentor removed successfully!");
        
        this.hackathon.update(h => {
          if (!h || !h.staff) return h;
          return {
            ...h,
            staff: { 
              ...h.staff, 
              mentors: h.staff.mentors?.filter((m: any) => m.idAccount !== idAccount) ?? [] 
            }
          };
        });
      },
      error: err => {
        console.error(err);
        this.showError(err);
      }
    });
  }
}