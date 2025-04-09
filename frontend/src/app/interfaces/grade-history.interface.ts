export const enum Action{
    Create,
    Update,
    Delete,
}

export interface GradeHistory {
    id: string;
    action: Action;
    oldValue: number | null;
    newValue: number | null;
    date: Date;
}