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

var csvToArray = function(str, separator) {
    if (!separator) {
        separator = ';';
    }

    var lines = str.csvSplit("\r\n");
    if (lines.length === 1)
        lines = str.csvSplit("\n");

    for (var i = 0; i < lines.length; ++i) {
        lines[i] = lines[i].csvSplit(separator);

        for (var j = 0; j < lines[i].length; ++j) {
            if (lines[i][j] !== '""')
                lines[i][j] = lines[i][j].replace(/""/, '"');

            if ('"' == lines[i][j].charAt(0)) {
                lines[i][j] = lines[i][j].substr(1, lines[i][j].length - 2);
            }
        }
    }

    return lines;
}
