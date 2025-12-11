// Warte bis das DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM geladen - JavaScript funktioniert');
    
    // Datenstruktur für gespeicherte Antworten
    let userAnswers = JSON.parse(localStorage.getItem('zwischenDenZeilenAnswers')) || {};
    
    // Screen navigation
    const screens = document.querySelectorAll('.screen');
    
    // Sound-Steuerung
    let soundEnabled = true;
    
    // Funktion zum Abspielen von Sounds mit Fehlerbehandlung
    function playSound(soundId, volume = 0.3) {
        if (!soundEnabled) return;
        
        const sound = document.getElementById(soundId);
        if (sound) {
            try {
                sound.volume = volume;
                sound.currentTime = 0;
                sound.play().catch(e => {
                    console.log("Sound konnte nicht abgespielt werden:", soundId, e);
                });
            } catch (error) {
                console.log("Sound Fehler:", error);
            }
        }
    }
    
    // Sound-Toggle Funktion
    function toggleSound() {
        soundEnabled = !soundEnabled;
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.classList.toggle('muted', !soundEnabled);
        }
        console.log('Sound ist jetzt:', soundEnabled ? 'AN' : 'AUS');
        
        // Visuelles Feedback
        playSound('click-sound', 0.2);
    }
    
    // Sound-Toggle Event Listener
    const soundToggleBtn = document.getElementById('sound-toggle');
    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', toggleSound);
    }

    // Show specific screen
    function showScreen(screenId) {
        console.log('Wechsle zu Screen:', screenId);
        
        // Screen-Übergang Sound
        playSound('screen-transition-sound', 0.2);
        
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            
            if (screenId === 'answers-screen') {
                displayAllAnswers();
            } else if (screenId === 'reflection-screen') {
                updateReflectionStats();
            }
        }
    }

    // Funktion zum Speichern einer Antwort
    function saveAnswer(sceneId, answer) {
        userAnswers[sceneId] = answer;
        localStorage.setItem('zwischenDenZeilenAnswers', JSON.stringify(userAnswers));
        console.log('Antwort gespeichert für', sceneId, ':', answer);
        
        // Erfolgs-Sound beim Speichern
        playSound('submit-sound', 0.4);
    }

    // Funktion zum Anzeigen aller gespeicherten Antworten
    function displayAllAnswers() {
        const container = document.getElementById('all-answers');
        const answersTotalElement = document.getElementById('answers-total');
        const answersCompletedElement = document.getElementById('answers-completed');
        
        if (container) {
            container.innerHTML = '';
            
            let answerCount = 0;
            let completedScenes = 0;
            
            for (let i = 1; i <= 5; i++) {
                const sceneId = `scene-${i}`;
                const answer = userAnswers[sceneId];
                
                const answerItem = document.createElement('div');
                answerItem.className = 'answer-item fade-in';
                
                if (answer && answer.trim() !== '') {
                    answerCount++;
                    completedScenes++;
                    
                    answerItem.innerHTML = `
                        <div class="answer-scene">Szene ${i}:</div>
                        <div class="answer-text">"${answer}"</div>
                    `;
                } else {
                    answerItem.innerHTML = `
                        <div class="answer-scene">Szene ${i}:</div>
                        <div class="answer-text" style="color: #999; font-style: italic;">Keine Interpretation gespeichert</div>
                    `;
                }
                
                container.appendChild(answerItem);
            }
            
            if (answersTotalElement) {
                answersTotalElement.textContent = answerCount;
            }
            
            if (answersCompletedElement) {
                answersCompletedElement.textContent = completedScenes;
            }
            
            if (answerCount === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">Noch keine Interpretationen gespeichert.</p>';
            }
        }
    }

    // Funktion zum Aktualisieren der Statistiken auf der Reflexionsseite
    function updateReflectionStats() {
        const totalAnswersElement = document.getElementById('total-answers');
        
        if (totalAnswersElement) {
            let answerCount = 0;
            
            for (let i = 1; i <= 5; i++) {
                const sceneId = `scene-${i}`;
                const answer = userAnswers[sceneId];
                
                if (answer && answer.trim() !== '') {
                    answerCount++;
                }
            }
            
            totalAnswersElement.textContent = answerCount;
        }
    }

    // Einfache Reset-Funktion für jede Szene
    function resetScene(sceneNumber) {
        console.log(`Resette Szene ${sceneNumber}`);
        
        // Reset-Sound
        playSound('click-sound', 0.3);
        
        // Textarea zurücksetzen
        const textarea = document.getElementById(`input-${sceneNumber}`);
        if (textarea) {
            textarea.value = '';
            textarea.disabled = false;
        }
        
        // Submit-Button zurücksetzen
        const submitBtn = document.getElementById(`submit-${sceneNumber}`);
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Interpretation abschicken';
        }
        
        // Lösungstext verstecken
        const solutionText = document.getElementById(`solution-text-${sceneNumber}`);
        if (solutionText) {
            solutionText.classList.remove("visible");
        }
        
        // Lösungsbild verstecken
        const solutionImage = document.querySelector(`#scene-${sceneNumber} .solution-image`);
        if (solutionImage) {
            solutionImage.classList.remove('revealed');
            solutionImage.style.opacity = '0';
            solutionImage.style.filter = 'brightness(1) contrast(1)';
        }
        
        // Canvas zurücksetzen
        const canvas = document.getElementById(`scratch-${sceneNumber}`);
        if (canvas) {
            const ctx = canvas.getContext("2d");
            const startImages = {
                1: 'images/ausgangsbild_1.jpg',
                2: 'images/ausgangsbild_2.jpg', 
                3: 'images/ausgangsbild_3.jpg',
                4: 'images/ausgangsbild_4.jpg',
                5: 'images/ausgangsbild_5.jpg'
            };
            
            // Canvas neu initialisieren
            const container = canvas.parentElement;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            
            const backgroundImage = new Image();
            backgroundImage.src = startImages[sceneNumber];
            
            backgroundImage.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = "source-over";
                canvas.style.cursor = "not-allowed";
                canvas.style.opacity = "0.7";
                canvas.classList.remove('particles-fading');
            };
            
            backgroundImage.onerror = function() {
                // Fallback falls Bild nicht geladen werden kann
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#f0f0f0";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#666";
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(`Bild ${sceneNumber}`, canvas.width / 2, canvas.height / 2);
                canvas.style.cursor = "not-allowed";
                canvas.style.opacity = "0.7";
                canvas.classList.remove('particles-fading');
            };
        }
        
        console.log(`Szene ${sceneNumber} zurückgesetzt`);
    }

    // Start button
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            playSound('click-sound', 0.3);
            showScreen('intro-screen');
        });
    }

    // Intro button
    const introBtn = document.getElementById('intro-btn');
    if (introBtn) {
        introBtn.addEventListener('click', function() {
            playSound('click-sound', 0.3);
            showScreen('scene-1');
        });
    }

    // Particle animation system
    class ParticleSystem {
        constructor(canvas, x, y) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.particles = [];
            this.x = x;
            this.y = y;
            this.maxParticles = 8;
            this.createParticles();
        }

        createParticles() {
            const colors = [
                'rgba(120, 120, 120, 0.9)',    // Dunkleres Grau
                'rgba(150, 150, 150, 0.8)',    // Mittleres Grau
                'rgba(180, 180, 180, 0.7)',    // Helles Grau
                'rgba(200, 200, 200, 0.6)'     // Sehr helles Grau
            ];

            for (let i = 0; i < this.maxParticles; i++) {
                this.particles.push({
                    x: this.x,
                    y: this.y,
                    size: Math.random() * 4 + 2,
                    speedX: (Math.random() - 0.5) * 8,
                    speedY: (Math.random() - 0.5) * 8,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: 1,
                    decay: Math.random() * 0.03 + 0.02
                });
            }
        }

        update() {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.speedX;
                p.y += p.speedY;
                p.life -= p.decay;
                p.size *= 0.97;

                if (p.life <= 0) {
                    this.particles.splice(i, 1);
                }
            }
        }

        draw() {
            for (const p of this.particles) {
                this.ctx.save();
                this.ctx.globalAlpha = p.life;
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Optional: Grauen Glanz hinzufügen
                this.ctx.shadowColor = 'rgba(200, 200, 200, 0.3)';
                this.ctx.shadowBlur = 3;
                this.ctx.restore();
            }
        }

        isDone() {
            return this.particles.length === 0;
        }
    }

    // Scratch-Funktionalität für jede Szene
    function setupScratchScene(sceneNumber) {
        const canvas = document.getElementById(`scratch-${sceneNumber}`);
        const solutionImage = canvas.parentElement.querySelector('.solution-image');
        const solutionText = document.getElementById(`solution-text-${sceneNumber}`);
        const submitBtn = document.getElementById(`submit-${sceneNumber}`);
        const textarea = document.getElementById(`input-${sceneNumber}`);
        const sceneId = `scene-${sceneNumber}`;
        
        if (!canvas) {
            console.error(`Canvas für Szene ${sceneNumber} nicht gefunden`);
            return;
        }
        
        const ctx = canvas.getContext("2d");
        
        // Definiere verschiedene Ausgangsbilder für jede Szene
        const startImages = {
            1: 'images/ausgangsbild_1.jpg',
            2: 'images/ausgangsbild_2.jpg', 
            3: 'images/ausgangsbild_3.jpg',
            4: 'images/ausgangsbild_4.jpg',
            5: 'images/ausgangsbild_5.jpg'
        };
        
        let isRevealed = false;
        let backgroundImageLoaded = false;
        let backgroundImage = new Image();
        let scratchingEnabled = false;
        let particleSystems = [];
        let lastParticleTime = 0;
        const particleInterval = 50; // ms between particle bursts
        
        // Rubbel Sound Variablen
        let scratchSound = document.getElementById('scratch-sound');
        let lastSoundTime = 0;
        const soundInterval = 150; // Mindestabstand zwischen Sound-Auslösungen in ms
        
        // Für Geschwindigkeitsberechnung
        let lastX = null;
        let lastY = null;
        
        // Canvas Größe setzen und Ausgangsbild laden
        function initCanvas() {
            console.log(`Initialisiere Canvas für Szene ${sceneNumber}`);
            
            const container = canvas.parentElement;
            
            // Explizite Größen setzen
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            
            console.log(`Canvas Größe Szene ${sceneNumber}:`, canvas.width, canvas.height);
            
            // Ausgangsbild auf Canvas zeichnen
            backgroundImage = new Image();
            backgroundImage.src = startImages[sceneNumber];
            
            backgroundImage.onload = function() {
                console.log(`Ausgangsbild ${sceneNumber} erfolgreich geladen`);
                
                // Canvas komplett leeren
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Bild an Canvas-Größe anpassen und komplett füllen
                ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
                
                // Rubbel-Modus zurücksetzen
                ctx.globalCompositeOperation = "source-over";
                backgroundImageLoaded = true;
                
                // Deaktiviere Rubbeln initial
                updateScratchStatus();
                console.log(`Canvas ${sceneNumber} initialisiert - Ausgangsbild angezeigt`);
            };
            
            backgroundImage.onerror = function() {
                console.error(`Bild konnte nicht geladen werden: ${startImages[sceneNumber]}`);
                // Fallback
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#ffcccc";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#cc0000";
                ctx.font = "14px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(`Bild nicht gefunden`, canvas.width / 2, canvas.height / 2);
                backgroundImageLoaded = true;
                
                updateScratchStatus();
            };
        }
        
        // Funktion zum Aktualisieren des Rubbel-Status
        function updateScratchStatus() {
            if (scratchingEnabled) {
                canvas.style.cursor = "grab";
                canvas.style.opacity = "1";
                console.log(`Rubbeln AKTIVIERT für Szene ${sceneNumber}`);
            } else {
                canvas.style.cursor = "not-allowed";
                canvas.style.opacity = "0.7";
                console.log(`Rubbeln DEAKTIVIERT für Szene ${sceneNumber}`);
            }
        }
        
        // Animation für Partikel-Effekte
        function animateParticles() {
            if (particleSystems.length === 0) return;
            
            // Temporär auf normalen Modus wechseln um Partikel zu zeichnen
            ctx.globalCompositeOperation = "source-over";
            
            // Update und draw particles
            for (let i = particleSystems.length - 1; i >= 0; i--) {
                const system = particleSystems[i];
                system.update();
                system.draw();
                
                if (system.isDone()) {
                    particleSystems.splice(i, 1);
                }
            }
            
            // Zurück zum Rubbeleffekt
            ctx.globalCompositeOperation = "destination-out";
        }
        
        // Initialisiere Canvas
        setTimeout(initCanvas, 100);
        
        let scratching = false;
        let lastCheckTime = 0;
        
        // Event Listeners für Maus
        canvas.addEventListener("mousedown", function(e) {
            if (!scratchingEnabled) {
                e.preventDefault();
                return;
            }
            scratching = true;
            canvas.style.cursor = "grabbing";
            
            // Optional: Sound vorbereiten für sofortiges Abspielen
            if (scratchSound) {
                scratchSound.currentTime = 0;
            }
        });
        
        canvas.addEventListener("mouseup", function() {
            scratching = false;
            updateScratchStatus();
        });
        
        canvas.addEventListener("mouseleave", function() {
            scratching = false;
            updateScratchStatus();
        });
        
        // Event Listeners für Touch
        canvas.addEventListener("touchstart", function(e) {
            if (!scratchingEnabled) {
                e.preventDefault();
                return;
            }
            scratching = true;
            e.preventDefault();
            
            // Optional: Sound vorbereiten für sofortiges Abspielen
            if (scratchSound) {
                scratchSound.currentTime = 0;
            }
        });
        
        canvas.addEventListener("touchend", function() {
            scratching = false;
        });
        
        canvas.addEventListener("touchcancel", function() {
            scratching = false;
        });
        
        canvas.addEventListener("mousemove", scratch);
        canvas.addEventListener("touchmove", scratch);
        
        function scratch(e) {
            if (!scratching || !scratchingEnabled || !backgroundImageLoaded) {
                return;
            }
            
            const rect = canvas.getBoundingClientRect();
            let x, y;
            
            if (e.type.includes('touch')) {
                x = e.touches[0].clientX - rect.left;
                y = e.touches[0].clientY - rect.top;
                e.preventDefault();
            } else {
                x = e.clientX - rect.left;
                y = e.clientY - rect.top;
            }
            
            // Koordinaten begrenzen
            x = Math.max(0, Math.min(x, canvas.width));
            y = Math.max(0, Math.min(y, canvas.height));
            
            // Rubbel-Sound mit variablem Volume basierend auf Geschwindigkeit
            const currentTime = Date.now();
            if (scratchSound && currentTime - lastSoundTime > soundInterval) {
                // Lautstärke basierend auf Rubbelgeschwindigkeit variieren
                let volume = 0.25;
                if (lastX && lastY) {
                    const distance = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
                    volume = Math.min(0.5, 0.25 + (distance / 100));
                }
                
                scratchSound.volume = volume;
                scratchSound.currentTime = 0;
                scratchSound.play().catch(e => console.log("Rubbel-Sound konnte nicht abgespielt werden:", e));
                lastSoundTime = currentTime;
            }
            
            // Rubbel-Effekt
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.fill();
            
            // Partikel-Effekt
            const now = Date.now();
            if (now - lastParticleTime > particleInterval) {
                particleSystems.push(new ParticleSystem(canvas, x, y));
                lastParticleTime = now;
            }
            
            // Lösungsbild sichtbar machen
            updateSolutionVisibility(x, y);
            
            // Fortschritt überprüfen
            const currentCheckTime = Date.now();
            if (currentCheckTime - lastCheckTime > 500) {
                checkRevealProgress();
                lastCheckTime = currentCheckTime;
            }
            
            // Partikel animieren
            requestAnimationFrame(animateParticles);
            
            // Letzte Position für Geschwindigkeitsberechnung speichern
            lastX = x;
            lastY = y;
        }
        
        function updateSolutionVisibility(x, y) {
            if (!solutionImage || isRevealed) return;
            
            try {
                // Berechne wie viel vom Bild bereits aufgedeckt ist
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;
                let transparentPixels = 0;
                let totalPixels = 0;
                
                for (let i = 3; i < pixels.length; i += 4) {
                    totalPixels++;
                    if (pixels[i] < 50) {
                        transparentPixels++;
                    }
                }
                
                const ratio = transparentPixels / totalPixels;
                
                // Progressiver Übergang mit Animationen
                const progress = Math.min(ratio * 2, 1);
                
                // Glatte Opacity-Änderung
                solutionImage.style.opacity = progress;
                
                // Progressive Helligkeit und Kontrast-Anpassung
                // Am Anfang dunkler/unscharf, wird klarer je mehr man rubbelt
                const brightness = 0.7 + (progress * 0.3); // 0.7 bis 1.0
                const contrast = 0.8 + (progress * 0.4);   // 0.8 bis 1.2
                const blur = Math.max(0, 3 - (progress * 3)); // 3px bis 0px
                
                solutionImage.style.filter = `
                    brightness(${brightness})
                    contrast(${contrast})
                    blur(${blur}px)
                `;
                
                // Sanfte Puls-Animation beim Rubbeln
                if (scratching && progress < 1) {
                    const pulseIntensity = 0.05 * Math.sin(Date.now() * 0.01);
                    solutionImage.style.transform = `scale(${1 + pulseIntensity})`;
                } else {
                    solutionImage.style.transform = 'scale(1)';
                }
                
                // NEU: Wenn mehr als 90% ausgerubbelt sind, Partikel ausblenden
                if (ratio > 0.9 && particleSystems.length > 0) {
                    fadeOutParticles();
                }
                
            } catch (error) {
                console.error('Fehler beim Aktualisieren der Sichtbarkeit:', error);
            }
        }
        
        function fadeOutParticles() {
            // Nur wenn Partikel vorhanden sind
            if (particleSystems.length === 0) return;
            
            console.log(`Partikel für Szene ${sceneNumber} werden ausgeblendet (>90% gerubbelt)`);
            
            // Alle Partikel-Effekte ausblenden
            setTimeout(() => {
                // CSS-Klasse für Fade-Out hinzufügen
                if (canvas) {
                    canvas.classList.add('particles-fading');
                }
                
                // Alle Partikel-Systeme entfernen
                particleSystems = [];
                
                // Eventuell noch vorhandene Partikel ausblenden
                setTimeout(() => {
                    // Canvas neu zeichnen, um alle Partikel zu entfernen
                    if (backgroundImageLoaded) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.globalCompositeOperation = "source-over";
                        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
                        // Zurück zum Rubbel-Modus für verbleibende Bereiche
                        ctx.globalCompositeOperation = "destination-out";
                    }
                }, 1000);
            }, 300); // Kurze Verzögerung, damit die letzten Partikel noch sichtbar sind
        }
        
        function checkRevealProgress() {
            if (isRevealed || !backgroundImageLoaded || !scratchingEnabled) return;
            
            try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;
                let transparentPixels = 0;
                let totalPixels = 0;
                
                for (let i = 3; i < pixels.length; i += 4) {
                    totalPixels++;
                    if (pixels[i] < 50) {
                        transparentPixels++;
                    }
                }
                
                const ratio = transparentPixels / totalPixels;
                
                console.log(`Szene ${sceneNumber}: ${Math.round(ratio * 100)}% aufgedeckt`);
                
                // Wenn genug aufgedeckt ist (90%)
                if (ratio > 0.9) {
                    revealSolution();
                }
            } catch (error) {
                console.error('Fehler beim Überprüfen:', error);
                revealSolution();
            }
        }
        
        function revealSolution() {
            if (isRevealed) return;
            
            isRevealed = true;
            console.log(`Lösung für Szene ${sceneNumber} wird angezeigt`);
            
            // Aha-Moment Sound
            playSound('reveal-sound', 0.4);
            
            // Finale Animation für das Lösungsbild
            if (solutionImage) {
                solutionImage.classList.add('revealed');
                
                // Glatte Endanimation
                const startTime = Date.now();
                const duration = 800; // ms
                
                function animateFinalReveal() {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Easing-Funktion für natürliche Bewegung
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    
                    solutionImage.style.opacity = easeOut;
                    solutionImage.style.filter = `
                        brightness(${0.7 + (easeOut * 0.3)})
                        contrast(${0.8 + (easeOut * 0.4)})
                        blur(${Math.max(0, 3 - (easeOut * 3))}px)
                    `;
                    
                    if (progress < 1) {
                        requestAnimationFrame(animateFinalReveal);
                    } else {
                        // Endzustand
                        solutionImage.style.opacity = '1';
                        solutionImage.style.filter = 'brightness(1) contrast(1.2) blur(0)';
                        solutionImage.style.transform = 'scale(1)';
                    }
                }
                
                animateFinalReveal();
            }
            
            // Zeige Lösungstext an
            if (solutionText) {
                solutionText.classList.add("visible");
            }
            
            // Wenn noch nicht geschehen, Partikel ausblenden (falls >90% noch nicht erreicht)
            if (particleSystems.length > 0) {
                fadeOutParticles();
            }
            
            // Erstelle einen abschließenden Partikel-Effekt
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                
                // Großer Partikel-Effekt in der Mitte
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        particleSystems.push(new ParticleSystem(canvas, centerX, centerY));
                    }, i * 100);
                }
            }
        }
        
        // Setup für die Texteingabe
        if (submitBtn && textarea) {
            // Sound für Textarea-Eingabe
            let typingTimer;
            let lastTypedTime = 0;
            const typeDelay = 300; // ms zwischen Type-Sounds
            
            textarea.addEventListener('input', function() {
                const hasText = this.value.trim().length > 0;
                submitBtn.disabled = !hasText;
                
                // Type-Sound mit Verzögerung
                const currentTime = Date.now();
                if (currentTime - lastTypedTime > typeDelay) {
                    playSound('type-sound', 0.1);
                    lastTypedTime = currentTime;
                }
                
                clearTimeout(typingTimer);
                typingTimer = setTimeout(() => {
                    // Reset typing timer
                }, typeDelay * 2);
                
                if (hasText && !scratchingEnabled) {
                    scratchingEnabled = true;
                    updateScratchStatus();
                } else if (!hasText && scratchingEnabled) {
                    scratchingEnabled = false;
                    updateScratchStatus();
                }
            });
            
            submitBtn.addEventListener('click', function() {
                const userAnswer = textarea.value.trim();
                
                if (userAnswer === '') {
                    playSound('error-sound', 0.3);
                    alert('Bitte gib deine Interpretation ein.');
                    return;
                }
                
                saveAnswer(sceneId, userAnswer);
                
                this.disabled = true;
                this.textContent = 'Interpretation gespeichert';
                textarea.disabled = true;
            });
        }
        
        // Resize Handler
        window.addEventListener('resize', function() {
            setTimeout(initCanvas, 100);
        });
    }

    // Setup für alle Scratch-Szenen
    for (let i = 1; i <= 5; i++) {
        setupScratchScene(i);
    }

    // Next buttons für jede Szene
    for (let i = 1; i <= 5; i++) {
        const nextBtn = document.getElementById(`next-${i}`);
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                playSound('click-sound', 0.3);
                if (i < 5) {
                    showScreen(`scene-${i + 1}`);
                } else {
                    showScreen('answers-screen');
                }
            });
        }
    }

    // Next to reflection button
    const nextToReflectionBtn = document.getElementById('next-to-reflection');
    if (nextToReflectionBtn) {
        nextToReflectionBtn.addEventListener('click', function() {
            playSound('click-sound', 0.3);
            showScreen('reflection-screen');
        });
    }

    // View answers again button
    const viewAnswersAgainBtn = document.getElementById('view-answers-again');
    if (viewAnswersAgainBtn) {
        viewAnswersAgainBtn.addEventListener('click', function() {
            playSound('click-sound', 0.3);
            showScreen('answers-screen');
        });
    }

    // Restart button - EINFACHE UND FUNKTIONIERENDE VERSION
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            playSound('click-sound', 0.3);
            console.log('=== RESTART BUTTON GEKLICKT ===');
            
            // 1. Alle Antworten aus localStorage löschen
            userAnswers = {};
            localStorage.removeItem('zwischenDenZeilenAnswers');
            console.log('✓ Alle Antworten gelöscht');
            
            // 2. Alle Szenen zurücksetzen
            for (let i = 1; i <= 5; i++) {
                resetScene(i);
            }
            console.log('✓ Alle 5 Szenen zurückgesetzt');
            
            // 3. Zurück zum Startbildschirm
            console.log('✓ Wechsle zum Startbildschirm');
            showScreen('start-screen');
            
            console.log('=== RESTART ABGESCHLOSSEN ===');
        });
    }

    // Sound für alle Buttons außer Submit-Buttons
    document.querySelectorAll('.btn:not([id^="submit-"])').forEach(button => {
        button.addEventListener('click', function() {
            // Visuelles Feedback
            this.classList.add('sound-feedback');
            setTimeout(() => {
                this.classList.remove('sound-feedback');
            }, 600);
        });
    });
});