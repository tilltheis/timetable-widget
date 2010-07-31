/*
Copyright (c) 2010 Till Theis, http://www.tilltheis.de

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


function showDay(calendar)
{
    var date = calendar.currentDate;
    
    var htmlTable = $('timetable');
    var htmlTitle = $('day_cur');
    var htmlWeekType = $('weekType');
    var htmlCurrentDate = $('currentDate');

    
    var types = ['odd', 'even'];
    var realType = types.splice(+(date.getWeek()%2 === 0), 1)[0];
    var pseudoType = types[0];

    if (widget.preferenceForKey('has' + realType.capitalized())) {
        pseudoType = realType;
    } else if (!widget.preferenceForKey('has' + pseudoType.capitalized())) {
        pseudoType = '';
    }
    
    
    var day = gWeekdays[date.getDay()-1];

    
    htmlWeekType.innerHTML = getLocalizedString(realType.capitalized() + ' week');
    
    
    // closure to not pollute namespace
    htmlCurrentDate.innerHTML = (function() {
        var year  = date.getFullYear();
        var month = date.getMonth() + 1;
        var day   = date.getDate();
        
        if (month < 10) {
            month = '0' + month;
        }
        if (day < 10) {
            day = '0' + day;
        }
        
        var str = getLocalizedString('%y-%m-%d');
        str = str.replace('%y', year);
        str = str.replace('%m', month);
        str = str.replace('%d', day);
        
        return str;
    }());


    htmlTitle.innerText = '';
    if (pseudoType) {
        htmlTitle.innerText = widget.preferenceForKey(pseudoType + day + 'Label');
    }
    if (!htmlTitle.innerText) {
        htmlTitle.innerText = getLocalizedString(day);
    }
    
    
    htmlTable.innerHTML = '';
    
    
    var firstColToPeriod = !!widget.preferenceForKey('firstColToPeriod');
    
    var subjects = preferenceArrayForKey(pseudoType + day + 'Subjects');
    var times = preferenceArrayForKey(pseudoType + 'Times')

    for (var i = 0; i < subjects.length; ++i) {
        var htmlLesson  = htmlTable.insertRow(i);
        var htmlTime    = htmlLesson.insertCell(0);
        var htmlSubject = htmlLesson.insertCell(1);

        htmlLesson.className  = 'lesson';
        htmlTime.className    = 'time';
        htmlSubject.className = 'subject';
        
        
        // blank if custom time strings are used. otherwise it's the row number
        // " \b" is required for blank lines. they woun't have any heigth otherwise
        // although css height property is set
        //htmlTime.innerText    = times[i] ? times[i] : (firstColToPeriod ? " \b" : i+1);
        
        // since v1.1 times are always saved in the preferences
        htmlTime.innerHTML    = times[i] ? times[i].escapedForHTML() : "";
        
        
        htmlSubject.innerHTML = subjects[i].escapedForHTML();
    }
}
