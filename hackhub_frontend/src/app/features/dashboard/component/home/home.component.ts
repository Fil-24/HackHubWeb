import { Component, OnInit, signal } from '@angular/core';
import { HomeService } from '../../service/home.service';
import { Hackathon } from '../../models/hackathon.model';
import { RouterLink } from "@angular/router";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [RouterLink,FormsModule]
})
export class HomeComponent implements OnInit {
  hackathon = signal<Hackathon[] >([]);
  errorMessage = signal<string | null>(null);
  search = '';

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
  filtro(): Hackathon[] {
    if (!this.hackathon()) {
      return [];
    }
    const dataAttuale = new Date();
    return this.hackathon()!.filter(hackathon => {
      return !this.search || hackathon.name.toLowerCase().includes(this.search.toLowerCase());
    });
  }
}

