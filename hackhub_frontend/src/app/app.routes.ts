import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { HomeComponent } from './features/home/component/home.component';
import { HackathonComponent } from './features/hackathon/component/hackathon.component';
import { ProfileComponent } from './features/account/component/profile/profile';
import { AuthGuard } from './core/guards/auth.guard';
import { InvitationComponent } from './features/account/component/invitation/invitation';



export const routes: Routes = [
{ path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'hackathon', component: HackathonComponent},
  { path: 'profile', component: ProfileComponent,canActivate: [AuthGuard] },
  {path:'invitations', component: InvitationComponent, canActivate: [AuthGuard]},
  { path: '**', redirectTo: 'home' },
];
