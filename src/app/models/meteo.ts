export const WeatherConditions = {
    'sun': 1,
    'pcl': 2,
    'clo': 3,
    'sno': 4,
    'rai': 5,
    'fog': 6
};

export const WindConditions = {
    'no': 1,
    'lo': 2,
    'me': 3,
    'hi': 4
};

export const SnowConditions = {
    'sft': 'Soft',
    'wtpwd': 'Wet & powder',
    'wt_pwd': 'Wet & powder',
    'wt': 'Wet',
    'cmp': 'Compact',
    'f_g': 'Fine grained',
    'grn': 'Granular',
    'hrd': 'Hard',
    'hrd_p': 'Hard packed',
    'hrd_p_v': 'Hard packed variable',
    'icy': 'Icy',
    'p': 'Packed',
    'ppwd': 'Packed powder',
    'pwd': 'Powder',
    'sp_c': 'Spring conditions',
    'salt': 'Salt'
};

export interface Meteo {
    air_temperature: number;
    wind: string;
    weather: string;
    snow_condition: string;
    snow_temperature: number;
    humidity: number;
}