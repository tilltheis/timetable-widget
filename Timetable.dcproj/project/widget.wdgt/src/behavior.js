/*
Copyright (c) 2010 Till Theis, http://www.tilltheis.de

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


function setupBehavior() {
    var el;
    
    
    
    
    
    (function setupCalendar() {
        
        gCalendar.onDateChange = function() {
            var calendar = this;
            
            // 'onWebkitTransitionEnd' (used by fadeIn/Out() won't trigger if element is invisible.
            // Therefore we have to make sure that it's only called when visible
            if (getStyle($('front'), 'display') !== 'none') {
                fadeFontOut(function() { 
                    showDay(calendar);
                    resizeWidgetToShowFront();
                    fadeFontIn();
                });
            } else {
                showDay(calendar);
            }
        };
        
        $('day_prev').addEventListener('click', function() {
            gCalendar.decreaseWeekday();
        }, false);
        
        $('day_next').addEventListener('click', function() {
            gCalendar.increaseWeekday();
        }, false);
        
        $('day_cur').addEventListener('click', function() {
            gCalendar.resetCurrentDate();
        }, false);
        
        
        
        $('displayNextDayAtHour').addEventListener('change', function() {
            var dropdown = this;
            var value = +dropdown.options[dropdown.selectedIndex].value;
            
            widget.setPreferenceForKey(value, 'displayNextDayAtHour');
            
            gCalendar.setHourForChange(value);
        }, false);
        
        $('useISOWeeks').addEventListener('change', function() {
            var checkbox = this;
            var value = checkbox.checked;
                
            widget.setPreferenceForKey(value, 'useISOWeeks');
            
            gCalendar.setUseISOWeeks(value);
        }, false);
        
    }());
    
    
    
    
        
    (function setupImportOptions() {
        
        $('firstRowToDay').addEventListener('change', function() {
            var checkbox = this;
            var ignore = $('ignoreFirstRow');

            widget.setPreferenceForKey(checkbox.checked, 'firstRowToDay');
            
            ignore.disabled = !checkbox.checked;
        }, false);
        
        $('ignoreFirstRow').addEventListener('change', function() {
            var checkbox = this;
            
            widget.setPreferenceForKey(checkbox.checked, 'ignoreFirstRow');
        }, false);
        
        $('firstColToPeriod').addEventListener('change', function() {
            var checkbox = this;
            var ignore = document.getElementById('ignoreFirstCol');
            
            widget.setPreferenceForKey(checkbox.checked, 'firstColToPeriod');
            
            ignore.disabled = !checkbox.checked;
        }, false);
        
        $('ignoreFirstCol').addEventListener('change', function() {
            var checkbox = this;
            
            widget.setPreferenceForKey(checkbox.checked, 'ignoreFirstCol');
        }, false);
    
    }());
    
    
    
    
    
    (function setupTimetableManager() {
        var evenManager = new TimetableManager('even');
        var oddManager  = new TimetableManager('odd');
        
        var createEventHandler = function(weekType, success) {
            return function() {
                var indicator = $(weekType + 'Indicator');
                setValueForIndicator(success, indicator, function() {
                    if (!success && !!widget.preferenceForKey('hasEven')) {
                        indicator.removeClass('no').addClass('yes');

                        // it's ok to do the animation even though the frontside might be shown
                        // because the side flip takes 750ms which is longer than the needed 200ms
                        
                        indicator.style.webkitTransition = 'opacity .2s linear 0';
                        indicator.style.opacity = 0;
                        
                        // fix display bug
                        var remove = indicator.parentNode.getElementsByClassName('remove')[0];
                        remove.style.display = 'inline';
                        setTimeout(function() {
                            remove.style.display = '';
                        }, 0);
                        
                        setTimeout(function() {
                            indicator.style.opacity = 1;
                            
                            setTimeout(function() {
                                indicator.style.webkitTransition = '';
                                indicator.style.opacity = '';
                            }, 200);
                        }, 200);
                    }
                });
            };
        };
        
        evenManager.onSuccess = createEventHandler('even', true);
        evenManager.onFailure = createEventHandler('even', false);
        evenManager.onDelete  = createEventHandler('even', false);
        oddManager.onSuccess  = createEventHandler('odd', true);
        oddManager.onFailure  = createEventHandler('odd', false);
        oddManager.onDelete   = createEventHandler('odd', false);
        
    
        // import csv
        el = document.getElementById('evenBox');
        el.addEventListener('drop', function(e) {
            var path = e.dataTransfer.getData('text/uri-list');
            evenManager.importFromCSV(path);
            
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
            oddManager.importFromCSV(path);
            
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
            oddManager.deleteTimetable();
        }, false);
        $('removeEven').addEventListener('click', function() {
            evenManager.deleteTimetable();
        }, false);
        
    }());
    
    
    
    
    
    (function setupEditor() {
        // editor pane
        var editor = new Editor();
        
        editor.onCancel = function() {
            var editor = this;
            editor.container.style.opacity = 0.0;
            
            setTimeout(function() {
                editor.close();
            }, 1000 * getStyle(editor.container, '-webkit-transition-duration', 'f'));
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
        
        editor.onClose = unfreezeBack;
        
        editor.onAddRow = function() {
            // adjust height if the table is inside the DOM tree
            if (this.container.parentNode !== null) {
                var height = getStyle(this.container, 'height', 'i') + 20;
                if (height > window.innerHeight) {
                    window.resizeTo(window.innerWidth, height);
                }
            }
        }
        
        $('editOdd').addEventListener('click', function() {
            editor.open('odd');
        }, false);
        $('editEven').addEventListener('click', function() {
            editor.open('even');
        }, false);
        
    }());
    
    
    
    
    
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
    els = els.concat(Array.prototype.slice.call(document.getElementsByClassName('expander')));
    els = els.concat(Array.prototype.slice.call(document.getElementsByClassName('collapser')));
    for (var i = 0; i < els.length; ++i) {
        els[i].addEventListener('click', function() {
            foldSection(this);
        }, false);
    }
}






function frozenContainerEventCapturingHandler(e) {
    e.preventDefault();
    e.stopPropagation();
}

function freezeBack() {
    var back = $('back');
    
    // prevent widget content from resizing
    back.style.height = getStyle(back, 'height');

    back.addEventListener('click', frozenContainerEventCapturingHandler, true); // links, handlers
    back.addEventListener('mousedown', frozenContainerEventCapturingHandler, true); // selects, apple buttons
    back.addEventListener('change', frozenContainerEventCapturingHandler, true); // checkboxes
}

function unfreezeBack() {
    var back = $('back');
    
    // the following yields the same result as getHeightOfBack()
    var height = getHeightOfBack();
    window.resizeTo(window.innerWidth, height);

    back.style.height = '';

    back.removeEventListener('click', frozenContainerEventCapturingHandler, true);
    back.removeEventListener('mousedown', frozenContainerEventCapturingHandler, true);
    back.removeEventListener('change', frozenContainerEventCapturingHandler, true);
}




