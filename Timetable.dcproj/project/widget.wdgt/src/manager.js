/*
Copyright (c) 2010 Till Theis, http://www.tilltheis.de

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


/*

Timetable Manager

Interface:

Properties:

Methods:
    TimetableManager(weekType)  : TimetableManager  (throws)
    importFromObject(data)      : bool
    importFromCSV(path)         : bool
    deleteTimetable()           : void

*/
function TimetableManager(weekType) {
    if (weekType !== 'odd' && weekType !== 'even') {
        throw 'TimetableManager::TimetableManager: Invalid weekType argument';
    }
    
    
// public

    // data = { table:[days][lessons], days:[], times:[] };
    this.importFromObject = function(data) {        
        setPreferenceArrayForKey(data.times, weekType + 'Times');

        for (var i = 0; i < 5; ++i) {
            widget.setPreferenceForKey(data.days[i], weekType + gWeekdays[i] + 'Label');
            
            var subjects = [];
            
            for (var j = 0; j < data.table.length; ++j) {
                subjects[j] = data.table[j][i];
            }

            // remove trailing empty entries
            while (subjects.length > 0 &&
                   (subjects[subjects.length-1] === undefined ||
                       subjects[subjects.length-1].replace(/\s/,'') === ''))
                subjects.length--;
            
            setPreferenceArrayForKey(subjects, weekType + gWeekdays[i] + 'Subjects');
        }
        
        widget.setPreferenceForKey(true, 'has' + weekType.capitalized());
        
        return true;
    };
    
    this.importFromCSV = function(path) {
        path = normalizePath(path);
    
        if (!isValidCSVFile(path)) {
            return false;
        }
    
        var csvString = csvFileToString(path);

        if (csvString === '') {
            return false;
        }
        
        var obj = csvStringToObject(csvString);

        return this.importFromObject(obj);
    };
    
    this.deleteTimetable = function() {
        var hasTypeStr = 'has' + weekType.capitalized();
        
        setPreferenceArrayForKey(null, weekType + 'Times');
        
        if (widget.preferenceForKey(hasTypeStr)) {
            for (var i = 0; i < 5; ++i) {
                widget.setPreferenceForKey(null, weekType + gWeekdays[i] + 'Label');
                setPreferenceArrayForKey(null, weekType + gWeekdays[i] + 'Subjects');
            }
            
            widget.setPreferenceForKey(false, hasTypeStr);
        }
    };
    
    
// private
    
    // $path must point to a valid(!) csv file
    var csvFileToString = function(path) {
        if (path.substr(0, 2) === '~/') {
            path = path.substr(2);
        }

        path = quoteStringForShell(path); // " '/Users/xyz' "
        
        if (path.charAt(1) !== '/') {
            path = '~/' + path;
        }
        
        // $path now looks like " ~/'path/to/file' "

        var cmd = widget.system('/bin/cat ' + path, null); // $path is escaped
        
        if (cmd.status !== 0) return '';
        
        // remove trailing "\n" which was added by /bin/cat
        return cmd.outputString.substr(0, cmd.outputString.length-1);
    }



    var csvStringToObject = function(csvString) {

        var table = [];
        
        var data = { table:[], days:[], times:[] };
        
        
        table = csvToArray(csvString);
                
        var firstRowToWeekday = !!widget.preferenceForKey('firstRowToDay');
        var firstColToTime = !!widget.preferenceForKey('firstColToPeriod');
        var firstRowToWeekdayIgnore = !!widget.preferenceForKey('ignoreFirstRow');
        var firstColToTimeIgnore = !!widget.preferenceForKey('ignoreFirstCol');


        if (firstRowToWeekday) {
            if (!firstRowToWeekdayIgnore) {
                var i = firstColToTime ? 1 : 0;
                for (var j = 0; i < gWeekdays.length; ++i, ++j) {
                    data.days[j] = table[0][i];
                }
            }
            
            table = table.slice(1, table.length);
        }

            
        if (firstColToTime) {
            for (var i = 0; i < table.length; ++i) {
                if (!firstColToTimeIgnore) {
                    data.times[i] = table[i][0];
                }
                
                table[i] = table[i].slice(1, table[i].length);
            }
        }
        
        // fill in default values for times
        if (!firstColToTime || firstColToTimeIgnore) {
            for (var i = 0; i < table.length; ++i) {
                data.times[i] = i + 1;
            }
        }
        
        
        if (data.days.length === 0) {
            for (var i = 0; i < 5; ++i) {
                data['days'][i] = getLocalizedString(gWeekdays[i]);
            }
        }
        
        
        data.table = table;
        
        return data;

    }
    
    var isValidCSVFile = function(path) {
        try {
            // only one file
            if (path.indexOf("\n") === -1) {
                escapedPath = quoteStringForShell(path);
                

                // validate filetype
                var hasValidMimeType = false;
                {
                    var validMimeTypes = [ 'text/csv', 'text/comma-separated-values', 'text/plain' ];
                    var mimeType = widget.system('/usr/bin/file --mime ' + escapedPath, null).outputString;
                    for (var i = 0; i < validMimeTypes.length; ++i) {
                        if (mimeType.indexOf(validMimeTypes[i]) !== -1) {
                            hasValidMimeType = true;
                            break;
                        }
                    }
                }
                
                if (!hasValidMimeType) {
                    console.log("Invalid mime type ('" + mimeType + "') for file '" + path + "'.");
                    return false;
                }
                
                        
                return true;
                
            } else {
                console.log('Only one file allowed per timetable');
            }
        } catch (ex) {
            console.log('Exception: ' + ex);
        }
        
        return false;
    };
    
    var normalizePath = function(path) {
        var newPath = path.slice();
        newPath = newPath.replace(/^file:\/\/localhost/, '');
        newPath = unescape(newPath);
        return newPath;
    }
    
    var quoteStringForShell = function(str) {
        return "'" + str.replace("'", "'\''") + "'";
    };
};