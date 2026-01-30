(function ($) {
    "use strict";

    //Submenu Dropdown Toggle
    if ($('.main-nav__main-navigation li.dropdown ul').length) {
        $('.main-nav__main-navigation li.dropdown').append('<button class="dropdown-btn"><i class="fa fa-angle-right"></i></button>');
    }

    function dynamicCurrentMenuClass(selector) {
        let FileName = window.location.href.split('/').reverse()[0];

        selector.find('li').each(function () {
            let anchor = $(this).find('a');
            if ($(anchor).attr('href') == FileName) {
                $(this).addClass('current');
            }
        });
        // if any li has .current elmnt add class
        selector.children('li').each(function () {
            if ($(this).find('.current').length) {
                $(this).addClass('current');
            }
        });
        // if no file name return 
        if ('' == FileName) {
            selector.find('li').eq(0).addClass('current');
        }
    }

    // mobile menu - encapsulated so it can be re-run after header partials are injected
    function initMobileMenu() {
        // Theme no longer appends mobile nav markup. `partials.js` is the
        // authoritative loader that populates `.mobile-nav__container`.
        // Here we only bind behavior (idempotently), using delegated handlers
        // so bindings work whether the markup is present now or injected later.
        if (!$('.mobile-nav__container').length) return;

        var mobileNavContainer = $('.mobile-nav__container');

        // delegated dropdown button handler for mobile nav
        $(document).off('click.mobileDropdown').on('click.mobileDropdown', '.mobile-nav__container li.dropdown .dropdown-btn', function (e) {
            var $btn = $(this);
            $btn.toggleClass('open');
            var $ul = $btn.closest('li.dropdown').find('ul').first();
            if ($ul.length) {
                $ul.slideToggle(500);
            }
            e.preventDefault();
        });

        // dynamic current class        
        let mainNavUL = $('.main-nav__main-navigation').find('.main-nav__navigation-box');
        let mobileNavUL = mobileNavContainer.find('.main-nav__navigation-box');

        dynamicCurrentMenuClass(mainNavUL);
        dynamicCurrentMenuClass(mobileNavUL);
    }

    // run once at load
    initMobileMenu();
    // run again after partials (header) are injected
    document.addEventListener('partialsLoaded', initMobileMenu);


    if ($('.mc-form').length) {
        var mcURL = $('.mc-form').data('url');
        $('.mc-form').ajaxChimp({
            url: mcURL,
            callback: function (resp) {
                // appending response
                $('.mc-form__response').append(function () {
                    return '<p class="mc-message">' + resp.msg + '</p>';
                })
                // making things based on response
                if (resp.result === 'success') {
                    // Do stuff
                    $('.mc-form').removeClass('errored').addClass('successed');
                    $('.mc-form__response').removeClass('errored').addClass('successed');
                    $('.mc-form').find('input').val('');

                    $('.mc-form__response p').fadeOut(10000);

                }
                if (resp.result === 'error') {
                    $('.mc-form').removeClass('successed').addClass('errored');
                    $('.mc-form__response').removeClass('successed').addClass('errored');
                    $('.mc-form').find('input').val('');

                    $('.mc-form__response p').fadeOut(10000);

                }
            }
        });

    }




    if ($('.datepicker').length) {
        $('.datepicker').datepicker();
    }


    if ($('.plan-visit__tab-links').length) {
        var planVisitLink = $('.plan-visit__tab-links').find('.nav-link');
        planVisitLink.on('click', function (e) {
            var target = $(this).attr('data-target');
            // animate
            $('html, body').animate({
                scrollTop: $(target).offset().top - 50
            }, 1000);


            planVisitLink.removeClass('active');
            $(this).addClass('active');

            return false;
        })
    }

    if ($('.contact-form-validated').length) {
        $('.contact-form-validated').validate({ // initialize the plugin
            rules: {
                fname: {
                    required: true
                },
                lname: {
                    required: true
                },
                name: {
                    required: true
                },
                email: {
                    required: true,
                    email: true
                },
                service: {
                    required: true
                },
                message: {
                    required: true
                },
                subject: {
                    required: true
                }
            },
            submitHandler: function (form) {
                // sending value with ajax request
                $.post($(form).attr('action'), $(form).serialize(), function (response) {
                    $(form).parent().find('.result').append(response);
                    $(form).find('input[type="text"]').val('');
                    $(form).find('input[type="email"]').val('');
                    $(form).find('textarea').val('');
                });
                return false;
            }
        });
    }
    if ($('.counter').length) {
        $('.counter').counterUp({
            delay: 10,
            time: 3000
        });
    }
    if ($('.img-popup').length) {
        var groups = {};
        $('.img-popup').each(function () {
            var id = parseInt($(this).attr('data-group'), 10);

            if (!groups[id]) {
                groups[id] = [];
            }

            groups[id].push(this);
        });


        $.each(groups, function () {

            $(this).magnificPopup({
                type: 'image',
                closeOnContentClick: true,
                closeBtnInside: false,
                gallery: {
                    enabled: true
                }
            });

        });

    };
    if ($('.wow').length) {
        var wow = new WOW({
            boxClass: 'wow', // animated element css class (default is wow)
            animateClass: 'animated', // animation css class (default is animated)

            mobile: true, // trigger animations on mobile devices (default is true)
            live: true // act on asynchronously loaded content (default is true)
        });
        wow.init();
    }

    if ($('.video-popup').length) {
        $('.video-popup').magnificPopup({
            // always enable the popup (do not disable on small viewports)
            disableOn: false,
            type: 'iframe',
            mainClass: 'mfp-fade',
            removalDelay: 160,
            preloader: true,

            fixedContentPos: false
        });
        // Add a fallback: if the popup doesn't open (e.g. blocked), open the video in a new tab
        $(document).on('click', '.video-popup', function (e) {
            var href = $(this).attr('href');
            // start a timer; if Magnific Popup doesn't open within this time, open in new tab
            var fallbackTimer = setTimeout(function () {
                if ($('.mfp-container').length === 0) {
                    window.open(href, '_blank');
                }
            }, 800);

            // when Magnific Popup opens, it triggers the 'mfpOpen' event on document
            // clear the fallback timer so we don't open the new tab
            $(document).one('mfpOpen', function () {
                clearTimeout(fallbackTimer);
            });
        });
    }
    if ($('[data-toggle="tooltip"]').length) {
        $('[data-toggle="tooltip"]').tooltip();
    }
    if ($('.stricky').length) {
        $('.stricky').addClass('original').clone(true).insertAfter('.stricky').addClass('stricked-menu').removeClass('original');
    }
    if ($('.scroll-to-target').length) {
        $(".scroll-to-target").on('click', function () {
            var target = $(this).attr('data-target');
            // animate
            $('html, body').animate({
                scrollTop: $(target).offset().top
            }, 1000);

            return false;

        });
    }

    // delegated side-menu handlers: robust for dynamically-injected header markup
    // use namespaced delegated events so handlers work even when elements are added later
    $(document).off('click.sideMenu').on('click.sideMenu', '.side-menu__toggler', function (e) {
        // toggle the side menu
        var sideMenu = document.querySelector('.side-menu__block');
        if (sideMenu) {
            sideMenu.classList.toggle('active');
                // toggled side-menu; no debug logging
        } else {
            // side-menu element not found
        }
        e.preventDefault();
    });

    $(document).off('click.sideMenuOverlay').on('click.sideMenuOverlay', '.side-menu__block-overlay', function (e) {
        var sideMenu = document.querySelector('.side-menu__block');
        if (sideMenu) {
            sideMenu.classList.remove('active');
                // removed side-menu active class; no debug logging
        }
        e.preventDefault();
    });


    if ($('.search-popup__toggler').length) {
        $('.search-popup__toggler').on('click', function (e) {
            $('.search-popup').addClass('active');
            e.preventDefault();
        });
    }

    if ($('.search-popup__overlay').length) {
        $('.search-popup__overlay').on('click', function (e) {
            $('.search-popup').removeClass('active');
            e.preventDefault();
        });
    }
    $(window).on('scroll', function () {
        if ($('.scroll-to-top').length) {
            var strickyScrollPos = 100;
            if ($(window).scrollTop() > strickyScrollPos) {
                $('.scroll-to-top').fadeIn(500);
            } else if ($(this).scrollTop() <= strickyScrollPos) {
                $('.scroll-to-top').fadeOut(500);
            }
        }
        if ($('.stricked-menu').length) {
            var headerScrollPos = 100;
            var stricky = $('.stricked-menu');
            if ($(window).scrollTop() > headerScrollPos) {
                stricky.addClass('stricky-fixed');
            } else if ($(this).scrollTop() <= headerScrollPos) {
                stricky.removeClass('stricky-fixed');
            }
        }
    });
    if ($('.accrodion-grp').length) {
        var accrodionGrp = $('.accrodion-grp');
        accrodionGrp.each(function () {
            var accrodionName = $(this).data('grp-name');
            var Self = $(this);
            var accordion = Self.find('.accrodion');
            Self.addClass(accrodionName);
            Self.find('.accrodion .accrodion-content').hide();
            Self.find('.accrodion.active').find('.accrodion-content').show();
            accordion.each(function () {
                $(this).find('.accrodion-title').on('click', function () {
                    if ($(this).parent().hasClass('active') === false) {
                        $('.accrodion-grp.' + accrodionName).find('.accrodion').removeClass('active');
                        $('.accrodion-grp.' + accrodionName).find('.accrodion').find('.accrodion-content').slideUp();
                        $(this).parent().addClass('active');
                        $(this).parent().find('.accrodion-content').slideDown();
                    };


                });
            });
        });

    };



    $(window).on('load', function () {


        if ($('.thm__owl-carousel').length) {
            $('.thm__owl-carousel').each(function () {

                var Self = $(this);
                var carouselOptions = Self.data('options');
                var carouselPrevSelector = Self.data('carousel-prev-btn');
                var carouselNextSelector = Self.data('carousel-next-btn');
                var thmCarousel = Self.owlCarousel(carouselOptions);
                if (carouselPrevSelector !== undefined) {
                    $(carouselPrevSelector).on('click', function () {
                        thmCarousel.trigger('prev.owl.carousel', [1000]);
                        return false;
                    });
                }
                if (carouselNextSelector !== undefined) {
                    $(carouselNextSelector).on('click', function () {
                        thmCarousel.trigger('next.owl.carousel', [1000]);
                        return false;
                    });
                }
            });
        }

        // owl dots margin increment
        if ($('.thm__owl-dot-1').length) {
            var count = 10;
            $('.thm__owl-dot-1').find('.owl-dot span').each(function () {
                count += 10;
                $(this).css('left', '+=' + count + 'px');
            });
        }
        if ($('.thm__owl-dot-rtl-1').length) {
            var count = 10;
            $('.thm__owl-dot-rtl-1').find('.owl-dot span').each(function () {
                count += 10;
                $(this).css('right', '+=' + count + 'px');
            });
        }
        if ($('.thm__owl-dot-2').length) {
            var count = 10;
            $('.thm__owl-dot-2').find('.owl-dot span').each(function () {
                count += 10;
                $(this).css('top', '+=' + count + 'px');
            });
        }
        if ($('.preloader').length) {
            $('.preloader').fadeOut('slow');
        }

        if ($('.side-menu__block-inner').length) {
            $('.side-menu__block-inner').mCustomScrollbar({
                axis: 'y',
                theme: 'dark'
            });
        }

        if ($('.custom-cursor__overlay').length) {

            // / cursor /
            var cursor = $(".custom-cursor__overlay .cursor"),
                follower = $(".custom-cursor__overlay .cursor-follower");

            var posX = 0,
                posY = 0;

            var mouseX = 0,
                mouseY = 0;

            TweenMax.to({}, 0.016, {
                repeat: -1,
                onRepeat: function () {
                    posX += (mouseX - posX) / 9;
                    posY += (mouseY - posY) / 9;

                    TweenMax.set(follower, {
                        css: {
                            left: posX - 22,
                            top: posY - 22
                        }
                    });

                    TweenMax.set(cursor, {
                        css: {
                            left: mouseX,
                            top: mouseY
                        }
                    });

                }
            });

            $(document).on("mousemove", function (e) {
                var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                mouseX = e.pageX;
                mouseY = e.pageY - scrollTop;
            });
            $("button, a").on("mouseenter", function () {
                cursor.addClass("active");
                follower.addClass("active");
            });
            $("button, a").on("mouseleave", function () {
                cursor.removeClass("active");
                follower.removeClass("active");
            });
            $(".custom-cursor__overlay").on("mouseenter", function () {
                cursor.addClass("close-cursor");
                follower.addClass("close-cursor");
            });
            $(".custom-cursor__overlay").on("mouseleave", function () {
                cursor.removeClass("close-cursor");
                follower.removeClass("close-cursor");
            });
        }


        if ($('.masonary-layout').length) {
            $('.masonary-layout').isotope({
                layoutMode: 'masonry'
            });
        }

        if ($('.post-filter').length) {
            var postFilterList = $('.post-filter li');
            // for first init
            $('.filter-layout').isotope({
                filter: '.filter-item',
                animationOptions: {
                    duration: 500,
                    easing: 'linear',
                    queue: false
                }
            });
            // on click filter links
            postFilterList.children('span').on('click', function () {
                var Self = $(this);
                var selector = Self.parent().attr('data-filter');
                postFilterList.children('span').parent().removeClass('active');
                Self.parent().addClass('active');


                $('.filter-layout').isotope({
                    filter: selector,
                    animationOptions: {
                        duration: 500,
                        easing: 'linear',
                        queue: false
                    }
                });
                return false;
            });
        }

        if ($('.post-filter.has-dynamic-filter-counter').length) {
            // var allItem = $('.single-filter-item').length;

            var activeFilterItem = $('.post-filter.has-dynamic-filter-counter').find('li');

            activeFilterItem.each(function () {
                var filterElement = $(this).data('filter');
                var count = $('.gallery-content').find(filterElement).length;
                $(this).children('span').append('<span class="count"><b>' + count + '</b></span>');
            });
        }

    });

})(jQuery);

