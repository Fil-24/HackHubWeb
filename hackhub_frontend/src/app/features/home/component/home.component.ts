import { Component, OnInit , signal} from '@angular/core';
import { HomeService } from '../service/home.service';
import { Hackathon } from '../models/hackathon.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  hackathon: Hackathon[] = [];
  errorMessage = signal<string | null>(null);
  searchQuery = '';

  constructor(private homeService: HomeService) {}

  ngOnInit(): void {
    this.caricaHackathon();
  }

  caricaHackathon(): void {
    this.homeService.getAll().subscribe({
      next: (data) => {
        this.hackathon = data;
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
        this.hackathon = data;
      },
      error: (err) => {
        this.errorMessage.set(err.message);
      }
    });
  }
}

