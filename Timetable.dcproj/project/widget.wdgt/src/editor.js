/*
Copyright (c) 2010 Till Theis, http://www.tilltheis.de

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


/*

Editor

Interface:

Properties:
    (Read-write)
    onSave      : handler
    onCancel    : handler
    onAddRow    : handler
    onRemoveRow : handler
    onOpen      : handler
    onClose     : handler
    
    (Read-only)
    container   : DOM element
    weekType    : 'odd' || 'even'
    

Methods:
    Editor()        : Editor
    open(weekType)  : void  (throws)
    close()         : void
    collectData()   : { data: [days][subjects], times: [], days: [] }   (throws)

*/
function Editor() {
// public
    
    this.onSave      = null;
    this.onCancel    = null;
    this.onAddRow    = null;
    this.onRemoveRow = null;
    this.onOpen      = null;
    
    this.container;
    
    this.weekType;
    
    
    this.open = function(weekType) {
        if (weekType !== 'odd' && weekType !== 'even') {
            throw 'Editor::open: Invalid weekType argument';
        }
        
        this.weekType = weekType;
    
        setupMarkup();
        setupConnections();
        populateTable();
        
        document.body.appendChild(self.container);
        
        if (typeof this.onOpen === 'function') {
            this.onOpen.call(this);
        }
    };
    
    this.close = function() {
        this.container.parentNode.removeChild(self.container);
        this.container = undefined;
        
        if (typeof this.onClose === 'function') {
            this.onClose.call(this);
        }
    };
    
    this.collectData = function() {
        if (!this.container) {
            throw 'Editor::collectData: Editor is closed';
        }
        
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
        
        return { 'table': table, 'days': days, 'times': times };
    };
    
    
// private
    
    var self = this;
    
    var table;
    var thead;
    var tbody;
    
    var addRowButton;
    var removeRowButton;
    var saveButton;
    var cancelButton;
    
    
    var setupMarkup = function() {
        self.container = document.createElement('div');
        self.container.id = 'editor';
        
        table = document.createElement('table');
        table.id = 'editorTable';
        
        var caption = table.createCaption();
        caption.innerHTML = getLocalizedString('Edit Timetable For ' + self.weekType.capitalized() + ' Weeks');
        
        thead = table.createTHead();
        var row = thead.insertRow(0);
        var cell = row.insertCell(0);
        cell.innerHTML = '<input value="' + getLocalizedString('Time') + '" disabled>';
        
        for (var i = 0; i < 5; ++i) {
            var cell = row.insertCell(i + 1);
            var input = document.createElement('input');
            cell.appendChild(input);
        }
        
        tbody = document.createElement('tbody');
        table.appendChild(tbody);
        
        self.container.appendChild(table);
        
        var addRowButtonContainer    = document.createElement('div');
        var removeRowButtonContainer = document.createElement('div');
        var saveButtonContainer      = document.createElement('div');
        var cancelButtonContainer    = document.createElement('div');
        
        addRowButtonContainer.id    = 'editorAddRowButton';
        removeRowButtonContainer.id = 'editorRemoveRowButton';
        saveButtonContainer.id      = 'editorSaveButton';
        cancelButtonContainer.id    = 'editorCancelButton';
        
        addRowButton    = new AppleGlassButton(addRowButtonContainer, '+', null);
        removeRowButton = new AppleGlassButton(removeRowButtonContainer, '-', null);
        saveButton      = new AppleGlassButton(saveButtonContainer, getLocalizedString('Save'), null);
        cancelButton    = new AppleGlassButton(cancelButtonContainer, getLocalizedString('Cancel'), null);
        
        self.container.appendChild(addRowButtonContainer);
        self.container.appendChild(removeRowButtonContainer);
        self.container.appendChild(saveButtonContainer);
        self.container.appendChild(cancelButtonContainer);
    };
    
    var setupConnections = function() {
        var cells = thead.rows[0].cells;
        for (var i = 0; i < cells.length; ++i) {
            improveUsabilityOfInput(cells[i].firstChild);
        }
        
        
        // prevent doubleclick from emulating two mousedown events on save and cancel buttons
        self.container.addEventListener('mousedown', function outerListener(e) {
            var buttonID = e.target.parentNode.parentNode.id;
            if (buttonID !== 'editorCancelButton' && buttonID !== 'editorSaveButton') {
                return;
            }
            
            var innerListener = function(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            self.container.addEventListener('mousedown', innerListener, true);
            
            var container = self.container;
            
            setTimeout(function() {
                container.removeEventListener('mousedown', innerListener, true);
                container.addEventListener('mousedown', outerListener, true);
            }, 1000); // 1 second is ok because pane is either closed or additional user action is required
            
            self.container.removeEventListener('mousedown', outerListener, true);
        }, true);
        
    
        addRowButton.onclick = addRow;
        
        removeRowButton.onclick = function() {
            var numRows = tbody.rows.length;
            
            if (numRows > 0) {
                tbody.deleteRow(numRows - 1);
                
                if (numRows === 1) {
                    addRow().firstChild.firstChild.focus();
                }
            }
            
            if (typeof self.onRemoveRow === 'function') {
                self.onRemoveRow.call(self);
            }
        };
        
        saveButton.onclick = function() {
            if (typeof self.onSave === 'function') {
                self.onSave.call(self);
            }
        };
        
        cancelButton.onclick = function() {
            if (typeof self.onCancel === 'function') {
                self.onCancel.call(self);
            }
        };
    }
    
    var populateTable = function() {
        // When different timetables are used for different weeks
        // they usually only have little differences.
        // Because of that we use the already defined one as template for the new one. 
    
        var hasData = widget.preferenceForKey('has' + self.weekType.capitalized());
        var hasOtherData;
        
        if (!hasData) {
            var otherWeekType = self.weekType === 'odd' ? 'even' : 'odd';
            hasOtherData = widget.preferenceForKey('has' + otherWeekType.capitalized());
        }
        
        var hasAnyData = hasData || hasOtherData;
        
        
        if (hasAnyData) {
            var weekTypeToUse = hasData ? self.weekType : otherWeekType;
        
            var timetable = [];
            for (var i = 0; i < 5; ++i) {
                timetable[i] = JSON.parse(widget.preferenceForKey(weekTypeToUse + gWeekdays[i] + 'Subjects'));
            }
            //var timetable = JSON.parse(widget.preferenceForKey(weekType + 'Subjects'));
            
            
            var row = thead.rows[0];
            for (var i = 0; i < gWeekdays.length; ++i) {
                var label = widget.preferenceForKey(weekTypeToUse + gWeekdays[i] + 'Label');
                var input = row.cells[i + 1].firstChild;
                input.value = label; // seems to eat htmlsepcialchars by itself
            }
            
            
            var times = JSON.parse(widget.preferenceForKey(weekType + 'Times'));
            
            for (var periodIdx = 0; periodIdx < times.length; ++periodIdx) {
                var row = addRow();
                
                row.cells[0].firstChild.value = times[periodIdx];
                
                for (var dayIdx = 0; dayIdx < timetable.length; ++dayIdx) {
                    var day = timetable[dayIdx];
                    
                    if (periodIdx < day.length) {
                        row.cells[dayIdx + 1].firstChild.value = day[periodIdx];
                    }
                }
            }
                
        } else {
        
            var row = thead.rows[0];
            for (var i = 0; i < 5; ++i) {
                var label = getLocalizedString(gWeekdays[i]);
                var input = row.cells[i + 1].firstChild;
                input.value = label; // seems to eat htmlsepcialchars by itself
            }

            for (var i = 0; i < 8; ++i) {
                addRow();
            }
        }
    }
    
    var addRow = function() {
        var idx = tbody.rows.length;
        var row = tbody.insertRow(idx);
        
        var cell = row.insertCell(0);
        var input = document.createElement('input');
        input.value = idx + 1;
        improveUsabilityOfInput(input);
        cell.appendChild(input);
        
        for (var i = 0; i < 5; ++i) {
            var cell = row.insertCell(i + 1);
            var input = document.createElement('input');
            improveUsabilityOfInput(input);
            cell.appendChild(input);
        }
        
        if (typeof self.onAddRow === 'function') {
            self.onAddRow.call(self);
        }
        
        return row;
    }
    
    var improveUsabilityOfInput = function(input) {
        input.onkeydown = function(e) {
            var cell = this.parentNode;
            var row  = cell.parentNode;
            var cellIndex = cell.cellIndex;
            var rowIndex  = row.sectionRowIndex;
                
            // Enter (Return) key ?
            // jump between rows (and insert new rows if needed)
            if (e.keyCode === 13) {
                var newRow;
                 
                if (e.shiftKey) {
                    if (rowIndex !== 0 || cellIndex !== 0) {
                        newRow = row.previousSibling;
                        
                        if (newRow === null) {
                            newRow = row.parentNode.parentNode.tHead.rows[0];
                        }
                    }
                } else {
                    newRow = row.nextSibling;
                    
                    if (newRow === null) {
                        if (row.parentNode.tagName === 'THEAD') {
                            newRow = row.parentNode.parentNode.tBodies[0].rows[0];
                        } else {
                            var tbody = row.parentNode;
                            newRow = addRow();
                        }
                    }
                }
                                            
                if (newRow) {
                    newRow.cells[cellIndex].firstChild.select();
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
                            var row = addRow();
                            newCell = row.cells[0];
                        }
                    }
                                            
                    if (newCell !== undefined) {
                        newCell.firstChild.select();
                        e.preventDefault();
                    }
                } else if (e.shiftKey && cellIndex === 1) {
                    // stay inside table
                    e.preventDefault();
                }
            }
        };
    }
};
