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
    'caret',
    'filter-grid-circle',
    'filter-grid',
    'drag-handle',
    'search',
    'star'
];

var template = '@switch (shape()) {';

var yellowCardIcon = '<svg version="1.0" id="Calque_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n' +
    '     width="183.275px" height="125.473px" viewBox="0 0 183.275 125.473" enable-background="new 0 0 183.275 125.473"\n' +
    '     xml:space="preserve">\n' +
    '    <radialGradient id="SVGID_1_" cx="99.4099" cy="-11.2654" r="128.4652" gradientTransform="matrix(1.1341 0 0 1.0589 18.9852 11.5908)" gradientUnits="userSpaceOnUse">\n' +
    '        <stop  offset="0" style="stop-color:#FFF46D"/>\n' +
    '        <stop  offset="0.511" style="stop-color:#FDDF19"/>\n' +
    '        <stop  offset="0.8571" style="stop-color:#FDDF19"/>\n' +
    '        <stop  offset="1" style="stop-color:#E1B521"/>\n' +
    '    </radialGradient>\n' +
    '    <rect x="45.309" y="-0.006" fill="url(#SVGID_1_)" stroke="#DDAF26" stroke-width="0.5" width="94.879" height="125.865"/>\n' +
    '</svg>';

icons.forEach(function(icon) {
    template += '\n\t@case (\'' + icon + '\') {\n\t\t\t' + AllShapes[icon].trim() + '\n\t}\n';
});

template +=  '\n\t@case (\'yc\') {\n\t\t\t' + yellowCardIcon + '\n\t}\n}';

fs.writeFile('src/app/core/icon/icon.component.html', template, (err) => {console.log(err)});
