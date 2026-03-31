import { Component, computed, OnInit, signal } from '@angular/core';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
// Sostituisci con il percorso corretto del tuo AuthService
import { AuthService } from './features/auth/service/auth.service'; 

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('hackhub_frontend');

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Se c'è un token ma l'utente non è ancora caricato (es. refresh della pagina),
    // richiamiamo il backend per popolare il segnale userSignal.
    if (this.authService.getToken() && !this.authService.currentUser) {
      this.authService.loadUser$().subscribe();
    }
  }

  // Signal calcolato: ritorna true se userSignal contiene un utente, altrimenti false
  isAuthenticated = computed(() => !!this.authService.user());

  // Signal calcolato: mappa i dati dell'account dal backend al formato per la navbar
  userProfile = computed(() => {
    const user = this.authService.user();
    if (!user) return null;

    return {
      // Unisco nome e cognome. Se usi nickname, puoi mettere user.nickname
      name: `${user.name} ${user.surname || ''}`.trim(),
      role: user.role, // "USER", "ADMIN", "STAFF"
      email: user.email,
      // Genera un avatar basato sulle iniziali
      avatarUrl: `https://ui-avatars.com/api/?name=${user.name}+${user.surname || ''}&background=0f172a&color=fff`    };
  });

  // Funzione di logout reale
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // Riporta l'utente al login
  }
}