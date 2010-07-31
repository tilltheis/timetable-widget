/*
Copyright (c) 2010 Till Theis, http://www.tilltheis.de

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


/*

Calendar

Interface:

Properties:
    (Read-write)
    onDateChange    : handler
    
    (Read-only)
    currentDate     : Date
    

Methods:
    Calendar(hourForChange, useISOWeeks, [date])    : Calendar  (throws)
    increaseWeekday()                               : void
    decreaseWeekday()                               : void
    resetCurrentDate()                              : void
    setHourForChange(hour)                          : void
    setUseISOWeeks(flag)                            : void

*/
function Calendar(hourForChange, useISOWeeks, currentDateArg) {
// public
    
    this.onDateChange = null;
    
    this.currentDate = currentDateArg || new Date();
    
    
    this.increaseWeekday = function() {
        this.currentDate.setDate(this.currentDate.getDate() + 1);
        
        if (this.currentDate.getDay() === 6) { // saturday
            this.currentDate.setDate(this.currentDate.getDate() + 2); // monday
        }
        
        if (typeof this.onDateChange === 'function') {
            this.onDateChange.call(this);
        }
    };

    this.decreaseWeekday = function() {
        this.currentDate.setDate(this.currentDate.getDate() - 1);
        
        if (this.currentDate.getDay() === 0) { // sunday
            this.currentDate.setDate(this.currentDate.getDate() - 2); // friday
        }
        
        if (typeof this.onDateChange === 'function') {
            this.onDateChange.call(this);
        }
    };
    
    this.resetCurrentDate = function() {
        var oldDate = this.currentDate;
    
        this.currentDate = new Date();
        adjustDate(this.currentDate);
        
        if (typeof this.onDateChange === 'function' && isDifferentDate(oldDate)) {
            this.onDateChange.call(this);
        }
    };
    
    this.setHourForChange = function(hour) {
        if (hourForChange !== hour) {
            hourForChange = hour;
            
            this.resetCurrentDate();
            resetDateUpdateTimer();
        }
    };
    
    this.setUseISOWeeks = function(flag) {
        if (useISOWeeks !== flag) {
            useISOWeeks = flag;
            
            var getWeekFuncs = [ Date.prototype.getUSWeek, Date.prototype.getISOWeek ];
            this.currentDate.getWeek = getWeekFuncs[+!!useISOWeeks];
            
            this.resetCurrentDate();
        }
    };
    
    
// private
    
    var self = this;
    
    var dateUpdateTimer = null;
    
    
    var adjustDate = function(dateObj) {
        var day   = dateObj.getDay();
        var hours = dateObj.getHours();
        var date  = dateObj.getDate();
        
        // Display Monday on weekends
        if ((day === 5 && hourForChange <= hours) || day === 6 || day === 0) {
        
            if (day === 0) {
                day = 6;
            } else {
                day--;
            }
            
            dateObj.setDate(date + 7 - day);
            
        } else if (hourForChange <= hours) {
            dateObj.setDate(date + 1);
        }
    };
    
    var resetDateUpdateTimer = function() {
        var today = new Date();
        var daysToAdd = today.getHours() < hourForChange ? 0 : 1;
        
        var dateForChange = new Date();
        dateForChange.setDate(dateForChange.getDate() + daysToAdd);
        dateForChange.setHours(hourForChange);

        clearTimeout(self.dateUpdateTimer);

        self.dateUpdateTimer = setTimeout(function() {
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            adjustDate(yesterday);
            
            // should automatically increase weekday?
            if (!isDifferentDate(yesterday)) {
                self.resetCurrentDate();
            }
        
            resetDateUpdateTimer();

                
        }, ((+dateForChange) - (+today)));
    };
    
    // $date must already be adjusted
    var isDifferentDate = function(date) {
        return date.getFullYear() !== self.currentDate.getFullYear() ||
               date.getMonth()    !== self.currentDate.getMonth() ||
               date.getDate()     !== self.currentDate.getDate();
    };
    
    var isRealDate = function() {
        return !isDifferentDate(adjustDate(new Date()));
    };
    
    
// constructor
    
    adjustDate(this.currentDate);
    resetDateUpdateTimer();
};



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