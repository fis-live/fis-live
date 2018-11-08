const AllShapes = require('@clr/icons/shapes/all-shapes').AllShapes;
const fs = require('fs');

const icons = [
    'times',
    'cog',
    'trash',
    'refresh',
    'plus',
    'minus',
    'exclamation-triangle',
    'exclamation-circle',
    'check-circle',
    'info-circle',
    'view-columns',
    'caret'
];

var template = '';

icons.forEach(function(icon) {
    template += '\n<ng-container *ngIf="shape === \'' + icon + '\'">\n\t\t\t' + AllShapes[icon].trim() + '\n</ng-container>\n';
});

fs.writeFile('src/app/components/ui/icon.component.html', template, (err) => {console.log(err)});
