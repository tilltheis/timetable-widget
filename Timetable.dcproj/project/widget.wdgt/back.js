/*
Copyright (c) 2010 Till Theis, http://www.tilltheis.de

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


// data = { table:[days][lessons], days:[], times:[] };
// days[] can be empty (default values will be used)
// date == null deletes existing table
function changeTimetableForWeek(week, data) {
    var type = week%2 === 0 ? 'even' : 'odd';
    
    if (data === null) {
        var hasTypeStr = 'has' + type.capitalized();
        
        setPreferenceArrayForKey(null, type + 'Times');
        
        if (widget.preferenceForKey(hasTypeStr)) {
            for (var i = 0; i < gWeekdays.length; ++i) {
                widget.setPreferenceForKey(null, type + gWeekdays[i] + 'Label');
                setPreferenceArrayForKey(null, type + gWeekdays[i] + 'Subjects');
            }
            
            widget.setPreferenceForKey(false, hasTypeStr);
        }
    } else {
        setPreferenceArrayForKey(data.times, type + 'Times');

        for (var i = 0; i < gWeekdays.length; ++i) {
            widget.setPreferenceForKey(data.days[i] || '', type + gWeekdays[i] + 'Label');
            
            var subjects = [];
            
            for (var j = 0; j < data.table.length; ++j) {
                subjects[j] = data.table[j][i];
            }

            // remove trailing empty entries
            while (subjects.length > 0 &&
                   (subjects[subjects.length-1] === undefined ||
                       subjects[subjects.length-1].replace(/\s/,'') === ''))
                subjects.length--;
            
            setPreferenceArrayForKey(subjects, type + gWeekdays[i] + 'Subjects');
        }
        
        widget.setPreferenceForKey(true, 'has' + type.capitalized());
    }
    
    timetableChangedForWeek(week);
}


function newTimetableForWeekWithPath(week, path) {
    var csvString = csvFileToString(path);
    var obj = csvStringToObject(csvString);

    changeTimetableForWeek(week, obj);
}


// $path must point to a valid(!) csv file
function csvFileToString(path) {
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



function csvStringToObject(csvString) {

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
    
    
    data.table = table;
    
    return data;

}



// $type must be 'odd' or 'even' (case sensitive)
function _documentPathDrop(type, event) {
    try {
        var path = event.dataTransfer.getData('text/uri-list');
        
        // only one file
        if (path.indexOf("\n") === -1) {
        
            path = path.replace(/^file:\/\/localhost/, '');
            path = unescape(path);
            
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
            
            var week = +(type !== 'even');
            
            if (!hasValidMimeType) {
                console.log("Invalid mime type for file '" + path + "'.");
                timetableChangedForWeek(week); // hint will be shown
                return;
            }
            
                    
            // fire event
            newTimetableForWeekWithPath(week, path);
            
        } else {
            console.log('Only one file per timetable allowed');
        }
    } catch (ex) {
        console.log('Exception: ' + ex);
    }

    event.stopPropagation();
    event.preventDefault();
}






////////////////////////
///// HELPER FUNCS /////
////////////////////////





function quoteStringForShell(str) {
    return "'" + str.replace("'", "'\''") + "'";
}



// CALLBACKs

function timetableChangedForWeek(week) {
    var type = week%2 === 0 ? 'even' : 'odd';

    var indicator = $(type + 'Indicator');
    
    var value = widget.preferenceForKey('has' + type.capitalized()) ? 0 : 1;
    
    setValueForIndicator(value, indicator);
    
    gSettingsChanged = true; // when switching to front side, it will refresh its contents
}
