document.addEventListener('DOMContentLoaded', () => {
    
    // ===== 1. XAVFSIZLIK VA LOGIN =====
    const STORAGE_KEY = 'flashlearn_password';
    const SESSION_KEY = 'flashlearn_session';
    const DATA_KEY = 'flashlearn_data';
    const DEFAULT_PASSWORD = 'kongzixueyuan';

    if (!localStorage.getItem(STORAGE_KEY)) localStorage.setItem(STORAGE_KEY, DEFAULT_PASSWORD);
    if (!localStorage.getItem(DATA_KEY)) localStorage.setItem(DATA_KEY, JSON.stringify({ decks: [], cards: [] }));

    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    const loginBtn = document.getElementById('loginBtn');
    const passwordInput = document.getElementById('passwordInput');
    const loginError = document.getElementById('loginError');

    if (sessionStorage.getItem(SESSION_KEY) === 'active') showApp();
    else showLogin();

    function showLogin() { loginScreen.style.display = 'flex'; mainApp.style.display = 'none'; }
    function showApp() { loginScreen.style.display = 'none'; mainApp.style.display = 'flex'; initApp(); }

    loginBtn.addEventListener('click', attemptLogin);
    passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') attemptLogin(); });

    function attemptLogin() {
        if (passwordInput.value === localStorage.getItem(STORAGE_KEY)) {
            sessionStorage.setItem(SESSION_KEY, 'active');
            showApp();
            loginError.style.display = 'none';
            passwordInput.value = '';
        } else {
            loginError.style.display = 'block';
            passwordInput.value = '';
            if(navigator.vibrate) navigator.vibrate(200);
        }
    }

    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem(SESSION_KEY);
        showLogin();
    });

    document.getElementById('changePasswordBtn').addEventListener('click', () => {
        const newPass = document.getElementById('newPasswordInput').value;
        if (newPass.length >= 4) {
            localStorage.setItem(STORAGE_KEY, newPass);
            alert('Parol muvaffaqiyatli o\'zgartirildi!');
            document.getElementById('newPasswordInput').value = '';
        } else alert('Yangi parol kamida 4 ta belgidan iborat bo\'lishi kerak.');
    });

    document.getElementById('clearDataBtn').addEventListener('click', () => {
        if(confirm('Barcha so\'zlar va decklar o\'chiriladi. Davom etasizmi?')) {
            localStorage.setItem(DATA_KEY, JSON.stringify({ decks: [], cards: [] }));
            renderAll();
            alert('Ma\'lumotlar tozalandi.');
        }
    });

    // ===== 2. ILOVA LOGIKASI (DECKS & CARDS) =====
    let currentDeckId = null;
    let studyQueue = [];
    let currentCardIndex = 0;

    function getData() { return JSON.parse(localStorage.getItem(DATA_KEY)); }
    function saveData(data) { localStorage.setItem(DATA_KEY, JSON.stringify(data)); }

    function initApp() {
        setupNavigation();
        setupDecksUI();
        setupFlashcardsUI();
        renderAll();
    }

    window.navigateTo = function(viewName) {
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.toggle('active', nav.getAttribute('data-view') === viewName);
        });
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        document.getElementById(`${viewName}View`).classList.add('active');
        document.getElementById('mobileTitle').innerText = document.querySelector(`.nav-item[data-view="${viewName}"]`).innerText.trim();
        
        if (window.innerWidth <= 768) {
            document.querySelector('.sidebar').classList.remove('active');
            document.getElementById('overlay').style.display = 'none';
        }
    };

    function setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(item.getAttribute('data-view'));
            });
        });

        document.getElementById('menuToggle').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.add('active');
            document.getElementById('overlay').style.display = 'block';
        });
        document.getElementById('overlay').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.remove('active');
            document.getElementById('overlay').style.display = 'none';
        });
    }

    // --- DECKS MANAGEMENT ---
    function setupDecksUI() {
        document.getElementById('addDeckBtn').addEventListener('click', () => {
            const input = document.getElementById('newDeckName');
            const name = input.value.trim();
            if (name) {
                const data = getData();
                data.decks.push({ id: Date.now().toString(), name: name });
                saveData(data);
                input.value = '';
                renderDecks();
                renderStats();
            }
        });
    }

    function renderDecks() {
        const data = getData();
        const list = document.getElementById('deckList');
        list.innerHTML = '';

        if (data.decks.length === 0) {
            list.innerHTML = '<p style="color:var(--text-muted); padding:10px;">Hozircha decklar yo'q.</p>';
            return;
        }

        data.decks.forEach(deck => {
            const cardCount = data.cards.filter(c => c.deckId === deck.id).length;
            const div = document.createElement('div');
            div.className = `deck-item ${currentDeckId === deck.id ? 'active' : ''}`;
            div.innerHTML = `
                <div class="deck-info">
                    <h4>${deck.name}</h4>
                    <p>${cardCount} ta so'z</p>
                </div>
                <button class="delete-icon" data-id="${deck.id}">🗑️</button>
            `;
            div.addEventListener('click', (e) => {
                if (e.target.tagName !== 'BUTTON') {
                    currentDeckId = deck.id;
                    renderDecks();
                    renderCards();
                }
            });
            div.querySelector('.delete-icon').addEventListener('click', (e) => {
                e.stopPropagation();
                data.decks = data.decks.filter(d => d.id !== deck.id);
                data.cards = data.cards.filter(c => c.deckId !== deck.id);
                saveData(data);
                if (currentDeckId === deck.id) currentDeckId = null;
                renderDecks();
                renderCards();
                renderStats();
            });
            list.appendChild(div);
        });
    }

    function renderCards() {
        const manager = document.getElementById('cardsManager');
        if (!currentDeckId) {
            manager.innerHTML = `<div class="empty-state"><h3>Deckni tanlang</h3><p>O'chirish yoki so'z qo'shish uchun chapdan birorni tanlang.</p></div>`;
            return;
        }

        const data = getData();
        const deck = data.decks.find(d => d.id === currentDeckId);
        const cards = data.cards.filter(c => c.deckId === currentDeckId);

        manager.innerHTML = `
            <h3>${deck.name} - Kartalar</h3>
            <div class="add-card-form">
                <div class="grid-2">
                    <input type="text" id="newCardFront" placeholder="Savol/So'z">
                    <input type="text" id="newCardBack" placeholder="Javob/Tarjima">
                </div>
                <button id="addCardBtn" class="btn-primary" style="width:auto; padding:10px 20px;">So'z qo'shish</button>
            </div>
            <div id="cardListContainer"></div>
        `;

        document.getElementById('addCardBtn').addEventListener('click', () => {
            const front = document.getElementById('newCardFront').value.trim();
            const back = document.getElementById('newCardBack').value.trim();
            if (front && back) {
                data.cards.push({ id: Date.now().toString(), deckId: currentDeckId, front, back });
                saveData(data);
                renderCards();
                renderDecks();
                renderStats();
            }
        });

        const listContainer = document.getElementById('cardListContainer');
        if (cards.length === 0) {
            listContainer.innerHTML = '<p style="color:var(--text-muted); margin-top:16px;">Bu deckda hozir so'zlar yo'q.</p>';
            return;
        }

        cards.forEach(card => {
            const div = document.createElement('div');
            div.className = 'card-item';
            div.innerHTML = `
                <div class="card-front-text">${card.front}</div>
                <div class="card-back-text">${card.back}</div>
                <button class="delete-icon" data-id="${card.id}">🗑️</button>
            `;
            div.querySelector('.delete-icon').addEventListener('click', () => {
                data.cards = data.cards.filter(c => c.id !== card.id);
                saveData(data);
                renderCards();
                renderDecks();
                renderStats();
            });
            listContainer.appendChild(div);
        });
    }

    // --- STUDY / FLASHCARDS ---
    function setupFlashcardsUI() {
        document.getElementById('flashcard').addEventListener('click', () => {
            document.getElementById('flashcard').classList.toggle('flipped');
            document.getElementById('ratingButtons').classList.toggle('hidden');
        });
    }

    window.rateCard = function(rating) {
        // Oddiy o'chirish logikasi (kelajakda SM-2 qo'shiladi)
        currentCardIndex++;
        loadNextCard();
    }

    function loadNextCard() {
        if (currentCardIndex >= studyQueue.length) {
            document.getElementById('flashcardContainer').classList.add('hidden');
            document.getElementById('noCardsScreen').classList.remove('hidden');
            return;
        }

        const card = studyQueue[currentCardIndex];
        document.getElementById('cardFront').innerText = card.front;
        document.getElementById('cardBack').innerText = card.back;
        
        document.getElementById('flashcard').classList.remove('flipped');
        document.getElementById('ratingButtons').classList.add('hidden');
    }

    function initStudy() {
        const data = getData();
        studyQueue = [...data.cards]; // Hozircha barcha kartalarni o'qishga olamiz
        currentCardIndex = 0;

        if (studyQueue.length === 0) {
            document.getElementById('flashcardContainer').classList.add('hidden');
            document.getElementById('noCardsScreen').classList.remove('hidden');
        } else {
            document.getElementById('flashcardContainer').classList.remove('hidden');
            document.getElementById('noCardsScreen').classList.add('hidden');
            loadNextCard();
        }
    }

    // --- STATISTICS ---
    function renderStats() {
        const data = getData();
        const totalDecks = data.decks.length;
        const totalCards = data.cards.length;
        const learnedCards = data.cards.length; // Hozircha faqat mavjud kartalar hisoblanadi
        
        // Dashboard
        document.getElementById('dashStats').innerHTML = `
            <div class="stat-card"><p class="stat-label">Jami Decklar</p><h3 class="stat-value">${totalDecks}</h3></div>
            <div class="stat-card"><p class="stat-label">Jami So'zlar</p><h3 class="stat-value">${totalCards}</h3></div>
            <div class="stat-card"><p class="stat-label">O'rganish ketma-ketligi</p><h3 class="stat-value">1 kun</h3></div>
            <div class="stat-card"><p class="stat-label">Faollik</p><h3 class="stat-value">100%</h3></div>
        `;

        // Stats Page
        document.getElementById('mainStatsGrid').innerHTML = `
            <div class="stat-card"><p class="stat-label">Jami Decklar</p><h3 class="stat-value">${totalDecks}</h3></div>
            <div class="stat-card"><p class="stat-label">Jami Kartalar</p><h3 class="stat-value">${totalCards}</h3></div>
            <div class="stat-card"><p class="stat-label">O'rganilgan</p><h3 class="stat-value">${learnedCards}</h3></div>
        `;

        // Distribution chart
        const distContainer = document.getElementById('cardDistribution');
        if (totalDecks === 0) {
            distContainer.innerHTML = '<p style="color:var(--text-muted)">Hozircha statistika yo\'q.</p>';
            return;
        }

        distContainer.innerHTML = '';
        data.decks.forEach(deck => {
            const count = data.cards.filter(c => c.deckId === deck.id).length;
            const percentage = totalCards > 0 ? (count / totalCards) * 100 : 0;
            
            const item = document.createElement('div');
            item.className = 'progress-item';
            item.innerHTML = `
                <div class="progress-label">${deck.name}</div>
                <div class="progress-track">
                    <div class="progress-fill" style="width: ${percentage}%; background: var(--primary);"></div>
                </div>
                <div class="progress-value">${count}</div>
            `;
            distContainer.appendChild(item);
        });
    }

    function renderAll() {
        renderDecks();
        renderCards();
        initStudy();
        renderStats();
    }
});
