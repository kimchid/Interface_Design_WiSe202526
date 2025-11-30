// Warte bis das DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM geladen - JavaScript funktioniert');
    
    // Datenstruktur für gespeicherte Antworten
    let userAnswers = JSON.parse(localStorage.getItem('zwischenDenZeilenAnswers')) || {};
    
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
            };
        }
        
        console.log(`Szene ${sceneNumber} zurückgesetzt`);
    }

    // Start button
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            showScreen('intro-screen');
        });
    }

    // Intro button
    const introBtn = document.getElementById('intro-btn');
    if (introBtn) {
        introBtn.addEventListener('click', function() {
            showScreen('scene-1');
        });
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
            
            // Stelle sicher, dass die Koordinaten innerhalb des Canvas sind
            x = Math.max(0, Math.min(x, canvas.width));
            y = Math.max(0, Math.min(y, canvas.height));
            
            // Pinsel für Rubbeln - entfernt das obere Bild (Ausgangsbild)
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.fill();
            
            // Lösungsbild nach und nach sichtbar machen basierend auf Fortschritt
            updateSolutionVisibility();
            
            // Überprüfe alle 500ms den Fortschritt
            const now = Date.now();
            if (now - lastCheckTime > 500) {
                checkRevealProgress();
                lastCheckTime = now;
            }
        }
        
        function updateSolutionVisibility() {
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
                
                // Mache Lösungsbild proportional zum Fortschritt sichtbar
                solutionImage.style.opacity = Math.min(ratio * 2, 1);
                
            } catch (error) {
                console.error('Fehler beim Aktualisieren der Sichtbarkeit:', error);
            }
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
                
                // Wenn genug aufgedeckt ist (40%)
                if (ratio > 0.4) {
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
            
            // Lösungsbild komplett sichtbar machen
            if (solutionImage) {
                solutionImage.classList.add('revealed');
                solutionImage.style.opacity = '1';
            }
            
            // Zeige Lösungstext an
            if (solutionText) {
                solutionText.classList.add("visible");
            }
        }
        
        // Setup für die Texteingabe
        if (submitBtn && textarea) {
            textarea.addEventListener('input', function() {
                const hasText = this.value.trim().length > 0;
                submitBtn.disabled = !hasText;
                
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
            showScreen('reflection-screen');
        });
    }

    // View answers again button
    const viewAnswersAgainBtn = document.getElementById('view-answers-again');
    if (viewAnswersAgainBtn) {
        viewAnswersAgainBtn.addEventListener('click', function() {
            showScreen('answers-screen');
        });
    }

    // Restart button - EINFACHE UND FUNKTIONIERENDE VERSION
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
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
});