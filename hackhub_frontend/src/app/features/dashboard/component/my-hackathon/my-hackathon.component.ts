import { Component, OnInit, signal } from '@angular/core';
import { Hackathon } from '../../models/hackathon.model';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/service/auth.service';
import { HackathonService } from '../../service/hackathon.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hackathons',
  imports: [RouterLink, FormsModule],
  templateUrl: './my-hackathon.component.html',
  styleUrl: './my-hackathon.component.scss',
})
export class MyHackathonComponent implements OnInit {
  hackathon = signal<Hackathon[]>([]);
  errorMessage = signal<string | null>(null);
  searchTerm = signal<string>('');
  filtroTempo = signal('tutti');
  ordinamento = signal('data-asc');
  showFiltri = false;

  constructor(private hackathonService: HackathonService, protected authService: AuthService) { }
  ngOnInit(): void {
    this.caricaHackathon();
  }

  caricaHackathon(): void {
    this.hackathonService.getMyHackathons().subscribe({
      next: (data) => {
        // ordina i hackathon in base alla data di inizio
        const ora = new Date();
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
    return this.hackathon()!.filter(hackathon => {
      // Verifica se il nome del hackathon corrisponde al termine di ricerca
      const nomeMatch = !this.searchTerm() || hackathon.name.toLowerCase().includes(this.searchTerm().toLowerCase());
      // Verifica il filtro di tempo
      switch (this.filtroTempo()) {
        case 'futuri':
          return nomeMatch && new Date(hackathon.startDate) > dataAttuale;
        case 'passati':
          return nomeMatch && new Date(hackathon.endDate) < dataAttuale;
        default:
          return nomeMatch;
      }
    }).sort((a, b) => {
      // Ordina i hackathon in base all'ordinamento selezionato
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


setFiltroTempo(filtro: string) {
    this.filtroTempo.set(filtro);
    console.log('Filtro tempo impostato su:', filtro);
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

