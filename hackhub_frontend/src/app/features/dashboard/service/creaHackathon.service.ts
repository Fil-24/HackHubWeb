import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { Hackathon } from '../models/hackathon.model';
import { Rule } from '../models/rule.model';



@Injectable({ providedIn: 'root' })
export class creaHackathonService {
  private apiUrl = environment.apiUrl + '/hackathons';

  constructor(private http: HttpClient) {}

    getRules(): Observable<Rule[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rules`).pipe(
        map(responses => responses.map(res => this.mapToRuleModel(res)))
    );
  }


  private mapToRuleModel(backendObj: any): Rule {
    return {
      id: backendObj.id,
      name: backendObj.name,
      description: backendObj.description
    };
  }

}