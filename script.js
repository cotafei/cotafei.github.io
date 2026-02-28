// ============================
// UNDERTALE SOUND MANAGER
// ============================
class UndertaleSounds {
    constructor() {
        this.sounds = {};
        this.isUnlocked = false;
        this.pendingSounds = [];
        
        this.loadSounds();
        this.setupUnlock();
    }
    
    // Разблокировка звуков после первого взаимодействия
    setupUnlock() {
        const unlock = () => {
            if (this.isUnlocked) return;
            this.isUnlocked = true;
            
            // Воспроизводим накопившиеся звуки
            this.pendingSounds.forEach(soundName => this.playNow(soundName));
            this.pendingSounds = [];
            
            // Убираем слушатели
            ['click', 'keydown', 'touchstart'].forEach(event => 
                document.removeEventListener(event, unlock)
            );
        };
        
        ['click', 'keydown', 'touchstart'].forEach(event => 
            document.addEventListener(event, unlock)
        );
    }

    // Загрузка звуков
    loadSounds() {
        const soundFiles = {
            select: 'sounds/snd_select.wav',
            hover: 'sounds/snd_tempbell.wav',
            hoverRepo: 'sounds/snd_tempbell1.wav'
        };
        
        Object.entries(soundFiles).forEach(([key, path]) => {
            const audio = new Audio(path);
            audio.volume = 0.3;
            audio.load();
            this.sounds[key] = audio;
        });
    }

    // Основной метод воспроизведения
    play(soundName) {
        if (!this.sounds[soundName]) return;
        
        if (!this.isUnlocked) {
            this.pendingSounds.push(soundName);
            return;
        }
        
        this.playNow(soundName);
    }
    
    // Воспроизведение с клонированием (для одновременных звуков)
    playNow(soundName) {
        const sound = this.sounds[soundName].cloneNode();
        sound.volume = 0.2;
        sound.play().catch(() => {}); // Игнорируем ошибки автоплея
    }
}

// ============================
// GITHUB REPOSITORIES LOADER
// ============================
class GitHubLoader {
    constructor(username) {
        this.username = username;
        this.grid = document.getElementById('repo-grid');
        this.langIcons = {
            'Python': '🐍', 'C#': '🎯', 'HTML': '🌐',
            'JavaScript': '⚡', 'TypeScript': '📘', 'Java': '☕', 'PHP': '🐘'
        };
    }

    async loadRepos() {
        try {
            this.showLoading();
            
            const response = await fetch(
                `https://api.github.com/users/${this.username}/repos?sort=updated&per_page=6`
            );
            const repos = await response.json();
            
            if (!response.ok) throw new Error('Failed to load repos');
            
            this.renderRepos(repos);
            sounds.play('select'); // Звук загрузки
            
        } catch (error) {
            this.showError(error);
        }
    }

    renderRepos(repos) {
        this.grid.innerHTML = '';
        
        const filteredRepos = repos.filter(repo => !repo.fork);
        
        if (filteredRepos.length === 0) {
            this.grid.innerHTML = '<div class="no-repos">NO REPOSITORIES FOUND</div>';
            return;
        }

        filteredRepos.forEach(repo => {
            const card = this.createRepoCard(repo);
            this.grid.appendChild(card);
        });

        // Добавляем звуки и эффекты после рендера
        UIEffects.addSoundsToCards();
    }

    createRepoCard(repo) {
        const card = document.createElement('div');
        card.className = 'card';
        
        const langIcon = this.langIcons[repo.language] || '📁';
        const updated = new Date(repo.updated_at).toLocaleDateString('ru-RU', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        
        card.innerHTML = `
            <h3>${langIcon} ${repo.name}</h3>
            <p>${repo.description || 'No description provided'}</p>
            <div class="repo-stats">
                <span>⭐ ${repo.stargazers_count}</span>
                <span>🍴 ${repo.forks_count}</span>
                <span>🔄 ${updated}</span>
            </div>
            <a href="${repo.html_url}" target="_blank" class="repo-link">VIEW ON GITHUB →</a>
        `;
        
        return card;
    }

    showLoading() {
        this.grid.innerHTML = '<div class="loading">LOADING REPOSITORIES...</div>';
    }

    showError(error) {
        this.grid.innerHTML = `
            <div class="error">
                FAILED TO LOAD REPOSITORIES<br>
                <small>${error.message}</small>
                <button onclick="githubLoader.loadRepos()" class="retry-btn">⟳ RETRY</button>
            </div>
        `;
    }
}

// ============================
// UI EFFECTS (звуки, анимации)
// ============================
const UIEffects = {
    // Добавление звуков на все интерактивные элементы
    init() {
        // Звуки для статических элементов (скиллы, кнопки)
        document.querySelectorAll('.skill, .buttons a, .contact a').forEach(el => {
            el.addEventListener('mouseenter', () => sounds.play('hover'));
        });

        // Звук при клике на ссылки
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                sounds.play('select');
            }
        });
    },

    // Добавление звуков на карточки репозиториев
    addSoundsToCards() {
        console.log('🎮 Adding sounds to cards...');
        
        document.querySelectorAll('.card').forEach(el => {
            // Специальный звук для карточек
            el.addEventListener('mouseenter', () => sounds.play('hoverRepo'));
            
            // Эффект движения при наведении
            el.addEventListener('mousemove', e => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                el.style.transform = `translate(${(x - rect.width/2) * 0.01}px, ${(y - rect.height/2) * 0.01}px)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
        
        console.log(`✅ Sounds added to ${document.querySelectorAll('.card').length} cards`);
    }
};

// ============================
// INITIALIZATION
// ============================
const sounds = new UndertaleSounds();
const githubLoader = new GitHubLoader('cotafei');

window.addEventListener('load', () => {
    githubLoader.loadRepos();     // Загружаем репозитории
    UIEffects.init();             // Инициализируем звуки для статики
    
    // Приветственный звук
    setTimeout(() => sounds.play('select'), 500);
});