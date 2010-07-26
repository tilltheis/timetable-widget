function editTimetable(week) {
    var type = week % 2 === 0 ? 'even' : 'odd';

    var container = document.createElement('div');
    container.id = 'editTimetableContainer';
    
    var table = document.createElement('table');
    table.id = 'editTimetableTable';
    
    
    var tbody = document.createElement('tbody');
    table.appendChild(tbody);
    
    
    // prevent visual side effects
    _saveWidgetState();
    

    populateEditorTable(table, type);
    container.appendChild(table);
    addButtonsToContainer(container, (type === 'odd' ? 1 : 2));
    document.body.appendChild(container);
    
    
    adjustWidgetForEditor()
            
    
    container.style.opacity = 0.0;
    setTimeout(function() {
        container.style.opacity = 0.8;
    }, 0);
    
    
    tbody.rows[0].cells[0].firstChild.focus();
}





function disableElement(el) {
    if (typeof el.disabled === 'boolean') {
        el.disabled = true;
    } else if (typeof el.setEnabled === 'function') {
        el.setEnabled(false);
    } else {el.onclick = function() { alert('haha'); }
        /*el.oldOnclickHandler = el.onclick;
        el.onclick = function() { return false; }
        
        el.addEventListener('click', function(e) {
            e.preventDefault();
            return false;
        }, false);*/
    }
}
function enableElement(el) {
    if (typeof el.disabled === 'boolean') {
        el.disabled = false;
    } else if (el.setEnabled === 'function') {
        el.setEnabled(true);
    } else {
        el.onclick = el.oldOnclickHandler;
    }
}


function _saveWidgetState() {
    var back = $('back');
    // prevent widget content from resizing
    back.style.height = getStyle(back, 'height');
    
    // make elements outside the editor pane unusable
    var els = [];
    els = els.concat(Array.prototype.slice.call(back.getElementsByTagName('input')));
    els = els.concat(Array.prototype.slice.call(back.getElementsByTagName('select')));
    els = els.concat(Array.prototype.slice.call(back.getElementsByTagName('a')));
    els = els.concat(Array.prototype.slice.call($('oddBox').getElementsByTagName('*')));
    els = els.concat(Array.prototype.slice.call($('evenBox').getElementsByTagName('*')));
    els.push(gHelpButton);
    els.push(gDoneButton);
    
    for (var i = 0; i < els.length; ++i) {
        disableElement(els[i]);
    }
}
function _restoreWidgetState() {
    window.resizeTo(window.innerWidth, parseInt($('back').style.height, 10));
    $('back').style.height = '';
}


function adjustWidgetForEditor() {
    // adjust height if the table is inside the DOM tree
    var container = $('editTimetableContainer'); // is null if not inside DOM
    if (container !== null && container.parentNode !== null) {
        var height = getStyle(container, 'height', 'i') + 10;
        if (height > window.innerHeight) {
            // prevent #back bg-image from growing
            var backHeight = getStyle($('back'), 'height');
            
            
            window.resizeTo(window.innerWidth, height);
        }
    }
}






