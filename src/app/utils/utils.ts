import { maxVal } from '../fis/fis-constants';

export function guid() {
    return 'xxxxxx4xyx'.replace(/[xy]/g, c => {
        // tslint:disable-next-line:no-bitwise
        const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export function formatTime(value: number | string | null | undefined, zero: number | null | undefined): string {
    if (typeof value === 'string') {
        return value;
    }

    if (value === null || value === undefined || value >= maxVal) {
        return '';
    }

    if (zero === null || zero === undefined || zero >= maxVal) {
        zero = value;
    }

    let timeStr = (value === zero) ? '' : (value < zero ? '-' : '+');
    const time = (value === zero) ? value : (value < zero ? zero - value : value - zero);

    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time - hours * 1000 * 60 * 60) / (1000 * 60));
    const seconds = Math.floor((time - hours * 1000 * 60 * 60 - minutes * 1000 * 60) / 1000);
    const tenths = Math.floor((time - hours * 1000 * 60 * 60 - minutes * 1000 * 60 - seconds * 1000) / 100);
    const hundreds = Math.floor((time - hours * 1000 * 60 * 60 - minutes * 1000 * 60 - seconds * 1000 - tenths * 100) / 10);

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

    timeStr += seconds + '.' + tenths;
    timeStr += (hundreds > 0) ? hundreds : '';

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
