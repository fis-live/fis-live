export interface Intermediate {
    type: 'start_list' | 'inter' | 'finish' | 'bonus_points' | 'bonus_time';
    key: number;
    distance: number;
    name: string;
    id: number;
    short: string;
}
