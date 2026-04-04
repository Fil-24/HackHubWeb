import { Team } from '../../teams/model/team.model';
import { Staff } from './staff.model';
import { Rule } from './rule.model';

export interface Hackathon {
    id: number;
    name: string;
    location: string;
    prize: number;
    maxTeamMembers: number;
    maxNumberTeams: number;
    startDate: string;        // LocalDateTime → string (ISO 8601)
    endDate: string;
    status: 'OPEN' | 'CLOSED' | 'ONGOING';  // adatta ai valori reali del backend
    teams: Team[];
    staff: Staff[];
    rules: Rule[];
}