/*
Copyright (c) 2010 Till Theis, http://www.tilltheis.de

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


if (!String.prototype.substrCount) {
    String.prototype.substrCount = function (substr) {
        return this.split(substr).length - 1;
    }
}


if (!String.prototype.csvSplit) {
    String.prototype.csvSplit = function(sep) {
        var columns = this.split(sep);
        
        
        var result = [];

        for (var i = 0; i < columns.length; ++i) {
            var offset = 1;

            while (0 != (columns[i].substrCount('"') % 2)) { // odd ( "xy"", )
                columns[i] += sep + columns[i + offset];

                ++offset;
            }


            // trim leading and trailing whitespaces
            columns[i] = columns[i].replace(/^\s+/, '').replace(/\s+$/, '');
            result.push(columns[i]);

            i += offset - 1;
        }

        return result;
    }
}

var csvToArray = function(str, lineSeparator, columnSeparator) {
    str = str.replace(/^\s+/, '').replace(/\s+$/, '');

    var lineSeparators = lineSeparator ? [lineSeparator] : ["\n", "\r"]; // "\n" also matches "\r\n" ("\r" will be trimmed)
    var columnSeparators = columnSeparator ? [columnSeparator] : [';', ','];
    
    
    var lines = [];
    
    for (var i = 0; i < lineSeparators.length; ++i) {
        lines = str.csvSplit(lineSeparators[i]);
        if (lines.length > 1) {
            break;
        }
    }

    
    var columns = [];

    for (var i = 0; i < columnSeparators.length; ++i) {
        var separator = columnSeparators[i];
        
        for (var j = 0; j < lines.length; ++j) {
            columns[j] = lines[j].csvSplit(separator);

            for (var k = 0; k < columns[j].length; ++k) {
                if (columns[j][k] !== '""')
                    columns[j][k] = columns[j][k].replace(/""/, '"');

                if ('"' == columns[j][k].charAt(0)) {
                    columns[j][k] = columns[j][k].substr(1, columns[j][k].length - 2);
                }
            }
        }
        
        
        if (columns.length > 0 && columns[0].length > 1) {
            break;
        }
    }
    

    return columns;
}
