import { ChangeDetectorRef, Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Team } from '../../model/team.model'; // Assicurati che il percorso sia corretto
import { Router } from '@angular/router';
import { TeamService } from '../../service/team.service';
import { InvitationService } from '../../../account/service/invitation.service';
import { AuthService } from '../../../auth/service/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-team.component.html',
  styleUrls: ['./my-team.component.scss'] // Qui potrai mettere eventuali stili specifici
})
export class MyTeamComponent {
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  team = signal<Team | null>(null); 
  loading = signal(true);

  newMemberEmail = signal('');

  showModifyForm = false;

  name = '';
  description = '';

  isLeader = false;  

  confirmDialog = signal<ConfirmDialogConfig | null>(null);

  constructor(
    private router: Router,
    private teamService: TeamService,
    private invitationService : InvitationService,
    protected authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  
  /**
   * Loads the selected team's details on component initialization.
   * Also determines if the current user is the leader of the team.
   */
  ngOnInit() {
    this.teamService.getTeamById(this.authService.teamId!).subscribe({
      next: (data) => {
        this.team.set(data);
        this.loading.set(false);

        const currentUserId = this.authService.currentUser?.idAccount;

        console.log(currentUserId);
        console.log(data);

        this.isLeader =
          currentUserId !== null &&
          data.leader?.idAccount === currentUserId;

        this.name = this.team()!.name;
        this.description = this.team()!.description;
      },

      error: () => {
        if(this.authService.isUser()){
          this.router.navigate(['/teams']);
        }
        else{
          this.router.navigate(['/dashboard']);
        }
      }
    });
  }

  /**
   * Sends an invitation to a new member using their email.
   */
  inviteMember(){
    this.errorMessage.set(null);

    if (!this.newMemberEmail()) return;

    this.invitationService.invite(this.newMemberEmail()).subscribe({
      next: () => {
        this.successMessage.set('Invitation sended!');
        this.newMemberEmail.set('');
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: err => {
        this.errorMessage.set(err.message);
      }
    });
  }

  
  /**
   * Allows the user to leave the team.
   */
  leave(){
    this.errorMessage.set(null);
    if(this.isLeader)
    {
      this.leaveTeamForLeader();
    }
    else
    {
      this.leaveTeamForMember();
    }
  }

  private leaveTeamForLeader(){
    this.teamService.leaveTeamForLeader().subscribe({
      next: () => {
        this.successMessage.set('You left the team!');
        this.team.set(null);
        this.authService.updateTeamId(null);
        setTimeout(() => this.successMessage.set(null), 3000);
        this.router.navigate(['/teams']);
      },
      error: err => {
        this.errorMessage.set(err.message);
      }
    })
  }

  private leaveTeamForMember(){
    this.teamService.leaveTeamForMember().subscribe({
      next: () => {
        this.successMessage.set('You left the team!');
        this.team.set(null);
        this.authService.updateTeamId(null);
        setTimeout(() => this.successMessage.set(null), 3000);
        this.router.navigate(['/teams']);
      },
      error: err => {
        this.errorMessage.set(err.message);
      }
    })
  }


  /**
   * Updates the team's name and description (leader only).
   */
  modifyTeam(){
    this.errorMessage.set(null);
    this.teamService.updateTeam(this.name, this.description).subscribe({
      next: (team) => {
        this.successMessage.set('Team updated');
        this.team.set(team);
        this.name = team.name;
        this.description = team.description;
        this.showModifyForm = false;
        this.cdr.detectChanges();
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: err => {
        this.errorMessage.set(err.message);
      }
    })
  }

  /**
   * Removes a member from the team (leader only).
   */
  removeMember(id:number)
  {
    this.errorMessage.set(null);
    this.teamService.removeMember(id).subscribe({
      next: () => {
        this.successMessage.set('Member removed');
        const team = this.team();
        if (team) {
          team.members = (team.members ?? []).filter(
            m => m.idAccount !== id
          );
        }
        this.cdr.detectChanges();
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: err => {
        this.errorMessage.set(err.message);
      }
    });
  }

  closeDialog() {
    this.confirmDialog.set(null);
  }

  askLeave() {
    const hasMembers = (this.team()?.members?.length ?? 0) > 0;

    if (this.isLeader) {
      this.confirmDialog.set({
        type: 'danger',
        icon: 'fa-solid fa-arrow-right-from-bracket',
        title: 'Lasciare il team?',
        message: 'Stai per abbandonare il tuo team come leader.',
        warning: hasMembers
          ? 'Il ruolo di leader verrà assegnato automaticamente ad un altro membro del team.'
          : 'Non ci sono altri membri: abbandonando il team, questo verrà eliminato definitivamente.',
        confirmLabel: 'Sì, lascia',
        onConfirm: () => {
          this.closeDialog();
          this.leave();
        }
      });
    } else {
      this.confirmDialog.set({
        type: 'danger',
        icon: 'fa-solid fa-arrow-right-from-bracket',
        title: 'Lasciare il team?',
        message: 'Stai per abbandonare il team. Potrai unirti o crearne uno nuovo in qualsiasi momento.',
        confirmLabel: 'Sì, lascia',
        onConfirm: () => {
          this.closeDialog();
          this.leave();
        }
      });
    }
  }

  askRemoveMember(member: { idAccount: number; nickname: string }) {
    this.confirmDialog.set({
      type: 'danger',
      icon: 'fa-solid fa-user-xmark',
      title: 'Rimuovere il membro?',
      message: `Stai per rimuovere ${member.nickname} dal team. L'utente potrà essere reinvitato in seguito.`,
      confirmLabel: 'Rimuovi',
      onConfirm: () => {
        this.closeDialog();
        this.removeMember(member.idAccount);
      }
    });
  }
}