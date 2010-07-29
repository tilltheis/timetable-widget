/*
Copyright (c) 2010 Till Theis, http://www.tilltheis.de

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


function setupBehavior() {
    var el;
    
    // FRONT
    
    
    
    $('day_prev').onclick = function() {
        fadeFontOut(function() {
            toPreviousDay();
            showCurrentDay();
            resizeWidgetToShowFront();
            fadeFontIn();
        });
    };
    
    $('day_next').onclick = function() {
        fadeFontOut(function() {
            toNextDay();
            showCurrentDay();
            resizeWidgetToShowFront();
            fadeFontIn();
        });
    };
    
    $('day_cur').onclick = function() {
        fadeFontOut(function() {
            updateDateAndShowDay();
            resizeWidgetToShowFront();
            fadeFontIn();
        });
    };
    
    
    
    // BACK
    
    $('firstRowToDay').onchange = function() {
        var checkbox = this;
        var ignore = $('ignoreFirstRow');

        widget.setPreferenceForKey(checkbox.checked, 'firstRowToDay');
        
        ignore.disabled = !checkbox.checked;
        
        gSettingsChanged = true;
    };
    
    $('ignoreFirstRow').onchange = function() {
        var checkbox = this;
        
        widget.setPreferenceForKey(checkbox.checked, 'ignoreFirstRow');

        gSettingsChanged = true;
    };
    
    $('firstColToPeriod').onchange = function() {
        var checkbox = this;
        var ignore = document.getElementById('ignoreFirstCol');
        
        widget.setPreferenceForKey(checkbox.checked, 'firstColToPeriod');
        
        ignore.disabled = !checkbox.checked;
        
        gSettingsChanged = true;
    };
    
    $('ignoreFirstCol').onchange = function() {
        var checkbox = this;
        
        widget.setPreferenceForKey(checkbox.checked, 'ignoreFirstCol');
        
        gSettingsChanged = true;
    };
    
    $('displayNextDayAtHour').onchange = function() {
        var dropdown = this;
        var value = +dropdown.options[dropdown.selectedIndex].value;
        
        widget.setPreferenceForKey(value, 'displayNextDayAtHour');
        
        // jump to the 'new' current day in the hope that the user wants this behavior
        toCurrentDay(value);
        gSettingsChanged = true;
    };
    
    $('useISOWeeks').onchange = function() {
        var checkbox = this;
            
        widget.setPreferenceForKey(checkbox.checked, 'useISOWeeks');
        
        var getWeekFuncs = [ Date.prototype.getUSWeek, Date.prototype.getISOWeek ];
        Date.prototype.getWeek = getWeekFuncs[+checkbox.checked];

        
        gSettingsChanged = true;
    };
    
    
    // import csv
    el = document.getElementById('evenBox');
    el.ondrop = function() {
        _documentPathDrop('even', event);
    };
    el.ondragenter = function() {
        event.preventDefault();
        event.stopPropagation();
    };
    el.ondragover = function() {
        event.preventDefault();
        event.stopPropagation();
    };
    
    el = document.getElementById('oddBox');
    el.ondrop = function() {
        _documentPathDrop('odd', event);
    };
    el.ondragenter = function() {
        event.preventDefault();
        event.stopPropagation();
    };
    el.ondragover = function() {
        event.preventDefault();
        event.stopPropagation();
    };
    
    
    $('removeOdd').onclick = function() {
        changeTimetableForWeek(1, null);
    };
    $('removeEven').onclick = function() {
        changeTimetableForWeek(0, null);
    };
    
    
    // edit pane
    $('editOdd').onclick = function() {
        editTimetable(1);
    };
    $('editEven').onclick = function() {
        editTimetable(2);
    };
    
    
    
    // make links clickable
    var links = document.links;
    for (var i = 0; i < links.length; ++i) {
        links[i].onclick = function(e) {
            widget.openURL(this.href); // no closure needed
            e.preventDefault(); // dont open the page within the widget
        };
    }


    // add folding functionality
    var els = [];
    els = els.concat(document.getElementsByClassName('expander'));
    els = els.concat(document.getElementsByClassName('collapser'));
    for (var i = 0; i < els.length; ++i) {
        els[i].onclick = function() {
            foldSection(this);
        };
    }
}

