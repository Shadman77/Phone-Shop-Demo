/*https://github.com/Shadman77, https://github.com/Shadman77/HTML-Card-Slider*/
/*
MIT License

Copyright (c) 2018 Shadman Saif Anonno

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
window.onload = function() {

    /*Test via a getter in the options object to see if the passive property is accessed*/
    var supportsPassive = false;
    try {
        var opts = Object.defineProperty({}, 'passive', {
            get: function() {
                supportsPassive = true;
            }
        });
        window.addEventListener("testPassive", null, opts);
        window.removeEventListener("testPassive", null, opts);
    } catch (e) {}



    var pressed = false,
        scrollingAmount = 0;
    var previousTime, timeDifference, timeIntervalMomentumScroll;
    var pixelsDifference, currentScrollObj;
    var previousPosition;
    var containers = document.getElementsByClassName('tileSliderContainer');
    var leftButtons = document.getElementsByClassName('leftArrowButton');
    var rightButtons = document.getElementsByClassName('rightArrowButton');




    /*Adding event listeners*/
    for (var i = 0; i < containers.length; i++) {
        containers[i].addEventListener('mousedown', startSliding, supportsPassive ? { passive: true } : false);
        containers[i].addEventListener('touchstart', startSliding, supportsPassive ? { passive: true } : false);
        containers[i].addEventListener('mousemove', sliding, supportsPassive ? { passive: true } : false);
        containers[i].addEventListener('touchmove', sliding, supportsPassive ? { passive: true } : false);
        containers[i].addEventListener('mouseup', endSliding, supportsPassive ? { passive: true } : false);
        containers[i].addEventListener('touchend', endSliding, supportsPassive ? { passive: true } : false);
    }

    for (var i = 0; i < rightButtons.length; i++) {
        rightButtons[i].addEventListener('click', rightButtonScroll);
    }

    for (var i = 0; i < leftButtons.length; i++) {
        leftButtons[i].addEventListener('click', leftButtonScroll);
    }

    window.addEventListener("resize", getAmountToScroll);




    /*Getting the amount we need to scroll using the buttons*/
    function getAmountToScroll() {
        /*
        There must be at-least two tiles in the first container for this to work.
        We calculate the amount by getting the difference of the first two tiles's horizontal start position.
        */
        var x = document.getElementsByClassName('tiles')[1].offsetLeft - document.getElementsByClassName('tiles')[0].offsetLeft;
        var y = Math.floor((document.body.clientWidth - document.getElementsByClassName('tiles')[0].offsetLeft) / x);
        scrollingAmount = x * y;
    }

    getAmountToScroll();


    /*When the user pressed down the mouse button or when touch was initiated*/
    function startSliding(event) {
        /*If the sliding sequence already did not start*/
        if (!pressed) {

            /*To end the momentum scrolling function if it has already not ended*/
            clearInterval(timeIntervalMomentumScroll);

            pixelsDifference = 0;

            /*Getting the current time in milliseconds*/
            var date = new Date();
            previousTime = date.getTime();

            /*To prevent smooth scrolling*/
            event.currentTarget.style.scrollBehavior = "";

            /*Prevent Element Dragging*/
            window.ondragstart = function() { return false; };

            /*If it is a touch event instead of a mouse event*/
            if (event.type == 'touchstart')
                event = event.touches[0];

            /*Getting start of slide position*/
            previousPosition = event.clientX;

            /*The sliding sequence has started*/
            pressed = true;
        }
    }

    /*While the mouse button is pressed down or touch is continuing*/
    function sliding(event) {
        /*If the sliding sequence already started*/
        if (pressed) {

            /*Getting the current time in milliseconds*/
            var date = new Date();
            var timeMs = date.getTime();

            var event2 = event;

            /*If it is a touch event instead of a mouse event*/
            if (event.type == 'touchmove')
                event2 = event.touches[0];

            /*Scrolling the required amount*/
            event.currentTarget.scrollLeft = event.currentTarget.scrollLeft + previousPosition - event2.clientX;

            /*Calculating the difference between the current and previous cursor/touch position*/
            if (event2.clientX != previousPosition) {
                timeDifference = timeMs - previousTime;
                pixelsDifference = event2.clientX - previousPosition;
            }

            /*Storing the current cursor position and current time*/
            previousPosition = event2.clientX;
            previousTime = timeMs;
        }
    }

    /*When the mouse button is released down or touch is discontinued*/
    function endSliding(event) {

        /*Setting draggable to true since we are done sliding */
        window.ondragstart = function() { return true; };

        /*Sliding sequence ended*/
        pressed = false;

        /*We get 16ms from the equation floor function of 1000ms/desired frame rate(60)*/
        /*If there are performance issues related to the momentumScroll function then reducing the frame rate to 30 may help*/
        /*
        If that does not work then deleting all the code from the next line to the end of this function will help,
        but there will no longer be the momentum scrolling function 
        */

        /*Storing the event generating object*/
        currentScrollObj = event.currentTarget;

        /*Calculating the required pixel difference for the given time interval of 16ms(60 frames per sec)*/
        pixelsDifference = Math.floor(pixelsDifference / timeDifference * 16); //so that pixelDifference is a 

        /*Setting the momentumScroll function to run at the given time intervals*/
        timeIntervalMomentumScroll = setInterval(momentumScroll, 16);

    }

    /*To allow momentum scroll effect*/
    function momentumScroll() {
        /*Determining the scroll distance for the current iteration*/
        /*The constant 0.88 determines the rate at which the speed slows down*/
        pixelsDifference *= 0.88;
        //console.log(pixelsDifference);

        /*Check if the scroll distance has reduced to 0 or below*/
        if (pixelsDifference < 1 && pixelsDifference > -1) {
            clearInterval(timeIntervalMomentumScroll);
        } else {
            /*Applying the scroll to the required container*/
            currentScrollObj.scrollLeft -= pixelsDifference;
        }
    }

    /*When the right arrow button is pressed*/
    function rightButtonScroll(event) {
        /*To end the momentum scrolling function if it has already not ended*/
        clearInterval(timeIntervalMomentumScroll);

        /*Getting the required container*/
        var element = event.currentTarget.previousElementSibling;

        /*To allow smooth scrolling when button pressed*/
        element.style.scrollBehavior = "smooth";

        /*Scrolling the required amount*/
        element.scrollLeft = (Math.floor(element.scrollLeft / scrollingAmount) + 1) * scrollingAmount;
    }

    /*When the right arrow button is pressed*/
    function leftButtonScroll(event) {
        /*To end the momentum scrolling function if it has already not ended*/
        clearInterval(timeIntervalMomentumScroll);

        /*Getting the required container*/
        var element = event.currentTarget.nextElementSibling;

        /*To allow smooth scrolling when button pressed*/
        element.style.scrollBehavior = "smooth";

        /*Scrolling the required amount*/
        if (element.scrollLeft % scrollingAmount == 0)
            element.scrollLeft -= scrollingAmount;
        else
            element.scrollLeft = Math.floor(element.scrollLeft / scrollingAmount) * scrollingAmount;
    }
};