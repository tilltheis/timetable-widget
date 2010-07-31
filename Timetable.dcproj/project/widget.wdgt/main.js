/*
Copyright (c) 2010 Till Theis, http://www.tilltheis.de

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


var gInfoButton;
var gDoneButton;
var gHelpButton;

var gSettingsChanged;
var gWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

var gHasOdd = false;
var gHasEven = false;





//
// Function: load()
// Called by HTML body element's onload event when the widget is ready to start
//
function load()
{
    gInfoButton = new AppleInfoButton(document.getElementById("info"), document.getElementById("front"), "black", "black", showBack);
    gDoneButton = new AppleGlassButton(document.getElementById("done"), getLocalizedString("Done"), showFront);
    gHelpButton = new AppleGlassButton(document.getElementById("help"), "?", function(){widget.openURL(getLocalizedString("http://www.tilltheis.de/projects/timetable-widget"))});
        
    var getWeekFuncs = [ Date.prototype.getUSWeek, Date.prototype.getISOWeek ];
    Date.prototype.getWeek = getWeekFuncs[+!!widget.preferenceForKey('useISOWeeks')];


    localizeWidget();
    loadWidgetState();
    setupBehavior();
    
    // required to animate resizing of sides
    setupAnimation();

    updateDateAndShowDay();
    resizeWidgetToShowFront();
    
    return;
    $('front').style.display='none';
    $('back').style.display='block';
    resizeWidgetToShowBack();
    
    document.body.addEventListener('webkitAnimationStart', function(e) {
        alert('start');
    }, true);
    document.body.addEventListener('webkitAnimationEnd', function(e) {
        alert('end');
    }, true);
    document.body.addEventListener('webkitAnimationIteration', function(e) {
        alert('iteration');
    }, true);
}

function remove()
{
    clearInterval(gTimerForNextDay);
}

function hide()
{
    clearInterval(gTimerForNextDay);
}

function show()
{
    updateDateAndShowDay();
    
    if (getStyle($('front'), 'display') !== 'none') {
        resizeWidgetToShowFront();
    }
}

function sync()
{
    updateDateAndShowDay();
    
    if (getStyle($('front'), 'display') !== 'none') {
        resizeWidgetToShowFront();
    }
}





function showBack(event) {
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    resizeWidgetToShowBack(function() {
        widget.prepareForTransition("ToBack");
    
        front.style.display = "none";
        back.style.display = "block";
    
        setTimeout('widget.performTransition();', 0);
    });
}



function showFront(event)
{
    // not always required. therefor it's called by someone else
    // updateDateAndShowDay();

    
    //if (gSettingsChanged) {
        showCurrentDay();
    //    gSettingsChanged = false;
    //}



    var front = document.getElementById("front");
    var back = document.getElementById("back");

    widget.prepareForTransition("ToFront");
        
    back.style.display="none";
    front.style.display="block";

    setTimeout('widget.performTransition();', 0);
    setTimeout(resizeWidgetToShowFront, 750);
}

if (window.widget) {
    widget.onremove = remove;
    widget.onhide = hide;
    widget.onshow = show;
    widget.onsync = sync;
}





//////////////////
///// CUSTOM /////
//////////////////





window.onload = load;




function getLocalizedString(key) {
    try {
        var ret = localizedStrings[key];
        if (ret === undefined)
            ret = key;
        return ret;
    } catch (ex) {}
    
    return key;
}


function localizeWidget() {
    var ids = [
        'documentEvenPathLabel',
        'useDocumentOddLabel',
        'firstRowToDayLabel',
        'ignoreFirstRowLabel',
        'firstColToPeriodLabel',
        'ignoreFirstColLabel',
        'displayNextDayAtHourLabel',
        'displayNextDayAtHourDummy',
        'useISOWeeksLabel'
    ];
    
    
    var els = document.getElementsByTagName('label');
    
    for (var i = 0; i < els.length; ++i) {
        // use innerHTML to translate html links
        els[i].innerHTML = getLocalizedString(els[i].innerHTML);
    }
    

    var opt, txt;
    
    txt = document.getElementById('displayNextDayAtHourDummy').innerText;
    txt = getLocalizedString(txt);
    
    var el = document.getElementById('displayNextDayAtHour');
    el.innerHTML = '';
    
    for (var i = 0; i < 24; ++i) {
        opt = document.createElement('option');
        opt.value = i;
        opt.innerText = txt.replace('\%d', i);
        
        // obey local conventions for counting (i.e. "1 hours" => "1 hour")
        opt.innerText = getLocalizedString(opt.innerText);
        
        el.options.add(opt);
    }
}


function loadWidgetState() {
    // No stored preferences yet?
    if (widget.preferenceForKey('hasOdd') === undefined) {
        onFirstLaunch();
    }
    
    var inputs = document.getElementsByTagName('input');
    
    for (var i = 0; i < inputs.length; ++i) {
        if (inputs[i].type !== 'checkbox') continue;
        
        var checkbox = inputs[i];

        checkbox.checked = !!widget.preferenceForKey(checkbox.id);
        
        if (checkbox.hasAttribute('slave')) {
            var slaves = checkbox.getAttribute('slave').split(' ');
            
            for (var j = 0; j < slaves.length; ++j) {
                $(slaves[j]).disabled = !checkbox.checked;
            }
        }
    }


    // don't use setValueForIndicator(). it will trigger an animation
    var indicatorClasses = ['yes', 'no'];
    $('oddIndicator').addClass(indicatorClasses[+(!widget.preferenceForKey('hasOdd'))]);
    $('evenIndicator').addClass(indicatorClasses[+(!widget.preferenceForKey('hasEven'))]);


    var i = +widget.preferenceForKey('displayNextDayAtHour');
    var el = $('displayNextDayAtHour');
    el.options[i].selected = true;
}


function onFirstLaunch() {
    var keysWithValues = {
        firstRowToDay: true,
        ignoreFirstRow: true,
        firstColToPeriod: true,
        ignoreFirstCol: false,
        displayNextDayAtHour: 10,
        useISOWeeks: false,
        hasEven: false,
        hasOdd: false
    }
    
    for (var key in keysWithValues) {
        widget.setPreferenceForKey(keysWithValues[key], key);
    }
}



///////////////////
///// HELPERS /////
///////////////////





function $(id) {
    return document.getElementById(id);
}





function setPreferenceArrayForKey(arr, key) {
    if (arr === null || widget.preferenceForKey(key) === '__Array') {
        unsetPreferenceArrayForKey(key);
        if (arr === null)
            return;
    }

    widget.setPreferenceForKey('__Array', key);
    
    for (var i = 0; i < arr.length; ++i) {
        if (arr[i] instanceof Array)
            setPreferenceArrayForKey(arr[i], key + '_' + i);
        else
            widget.setPreferenceForKey(arr[i], key + '_' + i);
    }
}

function preferenceArrayForKey(key) {
    var curVal = widget.preferenceForKey(key);
    if (curVal !== '__Array') {
        if (curVal !== undefined) {
            console.log("Preference for key '" + key + "' is no array.");
        }
        return [];
    }

    var arr = [];
    
    for (var i = 0; ; ++i) {
        arr[i] = widget.preferenceForKey(key + '_' + i);

        if (typeof arr[i] === 'undefined') {
            arr.length -= 1;
            break;
        }
            
        if (arr[i] === '__Array')
            arr[i] = preferenceArrayForKey(key + '_' + i);
    }

    return arr;
}

function unsetPreferenceArrayForKey(key) {
    var curVal = widget.preferenceForKey(key);
    if (curVal !== '__Array') {
        if (curVal !== undefined) {
            console.log("Preference for key '" + key + "' is no array.");
        }
        return;
    }
    
    widget.setPreferenceForKey(null, key);

    for (var i = 0; ; ++i) {
        var val = widget.preferenceForKey(key + '_' + i);
        
        if (typeof val === 'undefined')
            return;
            
        if (val === '__Array')
            unsetPreferenceArrayForKey(key + '_' + i);
        else
            widget.setPreferenceForKey(null, key + '_' + i);
    }
}
