/*
Copyright (c) 2010 Till Theis, http://www.tilltheis.de

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


var gCurrentDate;


function toNextDay() {
    gCurrentDate.setDate(gCurrentDate.getDate() + 1);
    
    if (gCurrentDate.getDay() === 6) { // saturday
        gCurrentDate.setDate(gCurrentDate.getDate() + 2); // monday
    }
}

function toPreviousDay() {
    gCurrentDate.setDate(gCurrentDate.getDate() - 1);
    
    if (gCurrentDate.getDay() === 0) { // sunday
        gCurrentDate.setDate(gCurrentDate.getDate() - 2); // friday
    }
}

function toCurrentDay(hourForChange) {
    gCurrentDate = createDisplayDate(hourForChange);    
}


function createDisplayDate(hourForChange) {
    var date = new Date();

    var dayOfWeek = date.getDay();    
    
    // Display Monday on weekends
    if ((dayOfWeek === 5 && hourForChange <= date.getHours())
        || dayOfWeek === 6 || dayOfWeek === 0) {
        
        if (dayOfWeek === 0) {
            dayOfWeek = 6;
        } else {
            dayOfWeek--;
        }
        
        date.setDate(date.getDate() + 7 - dayOfWeek);
        
    } else if (hourForChange <= date.getHours()) {
        date.setDate(date.getDate() + 1);
    }
    
    return date;
}


function createDateUpdateTimer(hourForChange, callback) {
    var daysToAdd = gCurrentDate.getHours() < hourForChange ? 0 : 1;
    
    var dateForChange = new Date(gCurrentDate.getFullYear(),
                                 gCurrentDate.getMonth(),
                                 gCurrentDate.getDate() + daysToAdd,
                                 hourForChange);

    var timer = setTimeout(function() {
        var newDate = createDisplayDate(hourForChange);

        if (newDate.getDate()-1 === gCurrentDate.getDate()) // not already updated
            callback();

            
    }, +dateForChange - +gCurrentDate);
    
    return timer;
}