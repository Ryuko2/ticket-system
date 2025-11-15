// ============================================
// LOADING ANIMATION WITH ANIME.JS
// Beautiful logo animation on page load
// ============================================

function fitElementToParent(el, padding, exception) {
    var timeout = null;
    function resize() {
        if (timeout) clearTimeout(timeout);
        if (typeof anime !== 'undefined') {
            anime.set(el, {scale: 1});
            if (exception) anime.set(exception, {scale: 1});
        }
        var pad = padding || 0;
        var parentEl = el.parentNode;
        var elOffsetWidth = el.offsetWidth - pad;
        var parentOffsetWidth = parentEl.offsetWidth;
        var ratio = parentOffsetWidth / elOffsetWidth;
        var invertedRatio = elOffsetWidth / parentOffsetWidth;
        timeout = setTimeout(function() {
            if (typeof anime !== 'undefined') {
                anime.set(el, {scale: ratio});
                if (exception) anime.set(exception, {scale: invertedRatio});
            }
        }, 10);
    }
    resize();
    window.addEventListener('resize', resize);
}

function initLogoAnimation() {
    // Check if anime.js is loaded
    if (typeof anime === 'undefined') {
        console.error('anime.js not loaded');
        return;
    }

    var logoAnimationEl = document.querySelector('.logo-animation');
    if (!logoAnimationEl) return;

    var bouncePath = anime.path('.bounce path');

    fitElementToParent(logoAnimationEl, 0, '.bounce svg');

    // Set initial positions for LJ SERVICES letters
    anime.set(['.letter-s', '.letter-e', '.letter-r', '.letter-v', '.letter-i', '.letter-c', '.letter-e2', '.letter-s2'], {translateX: 100, opacity: 0});
    anime.set('.dot', { translateX: 630, translateY: -200 });

    var logoAnimationTL = anime.timeline({
        autoplay: false,
        easing: 'easeOutSine'
    })
    .add({
        targets: '.letter-i .line',
        duration: 0,
        begin: function(a) { 
            if (a.animatables[0]) {
                a.animatables[0].target.removeAttribute('stroke-dasharray'); 
            }
        }
    }, 0)
    .add({
        targets: '.bounced',
        transformOrigin: ['50% 100% 0px', '50% 100% 0px'],
        translateY: [
            {value: [150, -160], duration: 190, endDelay: 20, easing: 'cubicBezier(0.225, 1, 0.915, 0.980)'},
            {value: 4, duration: 120, easing: 'easeInQuad'},
            {value: 0, duration: 120, easing: 'easeOutQuad'}
        ],
        scaleX: [
            {value: [.25, .85], duration: 190, easing: 'easeOutQuad'},
            {value: 1.08, duration: 120, delay: 85, easing: 'easeInOutSine'},
            {value: 1, duration: 260, delay: 25, easing: 'easeOutQuad'}
        ],
        scaleY: [
            {value: [.3, .8], duration: 120, easing: 'easeOutSine'},
            {value: .35, duration: 120, delay: 180, easing: 'easeInOutSine'},
            {value: .57, duration: 180, delay: 25, easing: 'easeOutQuad'},
            {value: .5, duration: 190, delay: 15, easing: 'easeOutQuad'}
        ],
        delay: anime.stagger(80)
    }, 1000)
    .add({
        targets: '.dot',
        opacity: { value: 1, duration: 100 },
        translateY: 250,
        scaleY: [4, .7],
        scaleX: { value: 1.3, delay: 100, duration: 200},
        duration: 280,
        easing: 'cubicBezier(0.350, 0.560, 0.305, 1)'
    }, '-=290')
    .add({
        targets: '.letter-m .line',
        easing: 'easeOutElastic(1, .8)',
        duration: 600,
        d: function(el) { return el.dataset.d2 },
        begin: function(a) { a.animatables[0].target.removeAttribute('stroke-dasharray'); }
    }, '-=140')
    .add({
        targets: ['.letter-s', '.letter-e', '.letter-r', '.letter-v', '.letter-i', '.letter-c', '.letter-e2', '.letter-s2'],
        translateX: 0,
        opacity: 1,
        easing: 'easeOutElastic(1, .6)',
        duration: 800,
        delay: anime.stagger(40, {from: 'center'}),
        change: function(a) { 
            if (a.animatables[2]) {
                a.animatables[2].target.removeAttribute('stroke-dasharray'); 
            }
        }
    }, '-=600')
    .add({
        targets: '.letter-m .line',
        d: function(el) { return el.dataset.d3 },
        easing: 'spring(.2, 200, 3, 60)',
    }, '-=680')
    .add({
        targets: '.dot',
        translateX: bouncePath('x'),
        translateY: bouncePath('y'),
        rotate: {value: '1turn', duration: 790},
        scaleX: { value: 1, duration: 50, easing: 'easeOutSine' },
        scaleY: [
            { value: [1, 1.5], duration: 50, easing: 'easeInSine' },
            { value: 1, duration: 50, easing: 'easeOutExpo' }
        ],
        easing: 'cubicBezier(0, .74, 1, .255)',
        duration: 800
    }, '-=1273')
    .add({
        targets: '.dot',
        scale: 1,
        rotate: '1turn',
        scaleY: {value: .5, delay: 0, duration: 150, delay: 230},
        translateX: 430,
        translateY: [
            {value: 244, duration: 100},
            {value: 204, duration: 200, delay: 130},
            {value: 224, duration: 225, easing: 'easeOutQuad', delay: 25}
        ],
        duration: 200,
        easing: 'easeOutSine'
    }, '-=474')
    .add({
        targets: '.letter-i .line',
        transformOrigin: ['50% 100% 0', '50% 100% 0'],
        d: function(el) { return el.dataset.d2 },
        easing: 'cubicBezier(0.400, 0.530, 0.070, 1)',
        duration: 80
    }, '-=670')
    .add({
        targets: '.logo-letter',
        translateY: [
            {value: 40, duration: 150, easing: 'easeOutQuart'},
            {value: 0, duration: 800, easing: 'easeOutElastic(1, .5)'}
        ],
        strokeDashoffset: [anime.setDashoffset, 0],
        delay: anime.stagger(60, {from: 'center'})
    }, '-=670')
    .add({
        targets: '.bounced',
        scaleY: [
            {value: .4, duration: 150, easing: 'easeOutQuart'},
            {value: .5, duration: 800, easing: 'easeOutElastic(1, .5)'}
        ],
        delay: anime.stagger(60, {from: 'center'})
    }, '-=1090');

    // Play animation
    logoAnimationTL.play();

    // Hide loading screen after animation
    setTimeout(function() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(function() {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 3500);
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initLogoAnimation, 100);
    });
} else {
    setTimeout(initLogoAnimation, 100);
}

console.log('✅ Loading animation initialized');
