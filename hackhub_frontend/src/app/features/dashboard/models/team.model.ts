import { TeamMember } from "./teamMember.model";
import { TeamStats } from "./teamStats.model";

export interface Team {
    id: number;
    name: string;
    leader: TeamMember;
    members: TeamMember[];
    description: string;
    teamStats: TeamStats;
}