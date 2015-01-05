//HTML5 Magazine App - HMA v0.1.8
(function($) {
    
    var $magEl,
        $nav,
        width,
        height,
        animating,
        startposX,
        startposY,
        mousedown,
        swiping,
        numPages;

    var threshold = 200;

    $.fn.HMA = function(o) {
        o = o || {};

        $magEl = $(this);

        initPages(this);
        
        numPages = $magEl.children('section').length;

        $(window).bind('touchstart mousedown', function(e){
            mousedown = true;
            startposX = (e.originalEvent.changedTouches) ? e.originalEvent.changedTouches[0].pageX : e.originalEvent.pageX;
            startposY = (e.originalEvent.changedTouches) ? e.originalEvent.changedTouches[0].pageY : e.originalEvent.pageY;
        });
        $(window).bind('touchmove mousemove', function(e){
            e.preventDefault();

            swiping = true;

            if (!animating && mousedown) {
                var diffX = startposX - ((e.originalEvent.changedTouches) ? e.originalEvent.changedTouches[0].pageX : e.originalEvent.pageX);
                var diffY = startposY - ((e.originalEvent.changedTouches) ? e.originalEvent.changedTouches[0].pageY : e.originalEvent.pageY);

                if ((Math.abs(diffX) > 10) || (Math.abs(diffY) > 10)) {
                    if ((Math.abs(diffY) > Math.abs(diffX)) && $('section[data-hma="0"]>.sub-section').length) {
                        $('section[data-hma="0"]>.sub-section[data-hma-sub]').css('margin-top', -diffY);
                    } else {
                        $('section[data-hma]').css('margin-left', -diffX);
                    }
                }
            }
        });
        $(window).bind('touchend mouseup', function(e){
            mousedown = false;
            swiping = false;

            var diffX = startposX - ((e.originalEvent.changedTouches) ? e.originalEvent.changedTouches[0].pageX : e.originalEvent.pageX);
            var diffY = startposY - ((e.originalEvent.changedTouches) ? e.originalEvent.changedTouches[0].pageY : e.originalEvent.pageY);

            if ((Math.abs(diffX) > 10) || (Math.abs(diffY) > 10)) {
                if ((Math.abs(diffY) > Math.abs(diffX)) && $('section[data-hma="0"]>.sub-section').length) {
                    var destinationY = 0;

                    var directionY = 0;
                    if (diffY > threshold) {
                        directionY = 1;
                    } else if (diffY < -threshold) {
                        directionY = -1;
                    }

                    var newCurrentY = $('section[data-hma="0"]>.sub-section[data-hma-sub="0"]');
                    if ($('section[data-hma="0"]>.sub-section[data-hma-sub="' + directionY + '"]').length) {
                        destinationY = height * directionY * -1;
                        newCurrentY = $('section[data-hma="0"]>.sub-section[data-hma-sub="' + directionY + '"]');
                    }

                    if (!animating) {
                        animating = true;
                        $('section[data-hma="0"]>.sub-section[data-hma-sub]').animate({
                            'margin-top': destinationY
                        }, 200, function(){
                            animating = false;
                            $(this).css('margin-top', 0);
                            selectCurrentSub(newCurrentY);
                        });
                    }
                } else {
                    var destinationX = 0;

                    var directionX = 0;
                    if (diffX > threshold) {
                        directionX = 1;
                    } else if (diffX < -threshold) {
                        directionX = -1;
                    }

                    var newCurrent = $('section[data-hma="0"]');
                    if ($('section[data-hma="' + directionX + '"]').length) {
                        destinationX = width * directionX * -1;
                        newCurrent = $('section[data-hma="' + directionX + '"]');
                    }

                    if (!animating) {
                        animating = true;
                        $('section[data-hma]').animate({
                            'margin-left': destinationX
                        }, 200, function(){
                            animating = false;
                            $(this).css('margin-left', 0);
                            selectCurrent(newCurrent);
                        });
                    }
                } 
            }
        });
    
        //stop nav triggering on selection of onscreen items
        $('a, video, audio, button').bind('touchend', function(e){
            e.stopPropagation();
        })
        //display nav on tap
        $('body').bind('touchend', function(e) {
            if (!swiping) {
                if ($nav.hasClass('open')) {
                    $nav.removeClass('open').fadeOut(300);
                } else {
                    $nav.addClass('open').fadeIn(300);
                }
            }
        });
        
        var $btn = $nav.find('.btn-pg-selector');
        $btn.bind('touchstart mousedown', function(e){
            e.preventDefault();
            e.stopPropagation();

            $(this).addClass('draggable');
        });
        $btn.bind('touchmove mousemove', function(e){
            e.preventDefault();
            e.stopPropagation();

            var x = e.originalEvent.touches[0].pageX || e.originalEvent.pageX;
            if (x < 10) {
                x = 10;
            } else if (x > (width-$(this).outerWidth()-10)) {
                x = width - $(this).outerWidth() - 10;
            }
            $(this).css({
                left: x
            });

            var completion = Math.floor(x/width * numPages);
            selectCurrent($magEl.find('section:eq(' + completion + ')'));
        });
        $btn.bind('touchend mouseup', function(e){
            e.preventDefault();
            e.stopPropagation();

            $(this).removeClass('draggable');
        });

        $nav.find('.btn-home').click(function(e){
            e.preventDefault();
            selectCurrent($magEl.find('section:first'));
        });
        

        //disable rubber-band
        $('body').bind('touchmove', function(e){
            e.preventDefault();
        });

        //handle anchors
        $('a[href^="#"]').click(function(e){
            e.preventDefault();
            //window.location.hash = this.hash; //for some reason this bugs and causes page to display the wrong thing (even though the CSS & HTML is all correct, the browser displays it wrong - bug). Remove for now (pages will not be bookmarkable)
            if (this.hash.length > 1) {
                selectCurrent($magEl.children(this.hash)[0]);
            }
        });

        //disable dragging images
        $('img').bind('touchmove mousemove', function(e){
            e.preventDefault();
        });
    };

    function initPages(el) {

        $(window).resize(function(){
            width = $(window).width();
            height = $(window).height();
            
            $magEl.css({
                width: width,
                height: height
            }).find('section').css({
                width: width,
                height: height
            });

            $magEl.children('section').each(function(i){
                $(this).children('.sub-section').css({
                    width: width,
                    height: height
                });
            });
        }).resize();

        //check rotation notices
        $(window).on("orientationchange",function(e){
            $('.orientation-notice').hide();

            if (typeof window.orientation == "number") {
                var orientation = "portrait";
                if (Math.abs(window.orientation) == 90) {
                    orientation = "landscape";
                }
                var $notice = $('.orientation-notice.' + orientation);
                console.log($notice);
                if ($notice.length) {
                    $notice.show();
                }
            }
        }).trigger('orientationchange');

        //set navigation functionality
        $nav = $magEl.find('.navigation');
        $nav.hide();

        //select onload slide
        if (window.location.hash && $magEl.children(window.location.hash).size()) {
            selectCurrent($magEl.children(window.location.hash));
        } else {
            selectCurrent($magEl.children('section:first'));
        }
        selectCurrentSub($magEl.children('section').children('.sub-section:first-child'));
    }

    function selectCurrent(el) {
        $this = $(el);
        if ($this.length) {
            $('[data-hma]').removeAttr('data-hma');
            $this.attr('data-hma',0);
            $this.prev().attr('data-hma',-1);
            $this.next().attr('data-hma',1);
        }
    }
    function selectCurrentSub(el) {
        $this = $(el);
        if ($this.length) {
            $this.siblings().removeAttr('data-hma-sub');
            $this.attr('data-hma-sub',0);
            $this.prev().attr('data-hma-sub',-1);
            $this.next().attr('data-hma-sub',1);
        }
    }
})(jQuery);