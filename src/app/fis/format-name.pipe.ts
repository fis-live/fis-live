import { Pipe, PipeTransform } from '@angular/core';

import { Racer } from './cross-country/models';

@Pipe({
    name: 'formatName',
    pure: true
})
export class FormatNamePipe implements PipeTransform {

    transform(racer: Racer, format: string): string {
        let buffer = '';
        for (const ch of format) {
            switch (ch) {
                case 'l':
                    buffer += racer.lastName;
                    break;
                case 'L':
                    buffer += racer.lastName.toUpperCase();
                    break;
                case 'f':
                    buffer += racer.firstName;
                    break;
                case 'F':
                    buffer += racer.firstName.toUpperCase();
                    break;
                case 'i':
                    buffer += racer.firstName.split(/([ -])/).map(str => str[0]).join('').replace(' ', '.');
                    break;
                default:
                    buffer += ch;
                    break;
            }
        }

        return buffer;
    }
}
