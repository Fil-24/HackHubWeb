export interface Staff {
    id: number;
    name: string;
    email: string;
    role: 'ORGANIZER' | 'JUDGE' | 'MENTOR';  // adatta ai valori reali del backend
}