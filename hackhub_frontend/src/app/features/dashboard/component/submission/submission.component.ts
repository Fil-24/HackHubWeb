import { Component, inject, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { SubmissionService } from '../../service/submission.service';
import { SubmissionResponse } from '../../models/submission.model';
import { Team } from '../../../teams/model/team.model';
import { AuthService } from '../../../auth/service/auth.service';

@Component({
  selector: 'app-submission',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submission.component.html',
  styleUrl: './submission.component.scss',
})
export class SubmissionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private submissionService = inject(SubmissionService);
  protected authService = inject(AuthService); // Usiamo protected se serve nell'HTML

  hackathonId = signal<number | null>(null);

  // --- STATI DEI DATI ---
  submissions = signal<SubmissionResponse[]>([]); // Solo per lo staff
  winner = signal<Team | null>(null);     // Per tutti
  
  // --- STATI DEL FORM E UI ---
  githubUrl = signal<string>('');
  mySubmissionId = signal<number | null>(null); 
  isSubmitting = signal<boolean>(false);
  isUpdating = signal<boolean>(false);
  
  // --- GESTIONE MESSAGGI (Stile HackathonDetail) ---
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  private successTimeoutId: any;
  private errorTimeoutId: any;

  // --- RUOLI REATTIVI ---
  // Invece di usare boolean statici, usiamo i Signal derivati per i ruoli
  isTeamMember = signal<boolean>(false);
  isStaff = signal<boolean>(false);

  constructor() {
    // Reagiamo ai cambiamenti dell'utente loggato come nel tuo altro componente
    effect(() => {
      const user = this.authService.user();
      
      if (user) {
        // Logica Team: se l'utente ha un idTeam associato
        this.isTeamMember.set(!!user.idTeam);
        
        // Logica Staff: da adattare in base a come salvi il ruolo (es. user.role === 'STAFF')
        this.isStaff.set(user.role === 'STAFF');
      } else {
        this.isTeamMember.set(false);
        this.isStaff.set(false);
      }
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const numId = +id;
      this.hackathonId.set(numId);
      this.checkWinner(numId);

      if (this.isStaff()) {
        this.loadStaffDashboard(numId);
      }
      
      if (this.isTeamMember()) {
        this.checkMySubmission();
      }
    }
  }

  // --- METODI HELPER PER MESSAGGI (5 Secondi) ---
  private showSuccess(message: string) {
    this.successMessage.set(message);
    if (this.successTimeoutId) clearTimeout(this.successTimeoutId);
    this.successTimeoutId = setTimeout(() => this.successMessage.set(null), 5000);
  }

  private showError(err: any) {
    const backendMessage = err?.error?.message || err?.error || err?.message || 'Si è verificato un errore imprevisto';
    this.errorMessage.set(backendMessage);
    
    if (this.errorTimeoutId) clearTimeout(this.errorTimeoutId);
    this.errorTimeoutId = setTimeout(() => this.errorMessage.set(null), 5000);
  }

  // --- METODI PER LO STAFF ---
  loadStaffDashboard(idHackathon: number) {
    // NOTA BENE: Nel SubmissionService che mi hai inviato manca ancora questo metodo per prendere
    // TUTTE le sottomissioni. Dovrai aggiungerlo nel Service, ad esempio: getSubmissionsByHackathon(id)
    
    /* this.submissionService.getSubmissionsByHackathon(idHackathon).subscribe({
      next: (data) => this.submissions.set(data),
      error: (err) => this.showError(err)
    });
    */
  }

  // --- METODI PER TUTTI ---
  checkWinner(idHackathon: number) {
    this.submissionService.getWinner(idHackathon).subscribe({
      next: (winnerTeam) => this.winner.set(winnerTeam),
      error: () => this.winner.set(null) // Nessun vincitore o 404
    });
  }

  // --- METODI PER IL TEAM ---
  checkMySubmission() {
    // Qui andrà la logica per capire se il team ha già fatto una sottomissione.
    // Se la trovi, fai: this.mySubmissionId.set(sottomissioneTrovata.id);
  }

  submitGithubRepo() {
    const id = this.hackathonId();
    if (!id || !this.githubUrl()) return;

    this.isSubmitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const payload = { idHackathon: id, type: 'github', source: this.githubUrl() };

    this.submissionService.submitProject(payload).subscribe({
      next: () => {
        this.showSuccess('Repository GitHub collegata con successo!');
        this.isSubmitting.set(false);
        // Qui potresti chiamare di nuovo this.checkMySubmission() per aggiornare l'UI
      },
      error: (err) => {
        this.showError(err);
        this.isSubmitting.set(false);
      }
    });
  }

  updateCommit() {
    const subId = this.mySubmissionId();
    if (!subId) return;

    this.isUpdating.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.submissionService.updateSubmission(subId).subscribe({
      next: () => {
        this.showSuccess('Ultimo commit recuperato dal server con successo!');
        this.isUpdating.set(false);
      },
      error: (err) => {
        this.showError(err);
        this.isUpdating.set(false);
      }
    });
  }
}