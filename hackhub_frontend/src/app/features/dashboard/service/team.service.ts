import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Team } from '../models/team.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/teams';

  // GET /api/teams
  getAllTeams(): Observable<Team[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(responses => responses.map(res => this.mapToTeamModel(res)))
    );
  }

  // GET /api/teams/{id}
  getTeamById(id: number): Observable<Team> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => this.mapToTeamModel(res))
    );
  }

  // POST /api/teams
  createTeam(name: string, description: string): Observable<Team> {
    return this.http.post<any>(this.apiUrl, { name, description }).pipe(
      map(res => this.mapToTeamModel(res))
    );
  }

  // PUT /api/teams
  updateTeam(name: string, description: string): Observable<Team> {
    return this.http.put<any>(this.apiUrl, { name, description }).pipe(
      map(res => this.mapToTeamModel(res))
    );
  }

  // DELETE /api/teams/members (L'utente corrente lascia il team)
  leaveTeamForMember(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/members`);
  }

  // DELETE /api/teams/leader (Il leader corrente lascia il team)
  leaveTeamForLeader(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/leader`);
  }

  // GET /api/teams/{id}/members
  getTeamMembers(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/members`);
  }

  /**
   * Funzione di utilità per mappare il DTO del backend all'interfaccia frontend.
   * Modifica questi campi in base a come è fatto esattamente il tuo TeamResponse Java.
   */
  private mapToTeamModel(backendObj: any): Team {
    return {
      id: backendObj.idTeam || backendObj.id,
      name: backendObj.name,
      // Se il backend non ha un titolo progetto separato, usiamo il nome o un default
      projectTitle: backendObj.projectTitle || backendObj.name, 
      projectDescription: backendObj.description || '',
      // Se i membri non sono inclusi nella response base, potresti doverli caricare separatamente,
      // ma qui assumiamo che il DTO ti passi almeno un array di stringhe o oggetti
      members: backendObj.members ? backendObj.members.map((m: any) => m.name || m) : [],
      
      //membersCount: backendObj.stats?.membersCount || (backendObj.members ? backendObj.members.length : 0),
      //maxMembers: backendObj.stats?.maxMembers || 4,
      //status: (backendObj.stats?.membersCount >= 4) ? 'FULL' : 'OPEN'
    };
  }
}