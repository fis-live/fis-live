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

    // const utf8Overhead = function (str: string): number {
    //     let s = str.length;
    //     for (let i = str.length - 1; i >= 0; i--) {
    //         const code = str.charCodeAt(i);
    //         if (code > 0x7f && code <= 0x7ff) {
    //             s++;
    //         } else if (code > 0x7ff && code <= 0xffff) {
    //             s += 2;
    //         }
    //         // trail surrogate
    //         if (code >= 0xDC00 && code <= 0xDFFF) {
    //             i--;
    //         }
    //     }
    //
    //     return s - 1;
    // };

    const decodeChrXML = (_data: string): string => {
        _data = _data.replace(/&lt;/g, '<');
        _data = _data.replace(/&gt;/g, '>');
        _data = _data.replace(/&amp;/g, '&');
        _data = _data.replace(/&apos;/g, '\'');
        return _data;
    };

    const error = function (type: string, msg: string): never {
        if (type === 'Error') {
            throw new Error(msg);
        } else if (type === 'SyntaxError') {
            throw new SyntaxError(msg);
        } else {
            throw new Error(type + ': ' + msg);
        }
    };

    const readUntil = function (_data: string, offset: number, stopChar: string): string {
        let i = 2;
        const buf: string[] = [];
        let chr = _data.slice(offset, offset + 1);

        while (chr !== stopChar) {
            if ((i + offset) > _data.length) {
                error('Error', 'Invalid');
            }
            buf.push(chr);
            chr = _data.slice(offset + (i - 1), offset + i);
            i += 1;
        }

        return buf.join('');
    };

    const readChars = function (_data: string, offset: number, length: number): string {
        const buf: string[] = [];

        for (let i = 0; i < length; i++) {
            buf.push(_data.slice(offset + (i - 1), offset + i));
            // length -= utf8Overhead(chr);
        }

        return buf.join('');
    };

    const _unserialize = function (_data: string, offset: number): [string, number, any] {
        if (!offset) {
            offset = 0;
        }
        const type = (_data.slice(offset, offset + 1)).toLowerCase();

        let dataOffset = offset + 2;
        let readData: string;

        switch (type) {
            case 'i':
                readData = readUntil(_data, dataOffset, ';');
                dataOffset += readData.length + 1;

                return [type, dataOffset - offset, parseInt(readData, 10)];
            case 'b':
                readData = readUntil(_data, dataOffset, ';');
                dataOffset += readData.length + 1;

                return [type, dataOffset - offset, parseInt(readData, 10) !== 0];
            case 'd':
                readData = readUntil(_data, dataOffset, ';');
                dataOffset += readData.length + 1;

                return [type, dataOffset - offset, parseFloat(readData)];
            case 'n':
                return [type, dataOffset - offset, null];
            case 's':
                const count = readUntil(_data, dataOffset, ':');
                const length = parseInt(count, 10);
                dataOffset += count.length + 2;

                readData = readChars(_data, dataOffset + 1, length);
                dataOffset += readData.length + 2;
                if (readData.length !== length) {
                    error('SyntaxError', 'String length mismatch');
                }

                return [type, dataOffset - offset, readData];
            case 'a':
                let obj: any = {};
                let isArray = true;

                const keys = readUntil(_data, dataOffset, ':');
                dataOffset += keys.length + 2;

                const numKeys = parseInt(keys, 10);

                for (let i = 0; i < numKeys; i++) {
                    const keyProps = _unserialize(_data, dataOffset);
                    const key = keyProps[2];
                    dataOffset += keyProps[1];

                    const valueProps = _unserialize(_data, dataOffset);
                    dataOffset += valueProps[1];

                    if (keyProps[0] !== 'i' || key !== i) {
                        isArray = false;
                    }

                    obj[key] = valueProps[2];
                }

                if (isArray) {
                    const array = new Array(numKeys);
                    for (let i = 0; i < numKeys; i++) {
                        array[i] = obj[i];
                    }
                    obj = array;
                }

                dataOffset += 1;

                return [type, dataOffset - offset, obj];
        }

        throw new SyntaxError('Unknown / Unhandled data type(s): ' + type);
    };

    return _unserialize(decodeChrXML(data + ''), 0)[2];
}
