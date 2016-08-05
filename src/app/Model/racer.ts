export class Racer {
    fullName: string = '';

    constructor(
        public id: number,
        public bib: number,
        public lastName: string,
        public firstName: string,
        public nationality: string) {
        this.fullName = firstName + ' ' + lastName;
    }

}