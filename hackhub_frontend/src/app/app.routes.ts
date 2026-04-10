import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { HomeComponent } from './features/dashboard/component/home/home.component';
import { ProfileComponent } from './features/account/component/profile/profile';
import { AuthGuard } from './core/guards/auth.guard';
import { InvitationComponent } from './features/account/component/invitation/invitation';
import { TeamComponent } from './features/teams/components/team/team.component';
import { TeamGuard } from './core/guards/team.guard';
import { MyTeamComponent } from './features/teams/components/my-team/my-team.component';
import { CreateHackathon } from './features/dashboard/component/createHackathon/createHackathon.component';
import { HackathonsComponent } from './features/dashboard/component/hackathons/hackathons.component';
import { UserComponent } from './features/users/component/user.component';
import { AdminGuard } from './core/guards/admin.guard';
import { HackathonDetailComponent } from './features/dashboard/component/hackathon-detail/hackathon-detail';
import { SubmissionComponent } from './features/dashboard/component/submission/submission.component';

export const routes: Routes = [
{ path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'users', component: UserComponent, canActivate: [AdminGuard]},
  { path: 'home', component: HomeComponent },
  { path: 'hackathon/create', component: CreateHackathon, canActivate: [AuthGuard]},
  //{ path: 'hackathon/:id/edit', component: ModificaHackathon, canActivate: [AuthGuard] },
  { path: 'hackathon/:id', component: HackathonDetailComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'invitations', component: InvitationComponent, canActivate: [AuthGuard]},
  { path: 'teams', component:TeamComponent, /*canActivate: [TeamGuard]*/},
  { path: 'teams/my', component:MyTeamComponent, canActivate: [AuthGuard]},
  { path: 'hackathons/:id/submissions', component:SubmissionComponent, canActivate: [AuthGuard]},
 
 {path: 'hackathons', component: HackathonsComponent},
  { path: '**', redirectTo: 'home' }
];
