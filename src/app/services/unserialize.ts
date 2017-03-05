export function unserialize(data: string): any {
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

    const utf8Overhead = function (str: string): number {
        let s = str.length;
        for (let i = str.length - 1; i >= 0; i--) {
            const code = str.charCodeAt(i);
            if (code > 0x7f && code <= 0x7ff) {
                s++;
            } else if (code > 0x7ff && code <= 0xffff) {
                s += 2;
            }
            // trail surrogate
            if (code >= 0xDC00 && code <= 0xDFFF) {
                i--;
            }
        }

        return s - 1;
    };

    const decodeChrXML = (_data) => {
        _data = _data.replace(/&lt;/g, '<');
        _data = _data.replace(/&gt;/g, '>');
        _data = _data.replace(/&amp;/g, '&');
        _data = _data.replace(/&apos;/g, '\'');
        return _data;
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

    return _unserialize(decodeChrXML(data + ''), 0)[2];
}
