(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        initGameCards();
        initKeyboardNavigation();
        initAnimations();
        initSearch();
        console.log('🎮 游戏盒子已加载完成');
    });

    function initGameCards() {
        var cards = document.querySelectorAll('.game-card');
        
        cards.forEach(function(card) {
            if (card.classList.contains('game-card-locked')) {
                card.addEventListener('click', function(e) {
                    e.preventDefault();
                    showComingSoonToast();
                });
            } else {
                card.addEventListener('mouseenter', function() {
                    playHoverSound();
                });
                
                card.addEventListener('click', function() {
                    var gameName = card.getAttribute('data-game');
                    console.log('🎯 正在启动游戏:', gameName);
                });
            }
        });
    }

    function initKeyboardNavigation() {
        var cards = document.querySelectorAll('.game-card:not(.game-card-locked)');
        var currentIndex = -1;

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                return;
            }

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                currentIndex = (currentIndex + 1) % cards.length;
                focusCard(cards[currentIndex]);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                currentIndex = currentIndex <= 0 ? cards.length - 1 : currentIndex - 1;
                focusCard(cards[currentIndex]);
            } else if (e.key === 'Enter' && currentIndex >= 0) {
                e.preventDefault();
                cards[currentIndex].click();
            }
        });
    }

    function focusCard(card) {
        if (!card) return;
        card.focus();
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function initAnimations() {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.game-card, .feature-card').forEach(function(el) {
            observer.observe(el);
        });
    }

    function showComingSoonToast() {
        var existing = document.querySelector('.toast');
        if (existing) {
            existing.remove();
        }

        var toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = '<span>🚧 该游戏正在开发中，敬请期待！</span>';
        toast.style.cssText = '\
            position: fixed;\
            top: 30px;\
            left: 50%;\
            transform: translateX(-50%);\
            background: rgba(0, 0, 0, 0.8);\
            color: white;\
            padding: 15px 30px;\
            border-radius: 30px;\
            font-size: 14px;\
            z-index: 9999;\
            animation: toastIn 0.3s ease, toastOut 0.3s ease 2.7s forwards;\
        ';

        document.body.appendChild(toast);

        setTimeout(function() {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 3000);
    }

    var style = document.createElement('style');
    style.textContent = '\
        @keyframes toastIn {\
            from { opacity: 0; transform: translateX(-50%) translateY(-20px); }\
            to { opacity: 1; transform: translateX(-50%) translateY(0); }\
        }\
        @keyframes toastOut {\
            from { opacity: 1; transform: translateX(-50%) translateY(0); }\
            to { opacity: 0; transform: translateX(-50%) translateY(-20px); }\
        }\
    ';
    document.head.appendChild(style);

    var audioCtx = null;
    function playHoverSound() {
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.1);
        } catch (e) {}
    }

    function initSearch() {
        var searchInput = document.getElementById('game-search');
        var searchClear = document.getElementById('search-clear');
        var noResult = document.getElementById('search-no-result');
        var cards = document.querySelectorAll('.game-card');

        if (!searchInput) return;

        searchInput.addEventListener('input', function() {
            var keyword = searchInput.value.trim().toLowerCase();
            searchClear.classList.toggle('visible', keyword.length > 0);
            filterCards(keyword);
        });

        searchClear.addEventListener('click', function() {
            searchInput.value = '';
            searchClear.classList.remove('visible');
            filterCards('');
            searchInput.focus();
        });

        function filterCards(keyword) {
            var visibleCount = 0;
            cards.forEach(function(card) {
                if (!keyword) {
                    card.style.display = '';
                    visibleCount++;
                    return;
                }
                var title = card.querySelector('.game-title').textContent.toLowerCase();
                var tags = Array.from(card.querySelectorAll('.tag')).map(function(t) {
                    return t.textContent.toLowerCase();
                });
                var desc = card.querySelector('.game-desc').textContent.toLowerCase();
                var match = title.indexOf(keyword) !== -1 ||
                    tags.some(function(tag) { return tag.indexOf(keyword) !== -1; }) ||
                    desc.indexOf(keyword) !== -1;
                card.style.display = match ? '' : 'none';
                if (match) visibleCount++;
            });
            noResult.style.display = (keyword && visibleCount === 0) ? 'block' : 'none';
        }
    }

})();
