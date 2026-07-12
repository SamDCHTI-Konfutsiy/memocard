document.addEventListener('DOMContentLoaded', () => {
    
    // ===== XAVFSIZLIK VA SESSIYA BOSHQARUVI =====
    const STORAGE_KEY = 'flashlearn_password';
    const SESSION_KEY = 'flashlearn_session';
    const DEFAULT_PASSWORD = 'kongzixueyuan';

    // Agar parol o'rnatilmagan bo'lsa, standart parolni o'rnatamiz
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, DEFAULT_PASSWORD);
    }

    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    const loginBtn = document.getElementById('loginBtn');
    const passwordInput = document.getElementById('passwordInput');
    const loginError = document.getElementById('loginError');

    // Sessiya tekshiruvi
    if (sessionStorage.getItem(SESSION_KEY) === 'active') {
        showApp();
    } else {
        showLogin();
    }

    function showLogin() {
        loginScreen.classList.remove('hidden');
        mainApp.classList.add('hidden');
    }

    function showApp() {
        loginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
    }

    // Login knopkasi
    loginBtn.addEventListener('click', attemptLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });

    function attemptLogin() {
        const enteredPass = passwordInput.value;
        const savedPass = localStorage.getItem(STORAGE_KEY);

        if (enteredPass === savedPass) {
            sessionStorage.setItem(SESSION_KEY, 'active'); // Sessiyani aktiv qilamiz
            showApp();
            loginError.style.display = 'none';
            passwordInput.value = '';
        } else {
            loginError.style.display = 'block';
            passwordInput.value = '';
            // Mobil telefonda titrash (vibration) effekti
            if(navigator.vibrate) navigator.vibrate(200);
        }
    }

    // Chiqish (Logout) knopkasi
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem(SESSION_KEY);
        showLogin();
    });

    // Parolni o'zgartirish
    document.getElementById('changePasswordBtn').addEventListener('click', () => {
        const newPass = document.getElementById('newPasswordInput').value;
        if (newPass.length >= 4) {
            localStorage.setItem(STORAGE_KEY, newPass);
            alert('Parol muvaffaqiyatli o\'zgartirildi!');
            document.getElementById('newPasswordInput').value = '';
        } else {
            alert('Yangi parol kamida 4 ta belgidan iborat bo\'lishi kerak.');
        }
    });

    // ===== MOBIL MENYU BOSHQARUVI =====
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('overlay');

    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
        overlay.style.display = 'block';
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.style.display = 'none';
    });

    // ===== SAHIFA NAVIGATSIYASI (VIEW SWITCHING) =====
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const mobileTitle = document.getElementById('mobileTitle');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = item.getAttribute('data-view');

            // Aktiv nav elementini yangilash
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Ko'rinishlarni almashtirish
            views.forEach(view => {
                view.classList.remove('active');
                if (view.id === `${targetView}View`) {
                    view.classList.add('active');
                }
            });

            // Mobil sarlavhani o'zgartirish va menyuni yopish
            mobileTitle.innerText = item.innerText.trim();
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                overlay.style.display = 'none';
            }
        });
    });

    // ===== FLIPCARD (KARTANI OCHIB-YOPISH) =====
    const flashcard = document.getElementById('flashcard');
    const ratingButtons = document.getElementById('ratingButtons');

    flashcard.addEventListener('click', () => {
        flashcard.classList.toggle('flipped');
        // Karta ochilganda baholash tugmalarini ko'rsatamiz
        if (flashcard.classList.contains('flipped')) {
            ratingButtons.classList.remove('hidden');
        } else {
            ratingButtons.classList.add('hidden');
        }
    });

    // Baholash tugmalarini bosganda keyingi kartaga o'tish (oddiy simulyatsiya)
    document.querySelectorAll('.btn-rate').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Karta ochilishiga ta'sir qilmasligi uchun
            flashcard.classList.remove('flipped');
            ratingButtons.classList.add('hidden');
            // Bu yerda SM-2 algoritmi ishlaydi (kelajakda)
            alert('Javob qabul qilindi! Keyingi karta...');
        });
    });

});
