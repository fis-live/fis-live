import 'core-js/es6';
import 'core-js/es7/reflect';
import 'core-js/es7/array';
import 'zone.js/dist/zone';

import './assets/web-animations.min'

if (process.env.ENV === 'production') {

} else {
    Error['stackTraceLimit'] = Infinity;
    require('zone.js/dist/long-stack-trace-zone');
}