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
            
            // Wenn es der Reflection-Screen ist, zeige alle gespeicherten Antworten an
            if (screenId === 'reflection-screen') {
                displayAllAnswers();
            }
        } else {
            console.error('Screen nicht gefunden:', screenId);
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
        const totalAnswersElement = document.getElementById('total-answers');
        
        if (container) {
            container.innerHTML = '';
            
            let answerCount = 0;
            
            // Gehe durch alle Szenen und zeige gespeicherte Antworten an
            for (let i = 1; i <= 5; i++) {
                const sceneId = `scene-${i}`;
                const answer = userAnswers[sceneId];
                
                if (answer && answer.trim() !== '') {
                    answerCount++;
                    
                    const answerItem = document.createElement('div');
                    answerItem.className = 'answer-item fade-in';
                    answerItem.innerHTML = `
                        <div class="answer-scene">Szene ${i}:</div>
                        <div class="answer-text">"${answer}"</div>
                    `;
                    container.appendChild(answerItem);
                }
            }
            
            // Aktualisiere die Statistik
            if (totalAnswersElement) {
                totalAnswersElement.textContent = answerCount;
            }
            
            // Wenn keine Antworten vorhanden sind
            if (answerCount === 0) {
                container.innerHTML = '<p>Noch keine Interpretationen gespeichert.</p>';
            }
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

    // Scratch-Funktionalität für jede Szene
    function setupScratchScene(sceneNumber) {
        const canvas = document.getElementById(`scratch-${sceneNumber}`);
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
        
        // Canvas Größe setzen und Ausgangsbild laden
        function initCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            
            // Ausgangsbild auf Canvas zeichnen (unterschiedlich für jede Szene)
            backgroundImage = new Image();
            backgroundImage.crossOrigin = "anonymous";
            backgroundImage.src = startImages[sceneNumber];
            
            backgroundImage.onload = function() {
                // Canvas komplett leeren
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Ausgangsbild zeichnen
                ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
                // Rubbel-Modus zurücksetzen
                ctx.globalCompositeOperation = "source-over";
                backgroundImageLoaded = true;
                console.log(`Ausgangsbild ${sceneNumber} geladen und angezeigt`);
            };
            
            backgroundImage.onerror = function() {
                console.error(`Bild konnte nicht geladen werden: ${startImages[sceneNumber]}`);
                // Fallback: Grauen Hintergrund zeichnen
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#999999";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#666666";
                ctx.font = "bold 20px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(`Ausgangsbild ${sceneNumber}`, canvas.width / 2, canvas.height / 2);
                ctx.globalCompositeOperation = "source-over";
                backgroundImageLoaded = true;
            };
        }
        
        // Funktion zum Zurücksetzen des Canvas
        function resetCanvas() {
            isRevealed = false;
            
            if (backgroundImageLoaded) {
                // Canvas komplett leeren
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Ausgangsbild neu zeichnen
                ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
                // Rubbel-Modus zurücksetzen
                ctx.globalCompositeOperation = "source-over";
                console.log(`Canvas ${sceneNumber} zurückgesetzt`);
            } else {
                // Falls Bild noch nicht geladen, neu initialisieren
                initCanvas();
            }
            
            // Lösungstext verstecken
            if (solutionText) {
                solutionText.classList.remove("visible");
            }
            
            // Submit-Button zurücksetzen
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Interpretation abschicken';
            }
            
            // Textarea zurücksetzen
            if (textarea) {
                textarea.value = '';
                textarea.disabled = false;
            }
        }
        
        // Initialisiere Canvas
        initCanvas();
        
        let scratching = false;
        let lastCheckTime = 0;
        
        // Event Listeners für Maus
        canvas.addEventListener("mousedown", () => {
            scratching = true;
            canvas.style.cursor = "grabbing";
        });
        
        canvas.addEventListener("mouseup", () => {
            scratching = false;
            canvas.style.cursor = "grab";
        });
        
        canvas.addEventListener("mouseleave", () => {
            scratching = false;
            canvas.style.cursor = "grab";
        });
        
        // Event Listeners für Touch
        canvas.addEventListener("touchstart", (e) => {
            scratching = true;
            canvas.style.cursor = "grabbing";
            e.preventDefault();
        });
        
        canvas.addEventListener("touchend", () => {
            scratching = false;
            canvas.style.cursor = "grab";
        });
        
        canvas.addEventListener("touchcancel", () => {
            scratching = false;
            canvas.style.cursor = "grab";
        });
        
        canvas.addEventListener("mousemove", scratch);
        canvas.addEventListener("touchmove", scratch);
        
        function scratch(e) {
            if (!scratching || !backgroundImageLoaded) return;
            
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
            
            // Pinsel für Rubbeln - entfernt das obere Bild
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.fill();
            
            // Überprüfe alle 200ms den Fortschritt
            const now = Date.now();
            if (now - lastCheckTime > 200) {
                revealIfEnoughRemoved();
                lastCheckTime = now;
            }
        }
        
        function revealIfEnoughRemoved() {
            if (isRevealed || !backgroundImageLoaded) return;
            
            try {
                // Erstelle einen kleinen Test-Canvas für die Überprüfung
                const testCanvas = document.createElement('canvas');
                const testCtx = testCanvas.getContext('2d');
                testCanvas.width = 20;
                testCanvas.height = 20;
                
                // Zeichne einen kleinen Ausschnitt in der Mitte
                testCtx.drawImage(canvas, 
                    canvas.width / 2 - 10, canvas.height / 2 - 10, 20, 20,
                    0, 0, 20, 20
                );
                
                const imageData = testCtx.getImageData(0, 0, 20, 20);
                const pixels = imageData.data;
                let transparentPixels = 0;
                
                // Zähle transparente Pixel (Alpha-Wert < 50)
                for (let i = 3; i < pixels.length; i += 4) {
                    if (pixels[i] < 50) {
                        transparentPixels++;
                    }
                }
                
                const ratio = transparentPixels / (pixels.length / 4);
                
                console.log(`Szene ${sceneNumber}: ${Math.round(ratio * 100)}% aufgedeckt in der Mitte`);
                
                // Wenn genug aufgedeckt ist (30%)
                if (ratio > 0.3) {
                    revealSolution();
                }
            } catch (error) {
                console.error('Fehler beim Überprüfen:', error);
            }
        }
        
        function revealSolution() {
            if (isRevealed) return;
            
            isRevealed = true;
            console.log(`Lösung für Szene ${sceneNumber} wird angezeigt`);
            
            // Zeige Lösungstext an
            if (solutionText) {
                solutionText.classList.add("visible");
            }
            
            // Aktiviere Submit-Button
            if (submitBtn) {
                submitBtn.disabled = false;
            }
            
            // Auto-Continue nach 3 Sekunden
            setTimeout(() => {
                if (sceneNumber < 5 && submitBtn && !submitBtn.disabled) {
                    showScreen(`scene-${sceneNumber + 1}`);
                } else if (sceneNumber === 5 && submitBtn && !submitBtn.disabled) {
                    showScreen('reflection-screen');
                }
            }, 3000);
        }
        
        // Setup für die Texteingabe
        if (submitBtn && textarea) {
            submitBtn.addEventListener('click', function() {
                const userAnswer = textarea.value.trim();
                
                if (userAnswer === '') {
                    alert('Bitte gib deine Interpretation ein.');
                    return;
                }
                
                // Speichere die Antwort
                saveAnswer(sceneId, userAnswer);
                
                // Deaktiviere den Button und das Textfeld
                this.disabled = true;
                this.textContent = 'Interpretation gespeichert';
                textarea.disabled = true;
                
                // Sofort zur nächsten Szene wechseln
                setTimeout(() => {
                    if (sceneNumber < 5) {
                        showScreen(`scene-${sceneNumber + 1}`);
                    } else {
                        showScreen('reflection-screen');
                    }
                }, 1000);
            });
            
            // Enter-Taste zum Abschicken
            textarea.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && e.ctrlKey) {
                    submitBtn.click();
                }
            });
        }
        
        // Resize Handler
        window.addEventListener('resize', function() {
            setTimeout(initCanvas, 100);
        });
        
        // Rückgabe der reset-Funktion für den Restart-Button
        return { resetCanvas };
    }

    // Array zum Speichern der Reset-Funktionen für jede Szene
    const sceneResetFunctions = [];

    // Setup für alle Scratch-Szenen
    for (let i = 1; i <= 5; i++) {
        const resetFunction = setupScratchScene(i);
        sceneResetFunctions.push(resetFunction);
    }

    // Restart button
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            console.log('Restart Button geklickt');
            
            // Reset aller Szenen
            sceneResetFunctions.forEach((resetFunc, index) => {
                if (resetFunc && resetFunc.resetCanvas) {
                    resetFunc.resetCanvas();
                }
            });
            
            // Lösche gespeicherte Antworten
            userAnswers = {};
            localStorage.removeItem('zwischenDenZeilenAnswers');
            
            // Zurück zum Start-Bildschirm
            showScreen('start-screen');
        });
    }

    console.log('Alle Event Listener wurden registriert');
});