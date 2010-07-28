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
    el.addEventListener('drop', function(e) {
        var path = e.dataTransfer.getData('text/uri-list');
        var manager = new TimetableManager('even');
        var success = manager.importFromCSV(path);
        
        setValueForIndicator(success, $('evenIndicator'));
        
        e.preventDefault();
        e.stopPropagation();
    }, false);
    el.addEventListener('dragenter', function(e) {
        e.preventDefault();
        e.stopPropagation();
    }, false);
    el.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
    }, false);
    
    el = document.getElementById('oddBox');
    el.addEventListener('drop', function(e) {
        var path = e.dataTransfer.getData('text/uri-list');
        var manager = new TimetableManager('odd');
        var success = manager.importFromCSV(path);
        
        setValueForIndicator(success, $('oddIndicator'));
        
        e.preventDefault();
        e.stopPropagation();
    }, false);
    el.addEventListener('dragenter', function(e) {
        e.preventDefault();
        e.stopPropagation();
    }, false);
    el.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
    }, false);
    
    
    $('removeOdd').addEventListener('click', function() {
        var manager = new TimetableManager('odd');
        manager.deleteTimetable();
        
        setValueForIndicator(false, $('oddIndicator'));
    }, false);
    $('removeEven').addEventListener('click', function() {
        var manager = new TimetableManager('even');
        manager.deleteTimetable();
        
        setValueForIndicator(false, $('evenIndicator'));
    }, false);
    
    
    // editor pane
    var editor = new Editor();
    
    editor.onCancel = function() {
        this.container.style.opacity = 0.0;
        setTimeout(this.close, 1000 * getStyle(this.container, '-webkit-transition-duration', 'f'));
    };
    
    editor.onSave = function() {
        var data = this.collectData();
        var manager = new TimetableManager(this.weekType);
        var success = manager.importFromObject(data);
        
        setValueForIndicator(success, $(this.weekType + 'Indicator'));
        
        this.onCancel();
    };
    
    editor.onOpen = function() {
        (function(container) {
            container.style.opacity = 0.0;
            setTimeout(function() {
                container.style.opacity = '';
            }, 0);
        }(this.container));
        
        freezeBack();
        editor.onAddRow(); // resize widget for loaded table
    };
    
    editor.onClose = function() {
        unfreezeBack();
    };
    
    editor.onAddRow = function() {
        // adjust height if the table is inside the DOM tree
        if (this.container.parentNode !== null) {
            var height = getStyle(this.container, 'height', 'i') + 10;
            if (height > window.innerHeight) {
                window.resizeTo(window.innerWidth, height);
            }
        }
    }
    
    $('editOdd').addEventListener('click', function() {
        var container = editor.open('odd');
    }, false);
    $('editEven').addEventListener('click', function() {
        editor.open('even');
    }, false);
    
    
    
    // make links clickable
    var links = document.links;
    for (var i = 0; i < links.length; ++i) {
        links[i].addEventListener('click', function(e) {
            widget.openURL(this.href); // no closure needed
            e.preventDefault(); // dont open the page within the widget
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






function disabledContainerEventCapturingHandler(e) {
    e.preventDefault();
    e.stopPropagation();
}

function disableElement(el) {
    if (typeof el.disabled === 'boolean') {
        if (!el.disabled) {
            el.becameDisabled = true;
            el.disabled = true;
        }
    } else if (typeof el.setEnabled === 'function') {
        if (el.enabled) {
            el.becameDisabled = true;
            el.setEnabled(false);
        }
    } else {
        throw 'disableElement: Cannot disable non form element';
    }
}
function enableElement(el) {
    if (typeof el.disabled === 'boolean') {
        if (el.becameDisabled) {
            el.disabled = false;
            delete el.becameDisabled;
        }
    } else if (typeof el.setEnabled === 'function') {
        if (el.becameDisabled) {
            el.setEnabled(true);
            delete el.becameDisabled;
        }
    } else {
        throw 'enableElement: Cannot enable non form element';
    }
}

function getBackControls() {
    var els = [];
    
    els = els.concat(Array.prototype.slice.call(back.getElementsByTagName('input')));
    els = els.concat(Array.prototype.slice.call(back.getElementsByTagName('select')));
    els.push(gHelpButton);
    els.push(gDoneButton);
    
    return els;
}


function freezeBack() {
    var back = $('back');
    // prevent widget content from resizing
    back.style.height = getStyle(back, 'height');
    
    back.addEventListener('click', disabledContainerEventCapturingHandler, true);
    
    // make elements outside the editor pane unusable
    var els = getBackControls();
    for (var i = 0; i < els.length; ++i) {
        disableElement(els[i]);
    }
}
function unfreezeBack() {
    var back = $('back');
    
    window.resizeTo(window.innerWidth, parseInt(back.style.height, 10));
    back.style.height = '';
    
    back.removeEventListener('click', disabledContainerEventCapturingHandler, true);
    
    var els = getBackControls();
    for (var i = 0; i < els.length; ++i) {
        enableElement(els[i]);
    }
}




