export interface StaffResponse {
    idStaff: number;
    organizerId: number;
    organizerEmail: string;
    judgeId: number;    
    judgeEmail: string;
    mentors: {
        id: number;
        email: string;
    }[];
}