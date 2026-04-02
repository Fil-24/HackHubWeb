import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HackathonService } from '../service/hackathon.service';
import { Hackathon } from '../../home/models/hackathon.model';

@Component({
  selector: 'app-hackathon',
  templateUrl: './hackathon.component.html',
  styleUrls: ['./hackathon.component.scss'],
  imports: [DatePipe, RouterLink],
})
export class HackathonComponent implements OnInit {
  hackathon = signal<Hackathon | null>(null);
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(true);
  isRegistered = signal<boolean>(false);

  /** true se la data di fine è nel futuro */
  isOpen = computed(() => {
    const h = this.hackathon();
    if (!h) return false;
    return new Date(h.endDate) > new Date();
  });

  /** Durata in giorni interi */
  durataDays = computed(() => {
    const h = this.hackathon();
    if (!h) return 0;
    const ms = new Date(h.endDate).getTime() - new Date(h.startDate).getTime();
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  });

  constructor(
    private route: ActivatedRoute,
    private detailService: HackathonService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('ID hackathon non valido.');
      this.isLoading.set(false);
      return;
    }
    this.caricaDettaglio(id);
  }

  caricaDettaglio(id: string): void {
    this.isLoading.set(true);
    this.detailService.getById(id).subscribe({
      next: (data: Hackathon | null) => {
        this.hackathon.set(data);
        this.isLoading.set(false);
      },
      error: (err: { message: string | null; }) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  iscriviti(): void {
    const h = this.hackathon();
    if (!h || !this.isOpen() || this.isRegistered()) return;

    this.detailService.register(h.id.toString()).subscribe({
      next: () => {
        this.isRegistered.set(true);
      },
      error: (err: { message: string | null; }) => {
        this.errorMessage.set(err.message);
      },
    });
  }
}