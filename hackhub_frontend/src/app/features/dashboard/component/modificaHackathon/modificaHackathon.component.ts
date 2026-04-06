import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { creaHackathonService } from '../../service/creaHackathon.service';
import { ModificaHackathonService } from '../../service/modificaHackathon.service';
import { Rule } from '../../models/rule.model';
import { Staff } from '../../models/staff.model';

@Component({
  selector: 'app-modifica-hackathon',
  imports: [FormsModule],
  templateUrl: './modificaHackathon.component.html',
  styleUrl: './modificaHackathon.component.scss',
})
export class ModificaHackathon implements OnInit {

  hackathonId!: number;

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  minDate!: string;

  giudiceSelezionato: Staff | null = null;
  mentoriSelezionati: Staff[] = [];
  items: Staff[] = [];
  regole: Rule[] = [];
  regoleSelezionate: Rule[] = [];

  searchGiudice: string = '';
  searchMentore: string = '';
  searchRegola: string = '';

  giudiciFiltrati: Staff[] = [];
  mentoriFiltrati: Staff[] = [];
  regoleFiltrate: Rule[] = [];

  showGiudici = signal(false);
  showMentori = signal(false);
  showRegole = signal(false);

  hackathonData = {
    nome: '',
    localita: '',
    startDate: '',
    endDate: '',
    premio: 0,
    maxParticipants: 0,
    maxParticipantsPerTeam: 0,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private creaService: creaHackathonService,
    private modificaService: ModificaHackathonService,
  ) {}

  ngOnInit(): void {
    // Data minima = oggi
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    this.minDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    // Legge l'id dall'URL
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('ID hackathon non valido.');
      return;
    }
    this.hackathonId = +id;

    // Carica le liste per i dropdown
    this.creaService.getRules().subscribe(data => this.regole = data);
    this.creaService.getStaff().subscribe(data => this.items = data);

    // Carica i dati attuali dell'hackathon e precompila il form
    this.modificaService.getById(this.hackathonId).subscribe({
      next: (h) => {
        // Formatta le date in formato datetime-local (YYYY-MM-DDTHH:mm)
        this.hackathonData = {
          nome: h.name,
          localita: h.location,
          premio: h.prize,
          maxParticipants: h.maxNumberTeams,
          maxParticipantsPerTeam: h.maxTeamMembers,
          startDate: h.startDate.slice(0, 16),
          endDate: h.endDate.slice(0, 16),
        };

        // Precompila giudice
        if ((h.staff as any)?.judgeEmail) {
          this.searchGiudice = (h.staff as any).judgeEmail;
          this.giudiceSelezionato = { 
            id: (h.staff as any).judgeId, 
            email: (h.staff as any).judgeEmail,
            name: (h.staff as any).judgeName
          };
        }

        // Precompila mentori
        if ((h.staff as any)?.mentors) {
          this.mentoriSelezionati = (h.staff as any).mentors.map(
            (m: any) => ({ id: m.id, email: m.email })
          );
        }

        // Precompila regole
        if (h.rules) {
          this.regoleSelezionate = h.rules.map(r => ({ id: r.id, name: r.name, description: r.description }));
        }
      },
      error: () => this.errorMessage.set('Errore nel caricamento dei dati.')
    });
  }

  saveChanges(): void {
    // Validazione
    if (!this.hackathonData.nome || !this.hackathonData.localita ||
        !this.hackathonData.startDate || !this.hackathonData.endDate) {
      this.errorMessage.set('Compila tutti i campi obbligatori');
      return;
    }
    if (this.hackathonData.premio < 0 || this.hackathonData.maxParticipants < 1 ||
        this.hackathonData.maxParticipantsPerTeam < 1) {
      this.errorMessage.set('Valori numerici non validi');
      return;
    }
    if (!this.giudiceSelezionato) {
      this.errorMessage.set('Seleziona un giudice');
      return;
    }
    if (this.mentoriSelezionati.length === 0) {
      this.errorMessage.set('Seleziona almeno un mentore');
      return;
    }
    /*
    if (this.regoleSelezionate.length === 0) {
      this.errorMessage.set('Seleziona almeno una regola');
      return;
    }
    */

    const data = {
      name: this.hackathonData.nome,
      location: this.hackathonData.localita,
      prize: this.hackathonData.premio,
      maxTeamMembers: this.hackathonData.maxParticipantsPerTeam,
      maxNumberTeams: this.hackathonData.maxParticipants,
      startDate: this.hackathonData.startDate + ':00',
      endDate: this.hackathonData.endDate + ':00',
      judgeEmail: this.giudiceSelezionato.email,
      mentorEmails: this.mentoriSelezionati.map(m => m.email),
      idRules: this.regoleSelezionate.map(r => r.id),
    };

    this.modificaService.updateHackathon(this.hackathonId, data).subscribe({
      next: () => {
        this.successMessage.set('Hackathon modificato con successo!');
        this.errorMessage.set(null);
        setTimeout(() => {
          this.router.navigate(['/hackathon', this.hackathonId]);
        }, 1500);
      },
      error: () => {
        this.errorMessage.set("Errore nella modifica dell'hackathon");
        this.successMessage.set(null);
      }
    });
  }

  cancelEdit(): void {
    // Torna al dettaglio senza salvare
    this.router.navigate(['/hackathon', this.hackathonId]);
  }

  // ── Dropdown giudice ──
  filtraGiudici(): void {
    const val = this.searchGiudice.toLowerCase();
    this.giudiciFiltrati = this.items.filter(i =>
      val === '' || i.email.toLowerCase().includes(val)
    );
    this.showGiudici.set(true);
  }

  selezionaGiudice(item: Staff): void {
    this.searchGiudice = item.email;
    this.giudiceSelezionato = item;
    this.showGiudici.set(false);
  }

  // ── Dropdown mentori ──
  filtraMentori(): void {
    const val = this.searchMentore.toLowerCase();
    this.mentoriFiltrati = this.items.filter(i =>
      (val === '' || i.email.toLowerCase().includes(val)) &&
      !this.mentoriSelezionati.find(m => m.id === i.id)
    );
    this.showMentori.set(true);
  }

  selezionaMentore(item: Staff): void {
    this.mentoriSelezionati.push(item);
    this.searchMentore = '';
    this.showMentori.set(false);
  }

  rimuoviMentore(item: Staff): void {
    this.mentoriSelezionati = this.mentoriSelezionati.filter(m => m.id !== item.id);
  }

  // ── Dropdown regole ──
  filtraRegole(): void {
    const val = this.searchRegola.toLowerCase();
    this.regoleFiltrate = this.regole.filter(r =>
      (val === '' || r.description.toLowerCase().includes(val)) &&
      !this.regoleSelezionate.find(s => s.id === r.id)
    );
    this.showRegole.set(true);
  }

  selezionaRegola(item: Rule): void {
    this.regoleSelezionate.push(item);
    this.searchRegola = '';
    this.showRegole.set(false);
  }

  rimuoviRegola(item: Rule): void {
    this.regoleSelezionate = this.regoleSelezionate.filter(r => r.id !== item.id);
  }

  chiudiDropdown(tipo: string): void {
    if (tipo === 'giudice') this.showGiudici.set(false);
    if (tipo === 'mentore') this.showMentori.set(false);
    if (tipo === 'regola') this.showRegole.set(false);
  }
}