// Promo top bar animation only: the markup is provided by a partial (inc/promo_nav.html).
// This script only wires the marquee behavior and does not insert markup.
(function() {
    var DEFAULT_PROMO = 'Launch promo — Book now and get 10% off!';

    function getPromoTextFromMeta() {
        try {
            var meta = document.querySelector('meta[name="site-promo"]');
            if (meta && meta.content && meta.content.trim()) return meta.content.trim();
        } catch (e) {}
        return DEFAULT_PROMO;
    }

    function initPromo() {
        var track = document.querySelector('.promo-track');
        if (!track) return; // partial not present on this page
        var container = track.parentNode; // promo-inner

        // ensure promo text exists in the span; if empty, populate from meta
        var textSpan = track.querySelector('.promo-text');
        if (!textSpan) {
            textSpan = document.createElement('span');
            textSpan.className = 'promo-text';
            track.appendChild(textSpan);
        }

        // Prefer the (translated) source if present. The partial includes a
        // hidden `.promo-src` element (populated by translateAllElements), so
        // read from it when available. Otherwise fall back to meta/default.
        try {
            // read translated source placed by i18n.js into .promo-src
            var src = container && container.querySelector ? container.querySelector('.promo-src') : null;
            if (src && src.textContent && src.textContent.trim()) {
                textSpan.textContent = src.textContent.trim();
            } else if (!textSpan.textContent || !textSpan.textContent.trim()) {
                textSpan.textContent = getPromoTextFromMeta();
            }
        } catch (e) {
            if (!textSpan.textContent || !textSpan.textContent.trim()) textSpan.textContent = getPromoTextFromMeta();
        }

        // initial evaluation and resize handling
        evaluateMarquee(track);
        var resizeTimer = null;
        window.addEventListener('resize', function() {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() { evaluateMarquee(track); }, 150);
        });
    }

    function evaluateMarquee(track) {
        if (!track) return;
        var container = track.parentNode; // promo-inner
        var textSpan = track.querySelector('.promo-text');
        if (!textSpan) return;

        // reset
        track.classList.remove('promo-marquee', 'animate');
        track.style.setProperty('--marquee-distance', '0px');
        track.style.removeProperty('animation-duration');
        track.innerHTML = '';

        // create a fresh span and measure
        var span = document.createElement('span');
        span.className = 'promo-text';
        span.textContent = textSpan.textContent;
        track.appendChild(span);

        var containerW = container.clientWidth;
        var spanW = span.getBoundingClientRect().width;

        // Always enable marquee (desktop and mobile). To make the loop smooth
        // we append repeated copies of the span until the track is wide enough
        // to scroll comfortably across the visible container.
        track.style.whiteSpace = 'nowrap';
        span.style.display = 'inline-block';

        // add a small padding gap between repeats to avoid cramped loop
        var gap = 48; // px (matches CSS .promo-text padding-right)

        // append at least two copies (original + one clone), then more until
        // track width >= container width * 2 (gives a comfortable continuous loop)
        track.appendChild(span.cloneNode(true));
        var totalW = track.getBoundingClientRect().width;
        var attempt = 0;
        while ((totalW < containerW * 2) && attempt < 10) {
            // append another clone
            track.appendChild(span.cloneNode(true));
            totalW = track.getBoundingClientRect().width;
            attempt++;
        }

        // distance to scroll for one cycle should be the width of a single
        // block (one span + gap). Measure the first child to get that width.
        var firstBlock = track.querySelector('.promo-text');
        var blockW = firstBlock ? firstBlock.getBoundingClientRect().width : (spanW || containerW);
        var distance = blockW + gap;

        var speed = 80; // px per second (tweakable)
        var duration = Math.max(6, Math.round(distance / speed)); // seconds

        track.style.setProperty('--marquee-distance', distance + 'px');
        track.style.animationDuration = duration + 's';
        track.classList.add('promo-marquee');

        // create keyframes if not present and start animation
        ensurePromoKeyframes();
        setTimeout(function() { track.classList.add('animate'); }, 10);
    }

    function ensurePromoKeyframes() {
        var name = 'promo-scroll';
        if (document.getElementById('promo-scroll-keyframes')) return;
        var style = document.createElement('style');
        style.id = 'promo-scroll-keyframes';
        style.innerHTML = "@keyframes " + name + " { from { transform: translateX(0); } to { transform: translateX(calc(-1 * var(--marquee-distance))); } }";
        document.head.appendChild(style);
        var rule = ".promo-track.promo-marquee.animate { animation-name: " + name + "; animation-timing-function: linear; animation-iteration-count: infinite; }\n    .promo-track.promo-marquee { transform: translateX(0); }";
        var s2 = document.createElement('style');
        s2.innerHTML = rule;
        document.head.appendChild(s2);
    }

    // Initialize when DOM ready (partial may already be present), and also after partialsLoaded
    document.addEventListener('DOMContentLoaded', initPromo);
    document.addEventListener('partialsLoaded', initPromo);

    // Re-run initPromo after translations are applied. i18n.js will dispatch
    // a `translationsApplied` event after it runs translateAllElements(). This
    // keeps theme.js agnostic to i18next internals and data-translate.
    document.addEventListener('translationsApplied', initPromo);

})();