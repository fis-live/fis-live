import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'time'})
export class TimePipe implements PipeTransform {
    transform(time: number): string {
        let timeStr = '',
            hours = Math.floor(time / (1000 * 60 * 60));

        let minutes = Math.floor((time - hours * 1000 * 60 * 60) / (1000 * 60));
        let seconds = Math.floor((time - hours * 1000 * 60 * 60 - minutes * 1000 * 60) / 1000);
        let tenths = Math.floor((time - hours * 1000 * 60 * 60 - minutes * 1000 * 60 - seconds * 1000) / 100);

        if (hours > 0 || minutes > 0) {
            if (hours > 0){
                timeStr = hours + ':';
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

        return timeStr;
    }
}