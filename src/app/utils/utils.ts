import { isRanked, maxVal } from '../fis/fis-constants';
import { Intermediate } from '../models/intermediate';
import { Mark } from '../models/racer';

export function guid() {
    return 'xxxxxx4xyx'.replace(/[xy]/g, c => {
        // tslint:disable-next-line:no-bitwise
        const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export function formatTime(value: number | string | null | undefined,
                           zero: number | null | undefined, precision: number = -2, percent: boolean = false): string {
    if (typeof value === 'string') {
        return value;
    }

    if (value === null || value === undefined || value >= maxVal) {
        return '';
    }

    if (zero === null || zero === undefined || zero >= maxVal) {
        zero = value;
    }

    value = value - value % 10 ** (precision + 3);
    zero = zero - zero % 10 ** (precision + 3);
    let timeStr = (value === zero) ? '' : (value < zero ? '-' : '+');
    const time = (value === zero) ? value : (value < zero ? zero - value : value - zero);

    if (percent && value !== zero) {
        return timeStr + Math.round(1000 * time / value) / 10 + '%';
    }

    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % 60000) / 1000);
    const tenths = Math.floor((time % 1000) / 100);
    const hundreds = Math.floor((time % 100) / 10);
    const thousands = time % 10;

    if (hours > 0 || minutes > 0) {
        if (hours > 0) {
            timeStr += hours + ':';
            if (minutes < 10) {
                timeStr += '0';
            }
        }
        timeStr += minutes + ':';
        if (seconds < 10) {
            timeStr += '0';
        }
    }

    timeStr += seconds;
    timeStr += (precision <= -1) ? '.' + tenths : '';
    timeStr += (precision <= -2) ? hundreds : '';
    timeStr += (precision <= -3) ? thousands : '';

    return timeStr;
}

export function fixEncoding(str: string) {
    try {
        return decodeURIComponent(escape(str));
    } catch (e) {
        return str;
    }
}

export function toTitleCase(title: string) {
    const small = /^(von|van|der|of|de|del|di|do|af|den|du)$/i;
    const large = /^(I|II|III|IV)$/i;

    return title.split(/([ -])/).map(function (current) {
        if (current.search(small) > -1) {
            return current.toLowerCase();
        }

        if (current.search(large) > -1) {
            return current.toUpperCase();
        }

        return current.substr(0, 1).toUpperCase() + current.substr(1).toLowerCase();
    }).join('');
}

export function getValidDiff(mark: Mark, zero: Mark): number {
    if (isRanked(mark.status) && isRanked(zero.status)) {
        return mark.time - zero.time;
    }

    return maxVal;
}

export function isBonus(intermediate: Intermediate | null | undefined): boolean {
    return intermediate?.type === 'bonus_points' || intermediate?.type === 'bonus_time' || intermediate?.type === 'standing';
}

export function parseTimeString(str: string) {
    const timeArray = str.split(':');

    return (timeArray.length === 3) ?
        (Number(timeArray[0]) * 3600 + Number(timeArray[1]) * 60 + Number(timeArray[2])) * 1000 :
        (Number(timeArray[0]) * 60 + Number(timeArray[1])) * 1000;
}
