/*
Copyright (c) 2010 Till Theis, http://www.tilltheis.de

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


/*******************/
/*     Element     */
/*******************/


Element.prototype.addClass = function(cl) {
    if (!this.hasClass(cl))
        this.className += ' ' + cl;
}

Element.prototype.removeClass = function(cl) {
    this.className = this.className.replace(new RegExp('(^| )*'+cl+'( |$)*'), ' ');
}

Element.prototype.hasClass = function(cl) {
    return (new RegExp('(^| )'+cl+'( |$)')).test(this.className);
}

Element.prototype.getElementsByClassName = function(cl) {
    var input = this.getElementsByTagName('*');
    var output = [];
    
    for (var i = 0; i < input.length; ++i) {//if (cl === 'add') { alert(input[i]); }
        if (input[i].hasClass(cl))
            output[output.length] = input[i];
    }
            
    return output;
    
    /*var input = this.childNodes;
    var output = [];
    
    for (var i = 0; i < input.length; ++i) {
        if (input[i] instanceof Element) {
            output = output.concat(input[i].getElementsByClassName(cl));
            
            if (input[i].hasClass(cl))
                output[output.length] = input[i];
        }
    }
            
    return output;*/
}


Element.prototype.getOffset = function() {
    var offset = { x: this.offsetLeft, y: this.offsetTop };

    var parent = this.offsetParent;
    
    if (parent === document.body.parentNode
        || parent === document.body
        || parent === null) {
        
        return offset;
    }
    
    var parentOffset = parent.getOffset();
    
    offset.x += parentOffset.x;
    offset.y += parentOffset.y;
    
    return offset;
}





/********************/
/*     document     */
/********************/


document.getElementsByClassName = function(cl) {
    return document.documentElement.getElementsByClassName(cl);

    /*var input = document.getElementsByTagName('*');
    var output = [];
    
    for (var i = 0; i < input.length; ++i)
        if (input[i].hasClass(cl))
            output[output.length] = input[i];
            
    return output;*/
}





/****************/
/*     Date     */
/****************/


Date.prototype.getUSWeek = function() {
    var onejan = new Date(this.getFullYear(),0,1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
}


Date.prototype.getISOWeeks = function() {
    var firstDayOfYear = new Date(this.getFullYear(), 0, 1);
    var lastDayOfYear = new Date(this.getFullYear(), 11, 31);

    if (firstDayOfYear.getDay() === 4 ||
        lastDayOfYear.getDay() === 4) {
        return 53;
    }

    return 52;
}

Date.prototype.getISOWeek = function() {
    var jan4ISODay = (new Date(this.getFullYear(), 0, 4)).getDay();
    if (jan4ISODay === 0) jan4ISODay = 6;
    else jan4ISODay--;

    var mondayOfFirstWeek = new Date(this.getFullYear(), 0, 4-jan4ISODay);

    if (+mondayOfFirstWeek > +this) {
        return (new Date(this.getFullYear()-1)).getISOWeeks();
    }

    var millisecondsToDaysFactor = 86400000; // 1000 * 60 * 60 * 24
    var daysFromMondayOfFirstWeek = (+this - +mondayOfFirstWeek) / millisecondsToDaysFactor;

    var week = Math.ceil((daysFromMondayOfFirstWeek + 1) / 7);

    if (week > this.getISOWeeks()) {
        return 1;
    }

    return week;
}





/*****************/
/*     Array     */
/*****************/


Array.range = function(from, to) {
    var a = [];

    if (from <= to)
        for (var i = from; i <= to; ++i)
            a.push(i);
    else
        for (var i = from; i >= to; --i)
            a.push(i);
    
    return a;
};





/******************/
/*     String     */
/******************/


String.prototype.capitalized = function() {
    var capitalizedString = '';
    
    if (this.length > 0) {
        capitalizedString += this.charAt(0).toUpperCase();
        
        if (this.length > 1) {
            capitalizedString += this.substr(1);
        }
    }
    
    return capitalizedString;
}

String.prototype.escapeHtmlSpecialChars = function() {
    return this.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
