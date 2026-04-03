import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Team } from '../../models/team.model'; // Assicurati che il percorso sia corretto

@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-team.component.html',
  styleUrls: ['./my-team.component.scss'] // Qui potrai mettere eventuali stili specifici
})
export class MyTeamComponent {
  // Riceve il team in input dal componente padre come Signal
  team = input.required<Team>();
}