function addButtonsToContainer(container, week) {
    var addLine     = document.createElement('div');
    var removeLine  = document.createElement('div');
    
    var save        = document.createElement('div');
    var cancel      = document.createElement('div');
    
    addLine.addClass('editCommand');
    removeLine.addClass('editCommand');
    
    save.addClass('editAction');
    cancel.addClass('editAction');
    
    var table = container.getElementsByTagName('table')[0];
    var tbody = table.tBodies[0];
    var thead = table.tHead;
            
    new AppleGlassButton(addLine, "+", function() { addEditTableRow(tbody); });
    new AppleGlassButton(removeLine, "-", function() {
        var numRows = tbody.rows.length;
        
        if (numRows > 0) {
            tbody.deleteRow(numRows - 1);
            
            if (numRows === 1) {
                addEditTableRow(tbody).firstChild.firstChild.focus();
            }
        }
    });
    
    new AppleGlassButton(save, getLocalizedString("Save"), function() {
        // data = { table:[days][lessons], days:[], times:[] };
        var table = [], days = [], times = [];
        
        var cells = thead.rows[0].cells;
        for (var i = 1; i < cells.length; ++i) {
            days[i - 1] = cells[i].firstChild.value;
        }
        
        var rows = tbody.rows;
        for (var i = 0; i < rows.length; ++i) {
            var cells = rows[i].cells;
            
            times[i] = cells[0].firstChild.value;
            
            table[i] = [];
            for (var j = 1; j < cells.length; ++j) {
                table[i][j - 1] = cells[j].firstChild.value;
            }
        }
        
        var data = { 'table': table, 'days': days, 'times': times };
        changeTimetableForWeek(week, data)
        
        
        closeEditor(container);
    });
    new AppleGlassButton(cancel, getLocalizedString("Cancel"), function() {
        closeEditor(container);
    });
    
    
    container.appendChild(addLine);
    container.appendChild(removeLine);
    
    container.appendChild(save);
    container.appendChild(cancel);
}



function closeEditor(container) {
    container.style.opacity = 0.0;
    setTimeout(function() {
        container.parentNode.removeChild(container);
        _restoreWidgetState();
    }, 1000 * getStyle(container, '-webkit-transition-duration', 'f'));
}





// type = 'odd' || 'even'
function populateEditorTable(table, type) {
    var tbody;
    
    if (table.tBodies.length > 0) {
        tbody = table.tBodies[0];
    } else {
        tbody = document.createElement('tbody');
        table.appendChild(tbody);
    }
    
    
    var thead = table.tHead || table.createTHead();
    var row = thead.insertRow(0);
    var cell = row.insertCell(0)
    cell.innerHTML = '<input value="' + getLocalizedString('Time') + '" disabled>';
    

    if (widget.preferenceForKey('has' + type.capitalized())) {
        var timetable = [];
        for (var i = 0; i < gWeekdays.length; ++i) {
            timetable[i] = preferenceArrayForKey(type + gWeekdays[i] + 'Subjects');
        }
        
        
        for (var i = 0; i < gWeekdays.length; ++i) {
            var label = widget.preferenceForKey(type + gWeekdays[i] + 'Label');
            var cell = row.insertCell(i + 1);
            var input = document.createElement('input');
            input.value = label; // seems to eat htmlsepcialchars by itself
            cell.appendChild(input);
        }
        
        
        var times = preferenceArrayForKey(type + 'Times');
        
        for (var periodIdx = 0; periodIdx < times.length; ++periodIdx) {
            var row = addEditTableRow(tbody);
            
            row.cells[0].firstChild.value = times[periodIdx];
            
            for (var dayIdx = 0; dayIdx < timetable.length; ++dayIdx) {
                var day = timetable[dayIdx];
                
                if (periodIdx < day.length) {
                    row.cells[dayIdx + 1].firstChild.value = day[periodIdx];
                }
            }
        }
            
    } else {
        var caption = table.createCaption();
        caption.innerHTML = getLocalizedString('Edit Timetable For ' + type.capitalized() + ' Weeks');
        
        for (var i = 0; i < gWeekdays.length; ++i) {
            var cell = row.insertCell(i + 1);
            var input = document.createElement('input');
            input.value = getLocalizedString(gWeekdays[i]); // seems to eat htmlsepcialchars by itself
            cell.appendChild(input);
        }

        
        
        // improve experience for keyboard users
        var els = row.getElementsByTagName('input');
        for (var i = 0; i < els.length; ++i) {
            makeInputTableFieldInputUsable(els[i]);
        }

        var numRows = 8;
        for (var i = 0; i < numRows; ++i) {
            addEditTableRow(tbody);
        }
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
    
    adjustWidgetForEditor()
    
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
        if (e.keyCode === 9) {
            if (row.parentNode.tagName === 'TBODY') {
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
            } else if (e.shiftKey && cellIndex === 1) {
                // stay inside table
                e.preventDefault();
            }
        }
    });
}
