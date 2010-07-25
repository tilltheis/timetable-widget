function editTimetable(week) {
        var type = week % 2 === 0 ? 'even' : 'odd';
    
        var container = document.createElement('div');
        container.id = 'editTimetableContainer';
        
        var table = document.createElement('table');
        table.id = 'editTimetableTable';
        
        var caption = table.createCaption();
        caption.innerHTML = getLocalizedString('Edit Timetable For ' + type.capitalized() + ' Weeks');
        
        var thead = table.createTHead();
        var row = thead.insertRow(0);
        var time = row.insertCell(0);
        time.innerHTML = '<input value="' + getLocalizedString('Time') + '" disabled>';
        var mon = row.insertCell(1)
        mon.innerHTML = '<input value="' + getLocalizedString('Monday') + '">';
        var tue = row.insertCell(2);
        tue.innerHTML = '<input value="' + getLocalizedString('Tuesday') + '">';
        var wed = row.insertCell(3);
        wed.innerHTML = '<input value="' + getLocalizedString('Wednesday') + '">';
        var thu = row.insertCell(4);
        thu.innerHTML = '<input value="' + getLocalizedString('Thursday') + '">';
        var fri = row.insertCell(5);
        fri.innerHTML = '<input value="' + getLocalizedString('Friday') + '">';
        
        
        // improve experience for keyboard users
        var els = row.getElementsByTagName('input');
        for (var i = 0; i < els.length; ++i) {
            makeInputTableFieldInputUsable(els[i]);
        }

        
        var tbody = document.createElement('tbody');
        table.appendChild(tbody);
        
        
            

        // fill in existing subjects
        if (widget.preferenceForKey('has' + type.capitalized())) {
            var timetable = [];
            for (var i = 0; i < gWeekdays.length; ++i) {
                timetable[i] = preferenceArrayForKey(type + gWeekdays[i] + 'Subjects');
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
            var numRows = 8;
            for (var i = 0; i < numRows; ++i) {
                addEditTableRow(tbody);
            }
        }
        
        
        container.appendChild(table);
        
        
        
        var addLine     = document.createElement('div');
        var removeLine  = document.createElement('div');
        
        var save        = document.createElement('div');
        var cancel      = document.createElement('div');
        
        addLine.addClass('editCommand');
        removeLine.addClass('editCommand');
        
        save.addClass('editAction');
        cancel.addClass('editAction');
                
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
            // data = { table:[][], days:[], times:[] };
            var data = { table: [], days: [], times: [] };
            
            
        });
        new AppleGlassButton(cancel, getLocalizedString("Cancel"), function() {
            container.style.opacity = 0.0;
            setTimeout(function() {
                container.parentNode.removeChild(container);
            }, 1000 * getStyle(container, '-webkit-transition-duration', 'f'));
        });
        
        
        container.appendChild(addLine);
        container.appendChild(removeLine);
        
        container.appendChild(save);
        container.appendChild(cancel);
        
        
        document.body.appendChild(container);
        
        
        // make the widget fit the table's size
        var height = getStyle(container, 'height', 'i') + 10;
        if (height > window.innerHeight) {
            window.resizeTo(window.innerWidth, height);
        }
                
        
        container.style.opacity = 0.0;
        setTimeout(function() {
            container.style.opacity = 0.8;
        }, 0);
        
        
        tbody.rows[0].cells[0].firstChild.focus();
    }