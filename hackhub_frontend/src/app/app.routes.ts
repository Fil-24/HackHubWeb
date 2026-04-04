import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { HomeComponent } from './features/dashboard/component/home/home.component';
import { HackathonComponent } from './features/dashboard/component/hackathon/hackathon.component';
import { ProfileComponent } from './features/account/component/profile/profile';
import { AuthGuard } from './core/guards/auth.guard';
import { InvitationComponent } from './features/account/component/invitation/invitation';
import { TeamComponent } from './features/teams/components/team/team.component';
import { TeamGuard } from './core/guards/team.guard';
import { MyTeamComponent } from './features/teams/components/my-team/my-team.component';

export const routes: Routes = [
{ path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'hackathon/:id', component: HackathonComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'invitations', component: InvitationComponent, canActivate: [AuthGuard]},
  { path: 'teams', component:TeamComponent, canActivate: [TeamGuard]},
  { path: 'teams/my', component:MyTeamComponent, canActivate: [AuthGuard]},
  { path: '**', redirectTo: 'home' },
];
