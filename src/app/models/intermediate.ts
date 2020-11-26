export interface Intermediate {
    type: 'start_list' | 'inter' | 'finish' | 'bonus_points' | 'bonus_time' | 'standing';
    key: number;
    distance: number;
    name: string;
    id: number;
    short: string;
}
