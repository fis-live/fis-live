export function unserialize(data: any) {
    //  discuss at: http://locutus.io/php/unserialize/
    // original by: Arpad Ray (mailto:arpad@php.net)
    // improved by: Pedro Tainha (http://www.pedrotainha.com)
    // improved by: Kevin van Zonneveld (http://kvz.io)
    // improved by: Kevin van Zonneveld (http://kvz.io)
    // improved by: Chris
    // improved by: James
    // improved by: Le Torbi
    // improved by: Eli Skeggs
    // bugfixed by: dptr1988
    // bugfixed by: Kevin van Zonneveld (http://kvz.io)
    // bugfixed by: Brett Zamir (http://brett-zamir.me)
    //  revised by: d3x
    //    input by: Brett Zamir (http://brett-zamir.me)
    //    input by: Martin (http://www.erlenwiese.de/)
    //    input by: kilops
    //    input by: Jaroslaw Czarniak
    //      note 1: We feel the main purpose of this function should be
    //      note 1: to ease the transport of data between php & js
    //      note 1: Aiming for PHP-compatibility, we have to translate objects to arrays
    //   example 1: unserialize('a:3:{i:0;s:5:"Kevin";i:1;s:3:"van";i:2;s:9:"Zonneveld";}')
    //   returns 1: ['Kevin', 'van', 'Zonneveld']
    //   example 2: unserialize('a:2:{s:9:"firstName";s:5:"Kevin";s:7:"midName";s:3:"van";}')
    //   returns 2: {firstName: 'Kevin', midName: 'van'}

    const utf8Overhead = function (chr) {
        // http://locutus.io/php/unserialize:571#comment_95906
        const code = chr.charCodeAt(0);
        const zeroCodes = [
            338,
            339,
            352,
            353,
            376,
            402,
            8211,
            8212,
            8216,
            8217,
            8218,
            8220,
            8221,
            8222,
            8224,
            8225,
            8226,
            8230,
            8240,
            8364,
            8482
        ];
        if (code < 0x0080 || code >= 0x00A0 && code <= 0x00FF || zeroCodes.indexOf(code) !== -1) {
            return 0;
        }
        if (code < 0x0800) {
            return 1;
        }

        return 2;
    };

    const error = function (type: string, msg: string) {
        if (type === 'Error') {
            throw new Error(msg);
        } else if (type === 'SyntaxError') {
            throw new SyntaxError(msg);
        } else {
            throw new Error(type + ': ' + msg);
        }
    };

    const readUntil = function (_data, offset, stopchr) {
        let i = 2;
        const buf = [];
        let chr = _data.slice(offset, offset + 1);

        while (chr !== stopchr) {
            if ((i + offset) > _data.length) {
                error('Error', 'Invalid');
            }
            buf.push(chr);
            chr = _data.slice(offset + (i - 1), offset + i);
            i += 1;
        }

        return {length: buf.length, buffer: buf.join('')};
    };

    const readChrs = function (_data, offset, length) {
        let i, chr, buf;

        buf = [];
        for (i = 0; i < length; i++) {
            chr = _data.slice(offset + (i - 1), offset + i);
            buf.push(chr);
            length -= utf8Overhead(chr);
        }

        return {length: buf.length, buffer: buf.join('')};
    };

    const _unserialize = function (_data, offset) {
        let dtype;
        let dataoffset;
        let keyandchrs;
        let keys;
        let contig;
        let length;
        let array;
        let readdata;
        let readData;
        let ccount;
        let stringlength;
        let i;
        let key;
        let kprops;
        let kchrs;
        let vprops;
        let vchrs;
        let value;
        let chrs = 0;
        let typeconvert = function (x) {
            return x;
        };

        if (!offset) {
            offset = 0;
        }
        dtype = (_data.slice(offset, offset + 1)).toLowerCase();

        dataoffset = offset + 2;

        switch (dtype) {
            case 'i':
                typeconvert = function (x) {
                    return parseInt(x, 10);
                };
                readData = readUntil(_data, dataoffset, ';');
                chrs = readData.length;
                readdata = readData.buffer;
                dataoffset += chrs + 1;
                break;
            case 'b':
                typeconvert = function (x) {
                    return parseInt(x, 10) !== 0;
                };
                readData = readUntil(_data, dataoffset, ';');
                chrs = readData.length;
                readdata = readData.buffer;
                dataoffset += chrs + 1;
                break;
            case 'd':
                typeconvert = function (x) {
                    return parseFloat(x);
                };
                readData = readUntil(_data, dataoffset, ';');
                chrs = readData.length;
                readdata = readData.buffer;
                dataoffset += chrs + 1;
                break;
            case 'n':
                readdata = null;
                break;
            case 's':
                ccount = readUntil(_data, dataoffset, ':');
                chrs = ccount.length;
                stringlength = ccount.buffer;
                dataoffset += chrs + 2;

                readData = readChrs(_data, dataoffset + 1, parseInt(stringlength, 10));
                chrs = readData.length;
                readdata = readData.buffer;
                dataoffset += chrs + 2;
                if (chrs !== parseInt(stringlength, 10) && chrs !== readdata.length) {
                    error('SyntaxError', 'String length mismatch');
                }
                break;
            case 'a':
                readdata = {};

                keyandchrs = readUntil(_data, dataoffset, ':');
                chrs = keyandchrs.length;
                keys = keyandchrs.buffer;
                dataoffset += chrs + 2;

                length = parseInt(keys, 10);
                contig = true;

                for (i = 0; i < length; i++) {
                    kprops = _unserialize(_data, dataoffset);
                    kchrs = kprops[1];
                    key = kprops[2];
                    dataoffset += kchrs;

                    vprops = _unserialize(_data, dataoffset);
                    vchrs = vprops[1];
                    value = vprops[2];
                    dataoffset += vchrs;

                    if (key !== i) {
                        contig = false;
                    }

                    readdata[key] = value;
                }

                if (contig) {
                    array = new Array(length);
                    for (i = 0; i < length; i++) {
                        array[i] = readdata[i];
                    }
                    readdata = array;
                }

                dataoffset += 1;
                break;
            default:
                error('SyntaxError', 'Unknown / Unhandled data type(s): ' + dtype);
                break;
        }
        return [dtype, dataoffset - offset, typeconvert(readdata)];
    };

    return _unserialize((data + ''), 0)[2];
}

export function json(body: string | Object): any {
    let jsonResponse: string | Object;
    if (body !== null && (typeof body === 'function' || typeof body === 'object')) {
        jsonResponse = body;
    } else if (typeof body === 'string') {
        jsonResponse = JSON.parse(<string> body);
    }

    return jsonResponse;
}
