/*
Copyright (c) 2010 Till Theis, http://www.tilltheis.de

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


var gResizeWidgetAnimator;
var gResizeWidgetAnimation;



function setupAnimation() {
    gResizeWidgetAnimator = new AppleAnimator(400, 13);
    gResizeWidgetAnimation = new AppleAnimation(0, 0, resizeWidgetHeightAnimationHandler);
    gResizeWidgetAnimator.addAnimation(gResizeWidgetAnimation);
}


function resizeWidgetHeightAnimationHandler(animation, current, start, finish) {
    window.resizeTo(window.innerWidth, current);
}




function resizeWidgetToShowBack(onComplete) {
    gResizeWidgetAnimator.stop();

    gResizeWidgetAnimation.from = window.innerHeight;
    gResizeWidgetAnimation.to = getHeightOfBack();

    gResizeWidgetAnimator.oncomplete = onComplete;
    
    gResizeWidgetAnimator.start();
}

function resizeWidgetToShowFront(onComplete) {
    var htmlTitle = document.getElementById('title');
    var htmlTable = document.getElementById('timetable');
    var htmlStatus = document.getElementById('status');
    
    var titleHeight = parseInt(document.defaultView.getComputedStyle(htmlTitle, null).getPropertyValue('height'), 10);
    var statusHeight = parseInt(document.defaultView.getComputedStyle(htmlStatus, null).getPropertyValue('height'), 10);
    
    var rowHeight = 0;
    if (htmlTable.rows.length > 0) {
        rowHeight = parseInt(document.defaultView.getComputedStyle(htmlTable.rows[0], null).getPropertyValue('height'), 10);
    }

    var tableHeight = htmlTable.rows.length * rowHeight;


    gResizeWidgetAnimator.stop();

    gResizeWidgetAnimation.from = window.innerHeight;
    gResizeWidgetAnimation.to = titleHeight + tableHeight + statusHeight;
    
    gResizeWidgetAnimator.oncomplete = onComplete;

    gResizeWidgetAnimator.start();
}



function fadeFontIn(oncomplete) {
    fadeFontWithParams({from:0.0, to:1.0, oncomplete:oncomplete});
}

function fadeFontOut(oncomplete) {
    fadeFontWithParams({from:1.0, to:0.0, oncomplete:oncomplete});
}

function fadeFontWithParams(params) {
    var oldClass, newClass;

    if (params.from < params.to) {
        oldClass = 'outdated';
        newClass = 'updated';
    } else {
        oldClass = 'updated';
        newClass = 'outdated';
    }

    $('day_cur').removeClass(oldClass);
    $('day_cur').addClass(newClass);
    $('timetable').removeClass(oldClass);
    $('timetable').addClass(newClass);
        
    setTimeout(params.oncomplete,
        getStyle($('day_cur'), '-webkit-transition-duration', 'f') * 1000);
}



var foldSectionAnimator = new AppleAnimator(300, 0, 0, 0, function(a, c, s, f) {
    $('importOptions').style.height = c + 'px !important';

    // (s)tart and (f)inish are booleans, indicating whether it's the first are last run.
    // access $this (AppleAnimation) to read start and end values
    window.resizeTo(window.innerWidth, foldSectionOldWidgetHeight - this.from + c);
    
    if (f) gFoldSectionAnimationRunning = false;
});

var foldSectionOldWidgetHeight = 0;
var gFoldSectionAnimationRunning = false;

function foldSection(master) {
    // avoid animation bugs
    if (gFoldSectionAnimationRunning) {
        return;
    }
    
    gFoldSectionAnimationRunning = true; // will be reset by foldSectionAnimator()


    var oldMasterClass, newMasterClass, oldSlaveClass, newSlaveClass;
    
    if (master.hasClass('expander')) {
        oldMasterClass = 'expander';
        newMasterClass = 'collapser';
        oldSlaveClass = 'expansible';
        newSlaveClass = 'collapsible';
    } else {
        oldMasterClass = 'collapser';
        newMasterClass = 'expander';
        oldSlaveClass = 'collapsible';
        newSlaveClass = 'expansible';
    }

    master.removeClass(oldMasterClass);
    master.addClass(newMasterClass);
    
    
    var slave = document.getElementById(master.htmlFor);
    
    var oldHeight, newHeight;
    
    oldHeight = getHeightOfBack();
    foldSectionOldWidgetHeight = oldHeight;
    
    // calculate new height by doing the transformation and undoing it again immediately
    {
        slave.removeClass(oldSlaveClass);
        slave.addClass(newSlaveClass);
        
        newHeight = getHeightOfBack();
        
        slave.removeClass(newSlaveClass);
        slave.addClass(oldSlaveClass);
    }

    

    if (oldHeight > newHeight)
    {
        // collapse
        
        foldSectionAnimator.animations[0].from = oldHeight - newHeight;
        foldSectionAnimator.animations[0].to = 0;
                
        foldSectionAnimator.oncomplete = function() {
            slave.style.height = '';
        
            slave.removeClass(oldSlaveClass);
            slave.addClass(newSlaveClass);
                
        };
        
    }
    else
    {
        // expand
        
        foldSectionAnimator.animations[0].from = 0;
        foldSectionAnimator.animations[0].to = newHeight - oldHeight;
    
        slave.removeClass(oldSlaveClass);
        slave.addClass(newSlaveClass);
        
        // force drawing of initial state immediately
        foldSectionAnimator.animations[0].callback(null, 0, 0, 0);
        
        foldSectionAnimator.oncomplete = function () {
            slave.style.height = '';
        };

    }
    
    
    foldSectionAnimator.stop();
    //foldSectionAnimator.oncomplete = function() { gFoldSectionAnimationRunning = false;alert('complete'); };
    foldSectionAnimator.start();
}





function getHeightOfBack() {
    var back = document.getElementById('back');
    var prefs = document.getElementById('preferencesContainer');

    var oldDisplayStyle = getStyle(back, 'display');

    if (oldDisplayStyle === 'none') {
        back.style.display = 'block'; // required to calculate height
    }

    var top = getStyle(prefs, 'padding-top', 'i');
    var bottom = getStyle(prefs, 'padding-bottom', 'i');
    var height = getStyle(prefs, 'height', 'i');

    height += top + bottom;

    if (oldDisplayStyle === 'none') {
        back.style.display = 'none'; // restore previous state
    }

    return height;
}






var indicatorTimers = {};

function setValueForIndicator(value, indicator) {
    var classes = [ 'yes', 'no' ];

    indicator.removeClass('yes');
    indicator.removeClass('no');

    // no change is made if triggered without timeout
    setTimeout(function() {
        indicator.addClass(classes[value]);
        indicator.addClass('updated');

        // add/remove class to avoid animation each time the widget's back is shown
        clearTimeout(indicatorTimers[indicator.id]);
        indicatorTimers[indicator.id] = setTimeout(function() {
            indicator.removeClass('updated');
        }, getStyle(indicator, '-webkit-animation-duration', 'f') * 1000);
    }, 0);
}


function getStyle(el, prop, type) {
    var style = document.defaultView.getComputedStyle(el, null).getPropertyValue(prop);
    
         if (type === 'i') style = parseInt(style)
    else if (type === 'f') style = parseFloat(style);
    
    return style;
}


function $(id) {
    return document.getElementById(id);
}
