import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../auth/service/auth.service';
import { FormsModule } from '@angular/forms';
import { creaHackathonService } from '../../service/creaHackathon.service';
import { Rule } from '../../models/rule.model';
import { Staff } from '../../models/staff.model';
@Component({
  selector: 'app-crea-hackathon',
  imports: [FormsModule],
  templateUrl: './creaHackathon.component.html',
  styleUrl: './creaHackathon.component.scss',
})
export class CreaHackathon implements OnInit {
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  minDate: string;
  //liste per giudici, mentori e regole
  giudiceSelezionato: Staff | null = null;
  mentoriSelezionati: Staff[] = [];
  //items : Staff[] = []
  items: Staff[] = [
    { id: 1, name: 'Alice Rossi', email: 'alice.rossi@email.it', role: 'JUDGE' },
    { id: 2, name: 'Marco Bianchi', email: 'marco.bianchi@email.it', role: 'MENTOR' },
    { id: 3, name: 'Giulia Verdi', email: 'giulia.verdi@email.it', role: 'MENTOR' },
    { id: 4, name: 'Luca Neri', email: 'luca.neri@email.it', role: 'JUDGE' },
    { id: 5, name: 'Sara Colombo', email: 'sara.colombo@email.it', role: 'MENTOR' },
    { id: 6, name: 'Paolo Esposito', email: 'paolo.esposito@email.it', role: 'JUDGE' },
    { id: 7, name: 'Chiara Marino', email: 'chiara.marino@email.it', role: 'MENTOR' },
    { id: 8, name: 'Roberto Greco', email: 'roberto.greco@email.it', role: 'JUDGE' },
  ];
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



  hackathonData = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: 0,
    tags: [] as string[]
  };


  constructor(public authService: AuthService, private creaHackathonService: creaHackathonService) {
    const user = this.authService.user();
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const localDateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    this.hackathonData.startDate = localDateTime;
    this.minDate = localDateTime;
    this.hackathonData.endDate = localDateTime;

  }
  ngOnInit(): void {
    this.creaHackathonService.getRules().subscribe(data => {
      this.regole = data;
    });
  }
  saveChanges() { }
  cancelEdit() { }


  filtraGiudici() {
    const val = this.searchGiudice.toLowerCase();
    this.giudiciFiltrati = val
      ? this.items.filter(i =>
        i.role === 'JUDGE' &&
        i.name.toLowerCase().includes(val)
      )
      : [];
  }

  selezionaGiudice(item: Staff) {
    this.searchGiudice = item.name;
    this.giudiceSelezionato = item;
    this.giudiciFiltrati = [];
  }

  filtraMentori() {
    const val = this.searchMentore.toLowerCase();
    this.mentoriFiltrati = val
      ? this.items.filter(i =>
        i.role === 'MENTOR' &&
        i.name.toLowerCase().includes(val) &&
        !this.mentoriSelezionati.find(m => m.id === i.id)
      )
      : [];
  }

  selezionaMentore(item: Staff) {
    this.mentoriSelezionati.push(item);
    this.searchMentore = '';
    this.mentoriFiltrati = [];
  }

  rimuoviMentore(item: Staff) {
    this.mentoriSelezionati = this.mentoriSelezionati.filter(m => m.id !== item.id);
  }

  // --- Regole ---
  filtraRegole() {
    const val = this.searchRegola.toLowerCase();
    this.regoleFiltrate = val
      ? this.regole.filter(r =>
        r.description.toLowerCase().includes(val) &&
        !this.regoleSelezionate.find(s => s.id === r.id)
      )
      : [];
  }

  selezionaRegola(item: Rule) {
    this.regoleSelezionate.push(item);
    this.searchRegola = '';
    this.regoleFiltrate = [];
  }

  rimuoviRegola(item: Rule) {
    this.regoleSelezionate = this.regoleSelezionate.filter(r => r.id !== item.id);
  }

  // chiude il dropdown al blur con un piccolo delay
  // per permettere il click sull'item prima che si chiuda
  chiudiDropdown(tipo: string) {
    setTimeout(() => {
      if (tipo === 'giudice') this.giudiciFiltrati = [];
      if (tipo === 'mentore') this.mentoriFiltrati = [];
      if (tipo === 'regola') this.regoleFiltrate = [];
    }, 150);
  }

}
