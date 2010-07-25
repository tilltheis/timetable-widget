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
    
    
    
editTimetable(1);

    $('editOdd').addEventListener('click', function() {
        //setValueForIndicator(0, $('oddIndicator'));
        editTimetable(1);
    }, false);
    $('editEven').addEventListener('click', function() {
        //setValueForIndicator(0, $('evenIndicator'));
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








function addEditTableRow(tbody) {
    var idx = tbody.rows.length;
    var row = tbody.insertRow(idx);
    
    var time = row.insertCell(0);
    time.innerHTML = '<input type="text" value="' + (idx + 1) + '">';
    
    for (var i = 0; i < 5; ++i) {
        var col = row.insertCell(i + 1);
        col.innerHTML = '<input type="text">';
    }
    
    // adjust height if the table is inside the DOM tree
    var container = $('editTimetableContainer'); // is null if not inside DOM
    if (container !== null && container.parentNode !== null) {
        var height = getStyle(container, 'height', 'i') + 10;
        if (height > window.innerHeight) {
            window.resizeTo(window.innerWidth, height);
        }
    }
    
    
    // improve experience for keyboard users
    var els = row.getElementsByTagName('input');
    for (var i = 0; i < els.length; ++i) {
        makeInputTableFieldInputUsable(els[i]);
    }
    
    return row;
}






function makeInputTableFieldInputUsable(el) {
    el.addEventListener('keydown', function(e) {
        var cell = this.parentNode;
        var row  = cell.parentNode;
        var cellIndex = cell.cellIndex;
        var rowIndex  = row.sectionRowIndex;
            
        // Enter (Return) key ?
        // jump between rows (and insert new rows if needed)
        if (e.keyCode === 13) {
            var newRow;
             
            if (e.shiftKey) {
                newRow = row.previousSibling;
                
                if (newRow === null) {
                    newRow = row.parentNode.parentNode.tHead.rows[0];
                }
            } else {
                newRow = row.nextSibling;
                
                if (newRow === null) {
                    if (row.parentNode.tagName === 'THEAD') {
                        newRow = row.parentNode.parentNode.tBodies[0].rows[0];
                    } else {
                        var tbody = row.parentNode;
                        newRow = addEditTableRow(tbody);
                    }
                }
            }
                                        
            if (newRow !== null) {
                newRow.cells[cellIndex].firstChild.focus();
            }
        }
        else
        // Tab key ?
        // jump from beginning to end or insert new row
        if (row.parentNode.tagName === 'TBODY' && e.keyCode === 9) {
            var tbody = row.parentNode;
            var newCell;
             
            if (e.shiftKey) {
                if (rowIndex === 0 && cellIndex === 0) {
                    var row = row.parentNode.parentNode.tHead.rows[0];
                    newCell = row.cells[row.cells.length - 1];
                }
            } else {
                if (rowIndex === tbody.rows.length - 1 && cellIndex === row.cells.length - 1) {
                    var row = addEditTableRow(tbody);
                    newCell = row.cells[0];
                }
            }
                                        
            if (newCell !== undefined) {
                newCell.firstChild.focus();
                e.preventDefault();
            }
        }
    });
}
