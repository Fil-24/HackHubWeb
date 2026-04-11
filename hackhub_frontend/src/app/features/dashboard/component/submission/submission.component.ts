import { Component, inject, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { SubmissionService } from '../../service/submission.service';
import { SubmissionResponse } from '../../models/submission.model';
import { Team } from '../../../teams/model/team.model';
import { AuthService } from '../../../auth/service/auth.service';

@Component({
  selector: 'app-submission',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './submission.component.html',
  styleUrl: './submission.component.scss',
})
export class SubmissionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private submissionService = inject(SubmissionService);
  protected authService = inject(AuthService); // Protected for HTML template use

  hackathonId = signal<number | null>(null);

  // --- DATA STATES ---
  submissions = signal<SubmissionResponse[]>([]); // Staff only
  winner = signal<Team | null>(null);     // Everyone

  // --- FORM & UI STATES ---
  githubUrl = signal<string>('');
  submittedAt = signal<string>('');
  mySubmissionId = signal<number | null>(null);
  isSubmitting = signal<boolean>(false);
  isUpdating = signal<boolean>(false);
  editMode = signal<boolean>(false);

  // --- MESSAGE HANDLING ---
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  private successTimeoutId: any;
  private errorTimeoutId: any;

  // --- REACTIVE ROLES ---
  isTeamMember = signal<boolean>(false);
  isStaff = signal<boolean>(false);

  constructor() {
    effect(() => {
      const user = this.authService.user();
      console.log('User in effect:', user);

      if (user) {
        this.isTeamMember.set(!!user.idTeam);
        this.isStaff.set(user.role === 'STAFF');

        // sposta qui la logica che dipende dai valori
        const id = this.hackathonId();
        if (id) {
          if (this.isStaff()) {
            this.loadStaffDashboard(id);
          }
          if (this.isTeamMember()) {
            this.checkMySubmission();
          }
        }
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
    }
  }

  // --- HELPER METHODS FOR MESSAGES (5 Seconds) ---
  private showSuccess(message: string) {
    this.successMessage.set(message);
    if (this.successTimeoutId) clearTimeout(this.successTimeoutId);
    this.successTimeoutId = setTimeout(() => this.successMessage.set(null), 5000);
  }

  private showError(err: any) {
    const backendMessage = err?.error?.message || err?.error || err?.message || 'An unexpected error occurred';
    this.errorMessage.set(backendMessage);

    if (this.errorTimeoutId) clearTimeout(this.errorTimeoutId);
    this.errorTimeoutId = setTimeout(() => this.errorMessage.set(null), 5000);
  }

  // --- STAFF METHODS ---
  loadStaffDashboard(idHackathon: number) {
    // Using the newly added method to fetch ALL submissions for the hackathon
    this.submissionService.getSubmissionsByHackathon(idHackathon).subscribe({
      next: (data) => {
        console.log('Submissions for Hackathon ID', idHackathon, ':', data);
        this.submissions.set(data);
      },
      error: (err) => this.showError(err)
    });
  }

  // --- GENERAL METHODS ---
  checkWinner(idHackathon: number) {
    this.submissionService.getWinner(idHackathon).subscribe({
      next: (winnerTeam) => this.winner.set(winnerTeam),
      error: () => this.winner.set(null) // No winner yet or 404
    });
  }

  // --- TEAM METHODS ---
  checkMySubmission() {
    this.submissionService.getSubmissionForTeam(this.hackathonId()!).subscribe({
        next: (submission) => {
            console.log('My submission:', submission);
            this.githubUrl.set(submission.repositoryUrl ?? '');
            this.mySubmissionId.set(submission.id ?? null);
            this.submittedAt.set(submission.submittedAt ?? '');
            this.isUpdating.set(false);
        },
        error: (err) => {
            if (err.status === 400 || err.status === 404) {
                this.isUpdating.set(false);
            }
        }
    });
  }

  submitGithubRepo() {
    const id = this.hackathonId();
    if (!id || !this.githubUrl()) return;

    this.isSubmitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const payload = { idHackathon: id, type: 'github', source: this.githubUrl() };
    console.log(payload);
    
    this.submissionService.submitProject(payload).subscribe({
      next: () => {
        this.showSuccess('GitHub repository linked successfully!');
        this.isSubmitting.set(false);
        // We can call this.checkMySubmission() here to update the UI once the endpoint is ready
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
        this.showSuccess('Latest commit fetched from the server successfully!');
        this.isUpdating.set(false);
      },
      error: (err) => {
        this.showError(err);
        this.isUpdating.set(false);
      }
    });
  }
}