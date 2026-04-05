import { Component, OnInit, signal } from '@angular/core';
import { HomeService } from '../../service/home.service';
import { Hackathon } from '../../models/hackathon.model';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [RouterLink]
})
export class HomeComponent implements OnInit {
  hackathon = signal<Hackathon[] | null>(null);
  errorMessage = signal<string | null>(null);
  searchQuery = '';

  constructor(private homeService: HomeService) { }

  ngOnInit(): void {
    this.caricaHackathon();
  }

  caricaHackathon(): void {
    this.homeService.getAll().subscribe({
      next: (data) => {
        //filtra e ordina i hackathon in base alla data di inizio, mostrando solo quelli futuri
        const ora = new Date();
        const ordinati = data
          .filter(h => new Date(h.startDate) > ora)
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        this.hackathon.set(ordinati);
      },
      error: (err) => {
        this.errorMessage.set(err.message);
      }
    });
  }
  //TODO: aggiungere validazione input,e invio richiesta al backend, e gestione risposta
  cerca(): void {
    if (!this.searchQuery.trim()) {
      this.caricaHackathon();
      return;
    }
    this.homeService.cerca(this.searchQuery).subscribe({
      next: (data) => {
        this.hackathon.set(data);
      },
      error: (err) => {
        this.errorMessage.set(err.message);
      }
    });
  }
}

