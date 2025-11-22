// Warte bis das DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM geladen - JavaScript funktioniert');
    
    // Screen navigation
    const screens = document.querySelectorAll('.screen');

    // Show specific screen
    function showScreen(screenId) {
        console.log('Wechsle zu Screen:', screenId);
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        } else {
            console.error('Screen nicht gefunden:', screenId);
        }
    }

    // Start button
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            console.log('Start Button geklickt');
            showScreen('intro-screen');
        });
    } else {
        console.error('Start Button nicht gefunden');
    }

    // Intro button
    const introBtn = document.getElementById('intro-btn');
    if (introBtn) {
        introBtn.addEventListener('click', function() {
            console.log('Intro Button geklickt');
            showScreen('scene-1');
        });
    }

    // Reveal buttons for each scene
    function setupRevealButton(buttonId, nextScreenId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', function() {
                console.log('Reveal Button geklickt:', buttonId);
                // Finde die Interpretation im gleichen Screen
                const scene = this.closest('.screen');
                const interpretation = scene.querySelector('.interpretation');
                if (interpretation) {
                    interpretation.classList.add('revealed');
                    // Deaktiviere den Button nach dem Klick
                    this.disabled = true;
                    this.style.opacity = '0.6';
                    this.textContent = 'Auflösung angezeigt';
                    
                    setTimeout(() => {
                        showScreen(nextScreenId);
                    }, 2000);
                }
            });
        } else {
            console.warn('Button nicht gefunden:', buttonId);
        }
    }

    // Setup all reveal buttons
    setupRevealButton('reveal-1', 'scene-2');
    setupRevealButton('reveal-2', 'scene-3');
    setupRevealButton('reveal-3', 'scene-4');
    setupRevealButton('reveal-4', 'scene-5');
    setupRevealButton('reveal-5', 'reflection-screen');

    // Restart button
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            console.log('Restart Button geklickt');
            // Reset all interpretations
            document.querySelectorAll('.interpretation').forEach(interpretation => {
                interpretation.classList.remove('revealed');
            });
            // Reset all reveal buttons
            document.querySelectorAll('.btn[id^="reveal-"]').forEach(button => {
                button.disabled = false;
                button.style.opacity = '1';
                button.textContent = 'Auflösung zeigen';
            });
            showScreen('start-screen');
        });
    }

    console.log('Alle Event Listener wurden registriert');
    
    // Debug: Zeige alle gefundenen Screens
    console.log('Gefundene Screens:', screens.length);
});