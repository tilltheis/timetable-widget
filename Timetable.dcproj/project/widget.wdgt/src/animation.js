/*
Copyright (c) 2010 Till Theis, http://www.tilltheis.de

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


var gResizeWidgetHeightAnimator;
var gResizeWidgetHeightAnimation;


var setupAnimation = function() {
    gResizeWidgetHeightAnimator  = new AppleAnimator(400, 13);
    gResizeWidgetHeightAnimation = new AppleAnimation(0, 0, function(a, c, s, f) {
        window.resizeTo(window.innerWidth, c);
    });
    
    gResizeWidgetHeightAnimator.addAnimation(gResizeWidgetHeightAnimation);
}





/********************/
/*     RESIZING     */
/********************/

var resizeWidgetHeight = function(newHeight, onComplete) {
    gResizeWidgetHeightAnimator.stop();

    gResizeWidgetHeightAnimation.from      = window.innerHeight;
    gResizeWidgetHeightAnimation.to        = newHeight;
    gResizeWidgetHeightAnimator.oncomplete = onComplete;
    
    gResizeWidgetHeightAnimator.start();
}


var resizeWidgetToShowBack = function(onComplete) {
    resizeWidgetHeight(getHeightOfBack(), onComplete);
}

var resizeWidgetToShowFront = function(onComplete) {
    resizeWidgetHeight(getHeightOfFront(), onComplete);
}


var getHeightOfBack = function() {
    var back = $('back');
    var prefs = $('preferencesContainer');

    var oldDisplayStyle = getStyle(back, 'display');

    if (oldDisplayStyle === 'none') {
        back.style.display = 'block'; // required to calculate height
    }

    var top = getStyle(back, 'top', 'i');
    var paddingTop = getStyle(prefs, 'padding-top', 'i');
    var paddingBottom = getStyle(prefs, 'padding-bottom', 'i');
    var height = getStyle(prefs, 'height', 'i');

    height += paddingTop + paddingBottom + top;

    if (oldDisplayStyle === 'none') {
        back.style.display = 'none'; // restore previous state
    }

    return height;
}

var getHeightOfFront = function() {
    var titleHeight = getStyle($('title'), 'height', 'i');
    var statusHeight = getStyle($('status'), 'height', 'i');

    var rowHeight = 0;
    var htmlTable = $('timetable');
    if (htmlTable.rows.length > 0) {
        rowHeight = getStyle(htmlTable.rows[0], 'height', 'i');
    }

    var tableHeight = htmlTable.rows.length * rowHeight + 10;
    

    return titleHeight + tableHeight + statusHeight;
}





/********************/
/*      FADING      */
/********************/


var fadeFontIn = function(oncomplete) {
    fadeFontWithParams('in', oncomplete);
}

var fadeFontOut = function(oncomplete) {
    fadeFontWithParams('out', oncomplete);
}

var fadeFontWithParams = function(inout, oncomplete) {
    if (inout !== 'in' && inout !== 'out') {
        throw 'fadeFontWithParams: Invalid inout argument';
    }
    
    var newClass = inout === 'in' ? 'fadeFontIn' : 'fadeFontOut';
    var oldClass = inout === 'in' ? 'fadeFontOut' : 'fadeFontIn';
    
    var title = $('day_cur');
    var table = $('timetable');

    title.removeClass(oldClass).addClass(newClass);
    table.removeClass(oldClass).addClass(newClass);
    
    if (typeof oncomplete === 'function') {
        title.addEventListener('webkitTransitionEnd', function callback() {
            title.removeEventListener('webkitTransitionEnd', callback, false);
            oncomplete();
        }, false);
    }
}





/********************/
/*     FOLDING      */
/********************/

var foldSectionAnimator = new AppleAnimator(300, 0, 0, 0, function(a, c, s, f) {
    $('importOptions').style.height = c + 'px !important'; // render immediately

    // (s)tart and (f)inish are booleans, indicating whether it's the first are last run.
    // access $this (AppleAnimation) to read start and end values
    window.resizeTo(window.innerWidth, foldSectionOldWidgetHeight - this.from + c);
});

var foldSectionOldWidgetHeight = 0;
var gFoldSectionAnimationRunning = false;

var foldSection = function(master) {
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
            
            gFoldSectionAnimationRunning = false;
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
            
            gFoldSectionAnimationRunning = false;
        };

    }
    
    
    foldSectionAnimator.stop();
    foldSectionAnimator.start();
}





/********************/
/*    INDICATORS     */
/********************/

var setValueForIndicator = function(value, indicator, onComplete) {
    var className = value ? 'yes' : 'no';

    indicator.removeClass('yes').removeClass('no');

    // no change is made if triggered without timeout (style changes are coerced)
    setTimeout(function() {
        indicator.addClass(className).addClass('updated');
        
        // remove button will only be shown after .indicator:hover or after switching widget sides again
        // i don't know why but this fixes the bug 
        if (value) {
            var remove = indicator.parentNode.getElementsByClassName('remove')[0];
            remove.style.display = 'inline';
            setTimeout(function() {
                remove.style.display = '';
            }, 0);
        }
        
        
        // dont only use event listeners on the indicator because they wont trigger if animation cant finish
        // e.g. when front is shown before animation did finish it will continue when the user comes back
        
        var back = $('back');

        var callback = function() {
            back.removeEventListener('showFront', callback, false);
            indicator.removeEventListener('webkitAnimationEnd', callback, false);
            
            indicator.removeClass('updated');

            if (typeof onComplete === 'function') {
                onComplete.call(indicator);
            }
        };
        
        indicator.addEventListener('webkitAnimationEnd', callback, false);
        back.addEventListener('showFront', callback, false);
    }, 0);
}





/********************/
/*     HELPERS      */
/********************/

var getStyle = function(el, prop, type) {
    var style = document.defaultView.getComputedStyle(el, null).getPropertyValue(prop);
    
         if (type === 'i') style = parseInt(style, 10);
    else if (type === 'f') style = parseFloat(style);
    
    return style;
}


var $ = function(id) {
    return document.getElementById(id);
}
