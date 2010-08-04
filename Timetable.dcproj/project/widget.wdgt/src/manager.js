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
    (Read-write)
    onSuccess   : handler
    onFailure   : handler
    onDelete    : handler

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

    this.onSuccess;
    this.onFailure;
    this.onDelete;


    // data = { table:[days][lessons], days:[], times:[] };
    this.importFromObject = function(data) {
        var table = data.table;
    
        if (data.days.length !== 5) {
            triggerOnFailure();
            return false;
        }
        
        for (var i = 0; i < table.length; ++i) {
            if (table[i].length !== 5) {
                triggerOnFailure();
                return false;
            }
        }
        
    
        var maxSubjectsLength = 0;

        for (var i = 0; i < 5; ++i) {
            widget.setPreferenceForKey(data.days[i], weekType + gWeekdays[i] + 'Label');
            
            var subjects = [];
            
            for (var j = 0; j < table.length; ++j) {
                subjects[j] = table[j][i];
            }

            // remove trailing empty entries
            while (subjects.length > 0 &&
                   (subjects[subjects.length-1] === undefined ||
                       subjects[subjects.length-1].replace(/\s/,'') === ''))
                subjects.length--;
            
            setPreferenceArrayForKey(subjects, weekType + gWeekdays[i] + 'Subjects');
            
            if (subjects.length > maxSubjectsLength) {
                maxSubjectsLength = subjects.length;
            }
        }
        
        // don't save more times than needed
        setPreferenceArrayForKey(data.times.slice(0, maxSubjectsLength), weekType + 'Times');
        
        widget.setPreferenceForKey(true, 'has' + weekType.capitalized());
        
        triggerOnSuccess();
        
        return true;
    };
    
    this.importFromCSV = function(path) {
        path = normalizePath(path);
    
        if (!isCSVFile(path)) {
            triggerOnFailure();
            return false;
        }
    
        var csvString = csvFileToString(path);

        if (csvString === '') {
            triggerOnFailure();
            return false;
        }
        
        var obj;
        
        try {
            obj = csvStringToObject(csvString);
        } catch (ex) {
            triggerOnFailure();
            return false;
        }

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
        
        triggerOnDelete();
    };
    
    
// private

    var self = this;
    

    var triggerOnSuccess = function() {
        if (typeof self.onSuccess === 'function') {
            self.onSuccess.call(self);
        }
    };

    var triggerOnFailure = function() {
        if (typeof self.onFailure === 'function') {
            self.onFailure.call(self);
        }
    };

    var triggerOnDelete = function() {
        if (typeof self.onDelete === 'function') {
            self.onDelete.call(self);
        }
    };
    
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

    // csvToArray() throws !
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
                for (var j = 0; j < 5; ++i, ++j) {
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
    
    var isCSVFile = function(path) {
        try {
            // only one file
            if (path.indexOf("\n") === -1) {
                var escapedPath = quoteStringForShell(path);
                

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
