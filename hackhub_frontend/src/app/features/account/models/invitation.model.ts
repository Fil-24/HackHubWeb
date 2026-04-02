export interface Invitation {
        idInvitation: number;
        state: string;
        invitationDate: Date;
        idInvitedAccount: number;
        invitedAccountEmail: string;
        idInvitingTeam: number;
        invitingTeamName: string;
}