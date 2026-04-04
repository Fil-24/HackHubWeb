import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../auth/service/auth.service';
import { FormsModule } from '@angular/forms';
import { creaHackathonService } from '../../service/creaHackathon.service';
import { Rule } from '../../models/rule.model';
import { Staff } from '../../models/staff.model';
import { Router } from '@angular/router';
import { min } from 'rxjs';
@Component({
  selector: 'app-crea-hackathon',
  imports: [FormsModule],
  templateUrl: './creaHackathon.component.html',
  styleUrl: './creaHackathon.component.scss',
})
export class CreaHackathon implements OnInit {
  // messaggi di errore/successo
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  //data minima per i campi data (oggi)
  minDate!: string;
  //liste per giudici, mentori e regole
  giudiceSelezionato: Staff | null = null;
  mentoriSelezionati: Staff[] = [];
  items: Staff[] = []
  regole: Rule[] = []
  regoleSelezionate: Rule[] = [];

  // Variabili per la ricerca e i risultati filtrati
  // per la ricerca dei giudici, mentori e regole
  searchGiudice: string = '';
  searchMentore: string = '';
  searchRegola: string = '';
  // risultati filtrati
  giudiciFiltrati: Staff[] = [];
  mentoriFiltrati: Staff[] = [];
  regoleFiltrate: Rule[] = [];
  showGiudici = signal(false);
  showMentori = signal(false);
  showRegole = signal(false);


// dati del form
  hackathonData = {
    nome: '',
    localita: '',
    startDate: '',
    endDate: '',
    premio: 0,
    maxParticipants: 0,
    maxParticipantsPerTeam: 0,
  };


  constructor(public authService: AuthService, private creaHackathonService: creaHackathonService, private router: Router) {
    const user = this.authService.user();
  }
  ngOnInit(): void {
    // Imposta la data minima (oggi) per i campi data
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const localDateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    this.hackathonData.startDate = localDateTime;
    this.minDate = localDateTime;
    this.hackathonData.endDate = localDateTime;
    // Carica regole e staff per i dropdown
    this.creaHackathonService.getRules().subscribe(data => {
      this.regole = data;
    });
    this.creaHackathonService.getStaff().subscribe(data => {
      this.items = data;
    });
  }
  saveChanges() {
    // Validazione dei campi
    if (!this.hackathonData.nome || !this.hackathonData.localita || !this.hackathonData.startDate || !this.hackathonData.endDate) {
      this.errorMessage.set("Compila tutti i campi obbligatori");
      return;
    }
    if (this.hackathonData.premio < 0 || this.hackathonData.maxParticipants < 1 || this.hackathonData.maxParticipantsPerTeam < 1) {
      this.errorMessage.set("Valori numerici non validi");
      return;
    }
    if (this.giudiceSelezionato === null) {
      this.errorMessage.set("Seleziona un giudice");
      return;
    }
    if (this.mentoriSelezionati.length === 0) {
      this.errorMessage.set("Seleziona almeno un mentore");
      return;
    }
    if (this.regoleSelezionate.length === 0) {
      this.errorMessage.set("Seleziona almeno una regola");
      return;
    }

    //trasforma i dati in formato adatto al backend
    const data = {
    name: this.hackathonData.nome,
    location: this.hackathonData.localita,
    prize: this.hackathonData.premio,
    maxTeamMembers: this.hackathonData.maxParticipantsPerTeam,
    maxNumberTeams: this.hackathonData.maxParticipants,
    startDate: this.hackathonData.startDate + ':00',
    endDate: this.hackathonData.endDate + ':00',
    judgeEmail: this.giudiceSelezionato?.email,
    mentorEmails: this.mentoriSelezionati.map(m => m.email),
    idRules: this.regoleSelezionate.map(r => r.id)
};
// invia i dati al backend per creare l'hackathon e gestisce la risposta mostrando messaggi di successo o errore e reindirizzando alla pagina dell'hackathon creato in caso di successo
    this.creaHackathonService.createHackathon(data).subscribe({
      next: (res) => {
        this.successMessage.set("Hackathon creato con successo!");
        this.errorMessage.set(null);
        console.log('Hackathon creato:', res);
        setTimeout(() => {
          this.router.navigate(['/hackathon/' + res.id]);
        }, 1500);
      },
      error: (err) => {
        this.errorMessage.set("Errore nella creazione dell'hackathon");
        this.successMessage.set(null);
      }
    });
  }
  cancelEdit() {
    // Resetta i dati del form
    this.hackathonData = {
      nome: '',
      localita: '',
      startDate: this.minDate,
      endDate: this.minDate,
      premio: 0,
      maxParticipants: 0,
      maxParticipantsPerTeam: 0,
    };
    this.giudiceSelezionato = null;
    this.searchGiudice = '';
    this.mentoriSelezionati = [];
    this.searchMentore = '';
    this.regoleSelezionate = [];
    this.searchRegola = '';
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }


  //filtra e seleziona giudici, mentori e regole per i dropdown con ricerca
  filtraGiudici() {
    const val = this.searchGiudice.toLowerCase();
    this.giudiciFiltrati = this.items.filter(i =>
      val === '' || i.email.toLowerCase().includes(val)
    );
    this.showGiudici.set(true);
  }

  selezionaGiudice(item: Staff) {
    this.searchGiudice = item.email;
    this.giudiceSelezionato = item;
    this.showGiudici.set(false);
  }

  filtraMentori() {
    const val = this.searchMentore.toLowerCase();
    this.mentoriFiltrati = this.items.filter(i =>
      (val === '' || i.email.toLowerCase().includes(val)) &&
      !this.mentoriSelezionati.find(m => m.id === i.id)
    );
    this.showMentori.set(true);
  }

  selezionaMentore(item: Staff) {
    this.mentoriSelezionati.push(item);
    this.searchMentore = '';
    this.showMentori.set(false);
  }

  rimuoviMentore(item: Staff) {
    this.mentoriSelezionati = this.mentoriSelezionati.filter(m => m.id !== item.id);
  }

  filtraRegole() {
    const val = this.searchRegola.toLowerCase();
    this.regoleFiltrate = this.regole.filter(r =>
      (val === '' || r.description.toLowerCase().includes(val)) &&
      !this.regoleSelezionate.find(s => s.id === r.id)
    );
    this.showRegole.set(true);
  }

  selezionaRegola(item: Rule) {
    this.regoleSelezionate.push(item);
    this.searchRegola = '';
    this.showRegole.set(false);
  }


  rimuoviRegola(item: Rule) {
    this.regoleSelezionate = this.regoleSelezionate.filter(r => r.id !== item.id);
  }

  // chiude il dropdown
  chiudiDropdown(tipo: string) {
    if (tipo === 'giudice') this.showGiudici.set(false);
    if (tipo === 'mentore') this.showMentori.set(false);
    if (tipo === 'regola') this.showRegole.set(false);
  }

}
