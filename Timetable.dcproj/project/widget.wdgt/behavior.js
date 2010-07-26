/*
Copyright (c) 2010 Till Theis, http://www.tilltheis.de

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


function setupBehavior() {
    var el;
    
    // FRONT
    
    
    
    $('day_prev').addEventListener('click', function() {
        fadeFontOut(function() {
            toPreviousDay();
            showCurrentDay();
            resizeWidgetToShowFront();
            fadeFontIn();
        });
    }, false);
    
    $('day_next').addEventListener('click', function() {
        fadeFontOut(function() {
            toNextDay();
            showCurrentDay();
            resizeWidgetToShowFront();
            fadeFontIn();
        });
    }, false);
    
    $('day_cur').addEventListener('click', function() {
        fadeFontOut(function() {
            updateDateAndShowDay();
            resizeWidgetToShowFront();
            fadeFontIn();
        });
    }, false);
    
    
    
    // BACK
    
    $('firstRowToDay').addEventListener('change', function() {
        var checkbox = this;
        var ignore = $('ignoreFirstRow');

        widget.setPreferenceForKey(checkbox.checked, 'firstRowToDay');
        
        ignore.disabled = !checkbox.checked;
        
        gSettingsChanged = true;
    }, false);
    
    $('ignoreFirstRow').addEventListener('change', function() {
        var checkbox = this;
        
        widget.setPreferenceForKey(checkbox.checked, 'ignoreFirstRow');

        gSettingsChanged = true;
    }, false);
    
    $('firstColToPeriod').addEventListener('change', function() {
        var checkbox = this;
        var ignore = document.getElementById('ignoreFirstCol');
        
        widget.setPreferenceForKey(checkbox.checked, 'firstColToPeriod');
        
        ignore.disabled = !checkbox.checked;
        
        gSettingsChanged = true;
    }, false);
    
    $('ignoreFirstCol').addEventListener('change', function() {
        var checkbox = this;
        
        widget.setPreferenceForKey(checkbox.checked, 'ignoreFirstCol');
        
        gSettingsChanged = true;
    }, false);
    
    $('displayNextDayAtHour').addEventListener('change', function() {
        var dropdown = this;
        var value = +dropdown.options[dropdown.selectedIndex].value;
        
        widget.setPreferenceForKey(value, 'displayNextDayAtHour');
        
        // jump to the 'new' current day in the hope that the user wants this behavior
        toCurrentDay(value);
        gSettingsChanged = true;
    }, false);
    
    $('useISOWeeks').addEventListener('change', function() {
        var checkbox = this;
            
        widget.setPreferenceForKey(checkbox.checked, 'useISOWeeks');
        
        var getWeekFuncs = [ Date.prototype.getUSWeek, Date.prototype.getISOWeek ];
        Date.prototype.getWeek = getWeekFuncs[+checkbox.checked];

        
        gSettingsChanged = true;
    }, false);
    
    
    // import csv
    el = document.getElementById('evenBox');
    el.addEventListener('drop', function() {
        _documentPathDrop('even', event);
    }, false);
    el.addEventListener('dragenter', function() {
        event.preventDefault();
        event.stopPropagation();
    }, false);
    el.addEventListener('dragover', function() {
        event.preventDefault();
        event.stopPropagation();
    }, false);
    
    el = document.getElementById('oddBox');
    el.addEventListener('drop', function() {
        _documentPathDrop('odd', event);
    }, false);
    el.addEventListener('dragenter', function() {
        event.preventDefault();
        event.stopPropagation();
    }, false);
    el.addEventListener('dragover', function() {
        event.preventDefault();
        event.stopPropagation();
    }, false);
    
    
    $('removeOdd').addEventListener('click', function() {
        changeTimetableForWeek(1, null);
    }, false);
    $('removeEven').addEventListener('click', function() {
        changeTimetableForWeek(0, null);
    }, false);
    
    
    // edit pane
    $('editOdd').addEventListener('click', function() {
        editTimetable(1);
    }, false);
    $('editEven').addEventListener('click', function() {
        editTimetable(2);
    }, false);
    
    
    
    // make links clickable
    var links = document.links;
    for (var i = 0; i < links.length; ++i) {
        links[i].addEventListener('click', function() {
            widget.openURL(this.href); // no closure needed
        }, false);
    }


    // add folding functionality
    var els = [];
    els = els.concat(document.getElementsByClassName('expander'));
    els = els.concat(document.getElementsByClassName('collapser'));
    for (var i = 0; i < els.length; ++i) {
        els[i].addEventListener('click', function() {
            foldSection(this);
        }, false);
    }
}

