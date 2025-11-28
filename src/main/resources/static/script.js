// ==================== 配置 ====================
const CONFIG = {
    BASE_URL: "http://175.24.205.213:8102",
    CREEM_API_KEY: "creem_test_6vX0QQ2G8HzKoIbuj4A6KW",
    CREEM_BASE_URL: "https://test-api.creem.io/v1",
    CREEM_PRODUCTS: {
        monthly: "prod_2RMibVV6nMcDinlwkLy5mN",
        yearly: "prod_2iYv73K3sTEhSeD7VVGqXZ",
    },
}

// ==================== 艺术家数据 ====================
const ARTISTS = [
    {
        id: "martin-garrix",
        name: "Martin Garrix",
        genre: "Progressive House / Big Room",
        description: "充满活力的主舞台电子音乐制作人，以其标志性的旋律和动感节奏闻名",
        prompt:
            "energetic progressive house with uplifting melodies, powerful drops, festival anthem style, big room sound with emotional breakdowns",
        image: "/public/martingarrix.jpg",
    },
    {
        id: "avicii",
        name: "Avicii",
        genre: "Progressive House / EDM",
        description: "传奇电子音乐先驱，将乡村元素与电子音乐完美融合",
        prompt:
            "melodic progressive house with country influences, emotional piano chords, euphoric buildups, uplifting and nostalgic atmosphere",
        image: "/public/avicii.jpg",
    },
    {
        id: "deadmau5",
        name: "Deadmau5",
        genre: "Progressive House / Electro",
        description: "先锋电子音乐制作大师，以其独特的渐进式声音设计著称",
        prompt:
            "progressive house with minimalist approach, evolving synth patterns, deep bass lines, hypnotic grooves, sophisticated production",
        image: "/public/dead.jpg",
    },
    {
        id: "calvin-harris",
        name: "Calvin Harris",
        genre: "Dance Pop / EDM",
        description: "流行电子音乐巨星，创作出无数热门单曲",
        prompt:
            "catchy dance pop with electronic production, radio-friendly hooks, energetic beats, modern commercial sound",
        image: "/public/cal.jpg",
    },
    {
        id: "skrillex",
        name: "Skrillex",
        genre: "Dubstep / Bass Music",
        description: "Dubstep革命者，以其激进的低音和独特的声音设计改变了电子音乐",
        prompt:
            "aggressive dubstep with heavy bass wobbles, glitchy sound design, dynamic drops, experimental electronic elements",
        image: "/public/skrill.jpg",
    },
    {
        id: "kygo",
        name: "Kygo",
        genre: "Tropical House",
        description: "热带浩室音乐的代表人物，以其温暖轻松的声音闻名",
        prompt:
            "tropical house with warm piano melodies, relaxed summer vibes, smooth vocals, beach atmosphere, feel-good energy",
        image: "/public/kygo.jpg",
    },
    {
        id: "marshmello",
        name: "Marshmello",
        genre: "Future Bass / Trap",
        description: "神秘的电子音乐制作人，以其欢快的未来低音和陷阱音乐闻名",
        prompt:
            "future bass with bright synths, bouncy rhythms, uplifting melodies, trap-influenced beats, playful and energetic",
        image: "/public/marsh.jpg",
    },
    {
        id: "alan-walker",
        name: "Alan Walker",
        genre: "Melodic EDM",
        description: "以深邃旋律和情感氛围著称的年轻制作人",
        prompt:
            "melodic electronic music with mysterious atmosphere, emotional vocal chops, deep progressive builds, ethereal soundscapes",
        image: "/public/alan.jpg",
    },
]
// ====================== 全局 Loading + Toast 系统（高级感拉满）======================

// 1. 创建 loading 元素（只创建一次）
function createGlobalLoading() {
    if (document.getElementById('globalLoading')) return;

    const loadingHTML = `
        <div id="globalLoading" style="
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(10px);
            z-index: 9999;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            color: #fff;
            font-family: '华文中宋', 'Times New Roman', serif;
            font-size: 1.3rem;
            transition: opacity 0.4s ease;
        ">
            <div class="spinner" style="
                width: 60px; height: 60px;
                border: 4px solid rgba(255,255,255,0.2);
                border-top: 4px solid #1db954;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
            "></div>
            <div id="loadingText">正在创作歌词…</div>
        </div>

        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', loadingHTML);
}

// 2. 显示 loading
function showGlobalLoading(text = '正在处理…') {
    createGlobalLoading();
    const el = document.getElementById('globalLoading');
    const textEl = document.getElementById('loadingText');
    textEl.textContent = text;
    el.style.display = 'flex';
    el.style.opacity = '1';
}

// 3. 隐藏 loading
function hideGlobalLoading() {
    const el = document.getElementById('globalLoading');
    if (el) {
        el.style.opacity = '0';
        setTimeout(() => {
            el.style.display = 'none';
        }, 400);
    }
}

// 4. Toast 提示（生成成功、错误等）
function showToast(message, duration = 3000) {
    // 先删除旧的
    document.querySelectorAll('.global-toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'global-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.9);
        color: #fff;
        padding: 12px 28px;
        border-radius: 50px;
        font-size: 1rem;
        z-index: 10000;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        animation: toastFadeIn 0.4s ease;
        font-family: '华文中宋', serif;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastFadeOut 0.4s ease forwards';
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

// 添加淡入淡出动画
const style = document.createElement('style');
style.textContent = `
    @keyframes toastFadeIn {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes toastFadeOut {
        to { opacity: 0; transform: translateX(-50%) translateY(20px); }
    }
`;
document.head.appendChild(style);

/**
 * AI生成歌词（无全局loading版，超时5分钟）
 */
async function aiGenLyrics(prompt) {
    // 参数安全校验
    if (!prompt || typeof prompt !== 'string') {
        return { success: false, lyrics: '', message: '提示词无效' };
    }

    const userInput = prompt.trim();
    if (userInput === '') {
        return { success: false, lyrics: '', message: '提示词不能为空' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000); // 5分钟超时

    try {
        const response = await fetch(
            `http://175.24.205.213:8102/api/songs/lyrics?prompt=${encodeURIComponent(userInput)}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': 'Bearer ' + localStorage.getItem('token') // 如需登录再打开
                },
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId); // 请求成功就清除超时

        if (!response.ok) {
            const text = await response.text();
            console.error('歌词接口错误:', response.status, text);
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // 后端成功返回歌词
        if (data && data.lyrics) {
            return {
                success: true,
                lyrics: data.lyrics.trim(),
                title: data.title || '',
                taskId: data.taskId || null
            };
        }

        // 后端返回了错误信息
        return {
            success: false,
            lyrics: '',
            message: data.msg || data.message || '生成失败，请重试'
        };

    } catch (err) {
        clearTimeout(timeoutId);

        if (err.name === 'AbortError') {
            console.warn('歌词生成超时（5分钟）');
            return { success: false, lyrics: '', message: '生成超时（超过5分钟），请稍后重试或简化提示词' };
        }

        console.error('aiGenLyrics 异常:', err);
        return { success: false, lyrics: '', message: '网络异常，请检查网络后重试' };
    }
}

// ==================== 全局状态 ====================
const APP = {
    currentUser: null,
    currentPage: "home",
    currentSongId: null,
    playlist: [],
    currentTrackIndex: -1,
    audioElement: null,
    isPlaying: false,
    midiData: null,
    midiNotes: [],
    midiPlaybackInterval: null,
    midiCurrentTime: 0,
    audioContext: null,
    allWorks: [],
    allCommunity: [],
    midiZoom: 1.0, // Add zoom level for MIDI preview
    midiPanX: 0, // Add pan position for MIDI canvas
    activeOscillators: [], // Track active oscillators for proper cleanup

    // 初始化
    init() {
        this.audioElement = document.getElementById("audioElement")
        this.checkAutoLogin()
        this.updateUserUI()
        this.navigateTo("home")
        this.setupAudioListeners()
    },

    formatTimeAgo(dateString) {
    if (!dateString) return "刚刚";
    const diff = Date.now() - new Date(dateString).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return "刚刚";
    if (m < 60) return `${m}分钟前`;
    if (h < 24) return `${h}小时前`;
    if (d < 7) return `${d}天前`;
    return new Date(dateString).toLocaleDateString("zh-CN");
},


// ==================== 用户认证 ====================
    checkAutoLogin() {
        const userData = localStorage.getItem("museflow_user")
        if (userData) {
            this.currentUser = JSON.parse(userData)
            this.updateUserUI()
        }
    },

    // ==================== 用户登录（你之前漏掉的）===================
    async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {
            showToast("请填写邮箱和密码");
            return;
        }

        showGlobalLoading("登录中...");

        try {
            const response = await fetch(`${CONFIG.BASE_URL}/api/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            hideGlobalLoading();

            if (data.code === 200) {
                this.currentUser = data.data;
                localStorage.setItem("museflow_user", JSON.stringify(this.currentUser));
                this.updateUserUI();
                this.closeModal("loginModal");
                showToast(`欢迎回来，${this.currentUser.nickname || "音乐人"}！`);
                this.navigateTo("home");
            } else {
                showToast(data.msg || "邮箱或密码错误");
            }
        } catch (error) {
            hideGlobalLoading();
            console.error("登录失败:", error);
            showToast("网络错误，请稍后重试");
        }
    },

    async handleRegister(event) {
        event.preventDefault()
        const nickname = document.getElementById("registerNickname").value
        const email = document.getElementById("registerEmail").value
        const password = document.getElementById("registerPassword").value

        try {
            const response = await fetch(`${CONFIG.BASE_URL}/api/users/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nickname, email, password }),
            })
            const data = await response.json()

            if (data.code === 200) {
                showToast("注册成功！请登录")
                this.closeModal("registerModal")
                this.showModal("loginModal")
            } else {
                showToast(data.msg || "注册失败")
            }
        } catch (error) {
            console.error("Register error:", error)
            showToast("注册失败，请检查网络连接")
        }
    },

    updateUserUI() {
        if (this.currentUser && this.currentUser.userId) {
            fetch(`${CONFIG.BASE_URL}/api/users/${this.currentUser.userId}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.code === 200) {
                        this.currentUser = data.data
                        localStorage.setItem("museflow_user", JSON.stringify(data.data))
                    }
                })
                .catch((error) => {
                    console.error("Update user info error:", error)
                })
        }

        if (this.currentUser) {
            document.getElementById("userActions").style.display = "none"
            document.getElementById("userInfo").style.display = "flex"
            document.getElementById("userNickname").textContent = this.currentUser.nickname || "音乐人"
            document.getElementById("userCredits").textContent = this.currentUser.isVip
                ? "VIP"
                : `${this.currentUser.credits}首`
            document.getElementById("userAvatar").src = this.currentUser.avatar || "/placeholder.svg"
        } else {
            document.getElementById("userActions").style.display = "flex"
            document.getElementById("userInfo").style.display = "none"
        }
    },

    logout() {
        localStorage.removeItem("museflow_user")
        this.currentUser = null
        this.updateUserUI()
        this.navigateTo("home")
        showToast("已退出登录")
    },

    // ==================== 导航 ====================
    navigateTo(page, params = {}) {
        this.currentPage = page
        const content = document.getElementById("mainContent")

        switch (page) {
            case "home":
                content.innerHTML = this.renderHomePage()
                break
            case "create":
                content.innerHTML = this.renderCreatePage()
                break
            case "works":
                this.loadWorks()
                break
            case "midi":
                this.loadMidiStudio()
                break
            case "community":
                this.loadCommunity()
                break
            case "profile":
                content.innerHTML = this.renderProfilePage()
                break
            case "song-detail":
                this.loadSongDetail(params.songId)
                break
            case "artists":
                content.innerHTML = this.renderArtistsPage()
                break
            default:
                content.innerHTML = '<div class="container"><h1>页面未找到</h1></div>'
        }
    },

    // ==================== 页面渲染 ====================
    renderHomePage() {
        return `
          <div class="container">
              <section class="hero-section">
                  <video class="hero-video" autoplay loop muted playsinline>
                      <source src="./banner.mp4" type="video/mp4">
                  </video>
                  <div class="hero-overlay">
                      <h1 class="hero-title">AI音乐创作平台</h1>
                      <p class="hero-subtitle">用AI的力量，创作属于你的音乐</p>
                      <button class="btn-primary" onclick="APP.navigateTo('create')" style="font-size: 1.2rem; padding: 1rem 2.5rem;">开始创作</button>
                  </div>
              </section>
              
              <div class="section-header">
                  <h2 class="section-title">核心功能</h2>
                  <p class="section-subtitle">探索MuseFlow AI的强大功能</p>
              </div>
              
              <div class="features-grid">
                  <div class="feature-card" onclick="APP.navigateTo('create')">
                      <div class="feature-icon">🎵</div>
                      <h3 class="feature-title">AI智能创作</h3>
                      <p class="feature-desc">通过灵感模式或自定义模式，让AI帮你创作独特的音乐作品</p>
                  </div>
                  <div class="feature-card" onclick="APP.navigateTo('artists')">
                      <div class="feature-icon">🎤</div>
                      <h3 class="feature-title">艺术家风格</h3>
                      <p class="feature-desc">模仿世界顶级音乐制作人的风格，创作专业级电子音乐</p>
                  </div>
                  <div class="feature-card" onclick="APP.navigateTo('midi')">
                      <div class="feature-icon">🎹</div>
                      <h3 class="feature-title">MIDI工作室</h3>
                      <p class="feature-desc">将你的音频作品转换为MIDI，在线预览和编辑音符</p>
                  </div>
                  <div class="feature-card" onclick="APP.navigateTo('community')">
                      <div class="feature-icon">🌍</div>
                      <h3 class="feature-title">音乐社区</h3>
                      <p class="feature-desc">分享你的作品，发现其他音乐人的创意灵感</p>
                  </div>
              </div>
          </div>
      `
    },

    renderCreatePage() {
        return `
          <div class="container">
              <div class="create-section">
                  <div class="section-header">
                      <h2 class="section-title">AI音乐创作</h2>
                      <p class="section-subtitle">选择创作模式，开始你的音乐之旅</p>
                  </div>
                  
                  <div style="margin-bottom: 2rem;">
                      <button class="btn-secondary" onclick="APP.navigateTo('artists')" style="width: 100%; padding: 1.5rem; font-size: 1.1rem;">
                          🎤 艺术家风格创作
                      </button>
                  </div>
                  
                  <div class="mode-selector">
                      <div class="mode-btn active" onclick="APP.switchMode('inspiration')" id="inspirationBtn">
                          <div style="font-size: 2rem; margin-bottom: 0.5rem;">✨</div>
                          <div style="color: #ffffff;">灵感模式</div>
                          <div style="font-size: 0.9rem; color: #b0b0b0; margin-top: 0.5rem;">描述你的想法，AI帮你完成</div>
                      </div>
                      <div class="mode-btn" onclick="APP.switchMode('custom')" id="customBtn">
                          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎨</div>
                          <div style="color: #ffffff;">自定义模式</div>
                          <div style="font-size: 0.9rem; color: #b0b0b0; margin-top: 0.5rem;">完全掌控歌词和风格</div>
                      </div>
                  </div>
                  
                  <div class="create-form" id="createForm">
                      ${this.renderInspirationForm()}
                  </div>
              </div>
          </div>
      `
    },

    renderInspirationForm() {
        return `
          <form onsubmit="APP.handleInspiration(event)">
              <div class="form-group">
                  <label>歌曲标题</label>
                  <input type="text" id="songTitle" placeholder="给你的歌曲起个名字" required>
              </div>
              <div class="form-group">
                  <label>创作灵感</label>
                  <textarea id="inspirationPrompt" placeholder="描述你想要的音乐风格、情绪、主题..." required></textarea>
              </div>
              <div class="form-group">
                  <label>版本选择</label>
                  <select id="mvVersion">
                      <option value="chirp-v3-5">Chirp v3.5 (推荐)</option>
                      <option value="chirp-v3-0">Chirp v3.0</option>
                  </select>
              </div>
              <div class="form-group checkbox-group">
                  <input type="checkbox" id="instrumental">
                  <label for="instrumental">纯音乐（无人声）</label>
              </div>
              <button type="submit" class="btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem;">🎵 开始创作</button>
          </form>
      `
    },

    renderCustomForm() {
        return `
      <form onsubmit="APP.handleCustom(event)" id="customForm">
          <div class="form-group">
              <label>歌曲标题 <span class="tip">会作为AI歌词灵感来源</span></label>
              <input type="text" id="songTitle" placeholder="例如：夏夜的萤火、Lost in Tokyo" required>
          </div>

          <div class="form-group">
              <label>自定义歌词</label>
              <div class="lyrics-action-bar">
                  <button type="button" id="aiGenLyricsBtn" class="btn-secondary" onclick="APP.generateLyricsForCustom()">
                      <span class="text">AI 智能生成歌词</span>
                      <span class="loading" style="display:none;">生成中...</span>
                  </button>
                  <small class="hint">基于标题和风格自动创作</small>
              </div>
              <textarea id="customLyrics" placeholder="AI会帮你写出完整歌词，也可以自己修改哦～" required></textarea>
          </div>

          <div class="form-group">
              <label>音乐风格标签 <span class="tip">多个用逗号分隔，会影响歌词情绪</span></label>
              <input type="text" id="styleTags" placeholder="例如: 电子, 梦幻, 夏日, future bass, emotional" value="pop, emotional">
          </div>

          <div class="form-group">
              <label>模型版本</label>
              <select id="mvVersion">
                  <option value="chirp-v3-5">Chirp v3.5（推荐・更聪明）</option>
                  <option value="chirp-v3-0">Chirp v3.0</option>
              </select>
          </div>

          <div class="form-group checkbox-group">
              <label><input type="checkbox" id="instrumental"> 纯音乐（无人声）</label>
          </div>

          <button type="submit" class="btn-primary" style="width: 100%; padding: 1.2rem; font-size: 1.2rem; margin-top: 1rem;">
              开始创作这首歌
          </button>
      </form>
    `;
    },

// ====== 下面挂到 APP 对象里的核心方法（直接粘到你的 APP 对象里）=====

// ====== 2. 替换你原来的 generateLyricsForCustom 方法 ======
    generateLyricsForCustom: async function() {
        const btn = document.getElementById('aiGenLyricsBtn');
        if (!btn || btn.disabled) return;

        const textSpan = btn.querySelector('.text');
        const loadingSpan = btn.querySelector('.loading');

        btn.disabled = true;
        textSpan.style.display = 'none';
        loadingSpan.style.display = 'inline';

        // 获取用户输入
        const title = document.getElementById('songTitle')?.value.trim() || '';
        const tags  = document.getElementById('styleTags')?.value.trim() || '';

        if (!title && !tags) {
            showToast('请至少填写「歌曲标题」或「音乐风格」之一哦～');
            btn.disabled = false;
            textSpan.style.display = 'inline';
            loadingSpan.style.display = 'none';
            return;
        }

        // 智能构造提示词
        let smartPrompt = '';
        if (title && tags) {
            smartPrompt = `请为标题为“${title}”的歌曲创作歌词，风格是：${tags}。语言优美、有画面感，结构完整（包含 Verse、Chorus、Bridge），适合演唱。`;
        } else if (title) {
            smartPrompt = `请根据歌曲标题“${title}”创作一首完整、有情感深度的歌词，包含主歌、副歌、桥段，语言富有诗意和画面感。`;
        } else if (tags) {
            smartPrompt = `请创作一首${tags}风格的歌曲歌词，情感丰富，结构完整（Verse + Chorus + Bridge），适合制作成音乐。`;
        }

        // 调用全局的 aiGenLyrics 函数
        const result = await aiGenLyrics(smartPrompt);

        // 填充结果
        if (result.success && result.lyrics) {
            const textarea = document.getElementById('customLyrics');
            textarea.value = result.lyrics.trim();
            textarea.scrollTop = textarea.scrollHeight; // 自动滚到底
            textSpan.textContent = '重新生成歌词';
            showToast('歌词已生成并自动填充');
        } else {
            showToast(result.message || '歌词生成失败，请重试');
        }

        // 恢复按钮状态
        btn.disabled = false;
        textSpan.style.display = 'inline';
        loadingSpan.style.display = 'none';
    },

    renderArtistsPage() {
        return `
          <div class="container">
              <div class="section-header">
                  <h2 class="section-title">艺术家风格</h2>
                  <p class="section-subtitle">选择你喜欢的艺术家风格，创作专业级电子音乐</p>
              </div>
              <div class="artists-grid">
                  ${ARTISTS.map(
            (artist) => `
                      <div class="artist-card" onclick="APP.generateWithArtist('${artist.id}')">
                          <img src="${artist.image}" alt="${artist.name}" class="artist-image" onerror="this.src='/placeholder.svg'">
                          <div class="artist-info">
                              <h3 class="artist-name">${artist.name}</h3>
                              <p class="artist-genre">${artist.genre}</p>
                              <p class="artist-desc">${artist.description}</p>
                          </div>
                      </div>
                  `,
        ).join("")}
              </div>
          </div>
      `
    },

    renderProfilePage() {
        if (!this.currentUser) {
            return `
              <div class="container">
                  <div class="section-header">
                      <h2 class="section-title">个人中心</h2>
                      <p class="section-subtitle">请先登录</p>
                  </div>
                  <button class="btn-primary" onclick="APP.showModal('loginModal')">登录</button>
              </div>
          `
        }

        return `
          <div class="container">
              <div class="profile-section">
                  <div class="profile-header">
                      <img src="${this.currentUser.avatar || "/placeholder.svg"}" alt="Avatar" class="profile-avatar">
                      <h2 class="profile-name">${this.currentUser.nickname}</h2>
                      <p class="profile-email">${this.currentUser.email || ""}</p>
                      <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                          <div style="text-align: center;">
                              <div style="font-size: 2rem; font-weight: bold; color: #667eea;">${this.currentUser.credits || 0}</div>
                              <div style="color: #b0b0b0;">剩余次数</div>
                          </div>
                          <div style="text-align: center;">
                              <div style="font-size: 2rem; font-weight: bold; color: #667eea;">${this.currentUser.isVip ? "VIP" : "普通"}</div>
                              <div style="color: #b0b0b0;">会员状态</div>
                          </div>
                      </div>
                      <button class="btn-secondary" onclick="APP.logout()" style="margin-top: 1.5rem;">退出登录</button>
                  </div>
                  
                  ${
            !this.currentUser.isVip
                ? `
                  <div class="vip-section">
                      <h3 style="font-size: 1.8rem; margin-bottom: 1rem; color: #ffffff;">升级VIP会员</h3>
                      <p style="color: #b0b0b0; margin-bottom: 1.5rem;">解锁无限创作次数和更多高级功能</p>
                      <div class="vip-plans">
                          <div class="vip-plan">
                              <h3>月度会员</h3>
                              <div class="vip-price">$19</div>
                              <p class="vip-period">每月</p>
                              <button class="btn-primary" onclick="APP.purchaseVIP('monthly')">立即购买</button>
                          </div>
                          <div class="vip-plan">
                              <h3>年度会员</h3>
                              <div class="vip-price">$199</div>
                              <p class="vip-period">每年（省$60）</p>
                              <button class="btn-primary" onclick="APP.purchaseVIP('yearly')">立即购买</button>
                          </div>
                      </div>
                  </div>
                  `
                : ""
        }
              </div>
          </div>
      `
    },

    // ==================== 作品管理 ====================
    async loadWorks() {
        if (!this.currentUser) {
            document.getElementById("mainContent").innerHTML = `
              <div class="container">
                  <div class="section-header">
                      <h2 class="section-title">我的作品</h2>
                      <p class="section-subtitle">请先登录查看你的作品</p>
                  </div>
                  <button class="btn-primary" onclick="APP.showModal('loginModal')">登录</button>
              </div>
          `
            return
        }

        try {
            const response = await fetch(`${CONFIG.BASE_URL}/api/songs/my?userId=${this.currentUser.userId}`)
            const data = await response.json()

            if (data.code === 200) {
                this.allWorks = data.data || []
                // Use the new renderWorksGrid method
                this.renderWorks()
            }
        } catch (error) {
            console.error("Load works error:", error)
            showToast("加载作品失败")
        }
    },

    renderWorks() {
        document.getElementById("mainContent").innerHTML = `
          <div class="container">
              <div class="section-header">
                  <h2 class="section-title">我的作品</h2>
                  <p class="section-subtitle">你已创作 ${this.allWorks.length} 首歌曲</p>
              </div>
              <div class="search-bar">
                  <input type="text" id="worksSearch" placeholder="🔍 搜索你的作品...">
              </div>
              <div class="works-grid">
                  ${this.allWorks.map((song) => this.renderWorkCard(song)).join("")}
              </div>
          </div>
      `
        const searchInput = document.getElementById("worksSearch")
        if (searchInput) {
            // Attach event listener to the new search input
            searchInput.addEventListener("input", (e) => {
                e.stopPropagation()
                this.searchWorks(e.target.value)
            })
            searchInput.addEventListener("click", (e) => {
                e.stopPropagation()
            })
            searchInput.addEventListener("focus", (e) => {
                e.stopPropagation()
            })
        }
    },

    searchWorks(query) {
        if (!query.trim()) {
            this.renderWorksGrid(this.allWorks)
            return
        }
        const filtered = this.allWorks.filter(
            (song) =>
                (song.title && song.title.toLowerCase().includes(query.toLowerCase())) ||
                (song.tags && song.tags.toLowerCase().includes(query.toLowerCase())),
        )
        this.renderWorksGrid(filtered)
    },

    renderWorksGrid(songs) {
        const grid = document.querySelector(".works-grid")
        if (!grid) return

        grid.innerHTML = songs.map((song) => this.renderWorkCard(song)).join("")

        // Re-attach event listeners for new cards
        songs.forEach((song) => {
            const card = document.querySelector(`[data-song-id="${song.clipId}"]`) // Assuming clipId is available and unique
            if (card) {
                card.onclick = () => this.viewSongDetail(song.clipId) // Use clipId from the song object
            }
        })
    },

    renderWorkCard(song) {
        const statusClass = `status-${song.status || "pending"}`
        const statusText =
            {
                pending: "等待中",
                generating: "生成中",
                completed: "已完成",
                failed: "失败",
            }[song.status] || "未知"

        const isPublic = song.isPublic === 1
        const publicButtonText = isPublic ? "设为私密" : "设为公开"
        const publicButtonClass = isPublic ? "btn-secondary" : "btn-primary"

        return `
          <div class="work-card" onclick="APP.viewSongDetail('${song.clipId}')" data-song-id="${song.clipId}">
              ${
            song.coverImage
                ? `<img src="${song.coverImage}" alt="${song.title}" class="work-cover" onerror="this.outerHTML='<div class=\\'work-cover-placeholder\\'><div style=\\'font-size: 3rem;\\'>🎵</div><div style=\\'font-size: 1.2rem; margin-top: 0.5rem;\\'>${song.title}</div></div>'">`
                : `<div class="work-cover work-cover-placeholder">
                      <div style="font-size: 3rem;">🎵</div>
                      <div style="font-size: 1.2rem; margin-top: 0.5rem;">${song.title || "未命名"}</div>
                  </div>`
        }
              <div class="work-info">
                  <h3 class="work-title">${song.title || "未命名"}</h3>
                  <div class="work-meta">
                      <span class="work-tag">${song.tags || "AI生成"}</span>
                      <span class="${statusClass}">${statusText}</span>
                  </div>
                  <div class="work-actions" onclick="event.stopPropagation()">
                      ${
            song.audioUrl
                ? `<button class="btn-primary" onclick="APP.playSong('${song.clipId}')">播放</button>`
                : ""
        }
                      ${
            song.audioUrl
                ? `<button class="btn-secondary" onclick="window.open('${song.audioUrl}', '_blank')">下载</button>`
                : ""
        }
                      ${
            song.midiUrl
                ? `<button class="btn-secondary" onclick="APP.previewMidi('${song.clipId}')">MIDI</button>`
                : `<button class="btn-secondary" onclick="APP.convertToMidi('${song.clipId}')">转MIDI</button>`
        }
                      <button class="${publicButtonClass}" onclick="APP.togglePublic('${song.clipId}')">${publicButtonText}</button>
                      <button class="btn-danger" onclick="APP.deleteSong('${song.clipId}')">删除</button>
                  </div>
              </div>
          </div>
      `
    },

    async togglePublic(clipId) {
        if (!this.currentUser) {
            showToast("请先登录")
            return
        }

        try {
            const formData = new FormData()
            formData.append("userId", this.currentUser.userId)
            formData.append("clipId", clipId)

            const response = await fetch(`${CONFIG.BASE_URL}/api/songs/manage/togglePublic`, {
                method: "POST",
                body: formData,
            })
            const data = await response.json()

            if (data.code === 200) {
                showToast(data.msg || "设置成功")
                await this.loadWorks()
            } else {
                showToast(data.msg || "设置失败")
            }
        } catch (error) {
            console.error("Toggle public error:", error)
            showToast("设置失败，请检查网络")
        }
    },

    async loadSongDetail(songId) {
        try {
            // Fetch user's songs to find the specific song
            const response = await fetch(`${CONFIG.BASE_URL}/api/songs/my?userId=${this.currentUser.userId}`)
            const data = await response.json()

            if (data.code === 200) {
                const song = data.data.find((s) => s.clipId === songId)
                if (song) {
                    document.getElementById("mainContent").innerHTML = this.renderSongDetail(song)
                } else {
                    // If not found in user's songs, try fetching from community
                    const communityResponse = await fetch(`${CONFIG.BASE_URL}/api/songs/all`)
                    const communityData = await communityResponse.json()
                    if (communityData.code === 200) {
                        const communitySong = communityData.data.find((s) => s.clipId === songId)
                        if (communitySong) {
                            document.getElementById("mainContent").innerHTML = this.renderSongDetail(communitySong)
                        } else {
                            document.getElementById("mainContent").innerHTML = '<div class="container"><h1>歌曲未找到</h1></div>'
                        }
                    } else {
                        document.getElementById("mainContent").innerHTML = '<div class="container"><h1>歌曲未找到</h1></div>'
                    }
                }
            } else {
                document.getElementById("mainContent").innerHTML = '<div class="container"><h1>无法加载歌曲详情</h1></div>'
            }
        } catch (error) {
            console.error("Load song detail error:", error)
            document.getElementById("mainContent").innerHTML = '<div class="container"><h1>加载歌曲详情时出错</h1></div>'
        }
    },

    renderSongDetail(song) {
        const coverHtml = song.coverImage
            ? `<img src="${song.coverImage}" alt="${song.title}" class="song-cover-large" onerror="this.outerHTML='<div class=\\'song-cover-placeholder-large\\'>${song.title?.substring(0, 2) || "🎵"}</div>'">`
            : `<div class="song-cover-placeholder-large">${song.title?.substring(0, 2) || "🎵"}</div>`

        return `
          <div class="container">
              <div class="song-detail">
                  <button class="btn-secondary" onclick="APP.navigateTo('works')" style="margin-bottom: 2rem;">← 返回作品列表</button>
                  
                  <div class="song-detail-container">
                      <div>
                          ${coverHtml}
                      </div>
                      <div class="song-meta">
                          <h1 class="song-title-large">${song.title || "未命名"}</h1>
                          <p style="color: #667eea; font-size: 1.2rem; margin-bottom: 1rem;">${song.tags || "AI生成"}</p>
                          <div class="song-info-row">
                              <span>▶ ${song.playCount || 0} 播放</span>
                              <span>❤ ${song.likeCount || 0} 点赞</span>
                              <span>⏱ ${song.duration ? Math.floor(song.duration / 60) + ":" + (song.duration % 60).toString().padStart(2, "0") : "未知"}</span>
                          </div>
                          ${
            song.status === "completed"
                ? `
                          <div class="song-actions-large">
                              <button class="btn-primary" onclick="APP.playSong('${song.clipId}')">播放</button>
                              <button class="btn-secondary" onclick="APP.downloadSong('${song.clipId}')">下载</button>
                              <button class="btn-secondary" onclick="APP.likeSong('${song.clipId}')">点赞</button>
                              ${song.midiUrl ? `<button class="btn-secondary" onclick="APP.previewMidi('${song.clipId}')">预览MIDI</button>` : `<button class="btn-secondary" onclick="APP.convertToMidi('${song.clipId}')">转换MIDI</button>`}
                          </div>
                          `
                : ""
        }
                      </div>
                  </div>
                  
                  ${
            song.lyrics
                ? `
                  <div class="lyrics-section">
                      <div class="lyrics-toggle" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
                          <h3>歌词</h3>
                          <span style="font-size: 1.5rem;">▼</span>
                      </div>
                      <div class="lyrics-text" style="display: none;">${song.lyrics}</div>
                  </div>
                  `
                : ""
        }
              </div>
          </div>
      `
    },

    // ==================== MIDI工作室 ====================
    async loadMidiStudio() {
        if (!this.currentUser) {
            document.getElementById("mainContent").innerHTML = `
              <div class="container">
                  <div class="section-header">
                      <h2 class="section-title">MIDI工作室</h2>
                      <p class="section-subtitle">请先登录</p>
                  </div>
                  <button class="btn-primary" onclick="APP.showModal('loginModal')">登录</button>
              </div>
          `
            return
        }

        try {
            const response = await fetch(`${CONFIG.BASE_URL}/api/songs/my?userId=${this.currentUser.userId}`)
            const data = await response.json()

            if (data.code === 200) {
                const midiSongs = data.data.filter((s) => s.midiUrl)
                document.getElementById("mainContent").innerHTML = `
                  <div class="container">
                      <div class="midi-studio">
                          <div class="section-header">
                              <h2 class="section-title">MIDI工作室</h2>
                              <p class="section-subtitle">管理和预览你的MIDI文件</p>
                          </div>
                          
                          <!-- Enhanced MIDI预览区域 -->
                          <div class="midi-preview-section">
                              <div class="midi-preview-header">
                                  <h3>MIDI预览器</h3>
                                  <div class="midi-zoom-controls">
                                      <button class="zoom-btn" id="zoomOut" title="缩小">−</button>
                                      <span id="zoomLevel">100%</span>
                                      <button class="zoom-btn" id="zoomIn" title="放大">+</button>
                                      <button class="zoom-btn" id="zoomReset" title="重置">⟲</button>
                                  </div>
                              </div>
                              
                              <div class="midi-viewer-enhanced">
                                  <div class="midi-canvas-wrapper" id="midiCanvasWrapper">
                                      <canvas id="midiPreviewCanvas" width="2400" height="400"></canvas>
                                  </div>
                                  <div class="midi-controls-enhanced">
                                      <button class="btn-primary" id="previewPlayBtn">
                                          <span class="btn-icon">▶</span>
                                          <span>播放MIDI</span>
                                      </button>
                                      <div class="progress-container">
                                          <input type="range" id="previewProgress" min="0" max="100" value="0">
                                          <span id="previewTime">0:00 / 0:00</span>
                                      </div>
                                  </div>
                              </div>
                              
                              <div class="midi-upload-area-enhanced" id="midiUploadArea">
                                  <input type="file" id="midiUpload" accept=".mid,.midi" style="display: none;">
                                  <div class="upload-icon">📁</div>
                                  <p class="upload-text">点击上传本地MIDI文件进行预览</p>
                                  <p class="upload-hint">支持 .mid 和 .midi 格式</p>
                              </div>
                          </div>

                          <!-- FL Studio按钮 -->
                          <div class="fl-studio-section">
                              <button class="btn-fl-studio" id="flStudioBtn">
                                  <span style="font-size: 1.5rem;">🎹</span>
                                  <span>打开 FL Studio</span>
                                  <span class="badge-dev">开发中</span>
                              </button>
                              <p class="fl-studio-note">
                                  * 浏览器无法直接启动本地应用，此功能需要桌面客户端支持
                              </p>
                          </div>
                          
                          <div class="midi-list">
                              ${
                    midiSongs.length > 0
                        ? midiSongs
                            .map(
                                (song) => `
                                  <div class="midi-item-enhanced">
                                      <div class="midi-item-icon">🎹</div>
                                      <div class="midi-item-info">
                                          <h3>${song.title}</h3>
                                          <p>${song.tags || "AI生成"} • ${song.duration ? Math.floor(song.duration / 60) + ":" + (song.duration % 60).toString().padStart(2, "0") : "未知"}</p>
                                      </div>
                                      <div class="midi-item-actions">
                                          <button class="btn-primary midi-preview-btn" data-clip-id="${song.clipId}">预览</button>
                                          <button class="btn-secondary" onclick="window.open('${song.midiUrl}', '_blank')">下载</button>
                                      </div>
                                  </div>
                              `,
                            )
                            .join("")
                        : '<div class="empty-state"><p>暂无MIDI文件，去创作歌曲并转换为MIDI吧！</p></div>'
                }
                          </div>
                      </div>
                  </div>
              `

                this.initMidiStudioEvents()
                this.initPreviewCanvas()
            }
        } catch (error) {
            console.error("Load MIDI studio error:", error)
        }
    },

    initMidiStudioEvents() {
        // 文件上传区域点击
        const uploadArea = document.getElementById("midiUploadArea")
        const fileInput = document.getElementById("midiUpload")

        if (uploadArea && fileInput) {
            // Remove existing listeners to avoid duplicates
            const existingListener = uploadArea.dataset.listenerAttached
            if (!existingListener) {
                uploadArea.addEventListener("click", () => {
                    fileInput.click()
                })
                uploadArea.dataset.listenerAttached = "true" // Mark as attached
            }

            fileInput.removeEventListener("change", this.handleMidiUpload.bind(this)) // Remove previous listener if any
            fileInput.addEventListener("change", this.handleMidiUpload.bind(this)) // Add new listener
        }

        // Play button
        const playBtn = document.getElementById("previewPlayBtn")
        if (playBtn) {
            playBtn.removeEventListener("click", this.togglePreviewPlayback.bind(this))
            playBtn.addEventListener("click", this.togglePreviewPlayback.bind(this))
        }

        // Progress bar
        const progress = document.getElementById("previewProgress")
        if (progress) {
            progress.removeEventListener("input", this.seekPreviewHandler.bind(this))
            progress.addEventListener("input", this.seekPreviewHandler.bind(this))
        }

        // FL Studio button
        const flBtn = document.getElementById("flStudioBtn")
        if (flBtn) {
            flBtn.removeEventListener("click", this.openFLStudio.bind(this))
            flBtn.addEventListener("click", this.openFLStudio.bind(this))
        }

        // MIDI preview buttons
        const previewBtns = document.querySelectorAll(".midi-preview-btn")
        previewBtns.forEach((btn) => {
            btn.removeEventListener("click", this.handlePreviewButtonClick) // Remove previous listener
            btn.addEventListener("click", this.handlePreviewButtonClick.bind(this))
        })

        const zoomIn = document.getElementById("zoomIn")
        const zoomOut = document.getElementById("zoomOut")
        const zoomReset = document.getElementById("zoomReset")

        if (zoomIn) zoomIn.addEventListener("click", () => this.adjustZoom(0.2))
        if (zoomOut) zoomOut.addEventListener("click", () => this.adjustZoom(-0.2))
        if (zoomReset) zoomReset.addEventListener("click", () => this.resetZoom())

        const canvasWrapper = document.getElementById("midiCanvasWrapper")
        if (canvasWrapper) {
            canvasWrapper.addEventListener("wheel", (e) => {
                e.preventDefault()
                const delta = e.deltaY > 0 ? -0.1 : 0.1
                this.adjustZoom(delta)
            })
        }
    },

    handlePreviewButtonClick(event) {
        const clipId = event.target.getAttribute("data-clip-id")
        if (clipId) {
            this.previewMidi(clipId)
        }
    },

    async handleMidiUpload(event) {
        const file = event.target.files[0]
        if (!file) return

        try {
            const arrayBuffer = await file.arrayBuffer()
            await this.loadMidiDataToPreview(arrayBuffer)
            showToast("MIDI文件加载成功！")
        } catch (error) {
            console.error("MIDI upload error:", error)
            showToast("MIDI文件加载失败：" + error.message)
        }
    },

    initPreviewCanvas() {
        const canvas = document.getElementById("midiPreviewCanvas")
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        ctx.fillStyle = "#0a0a0a"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw placeholder
        ctx.fillStyle = "#667eea"
        ctx.font = '24px "STZhongsong", "华文中宋", serif'
        ctx.textAlign = "center"
        ctx.fillText("请上传MIDI文件开始预览", canvas.width / 2, canvas.height / 2)
    },

    async loadMidiDataToPreview(arrayBuffer) {
        try {
            this.midiData = await this.parseMidiFile(arrayBuffer)
            this.midiNotes = this.midiData.notes // Ensure midiNotes is populated
            this.drawMidiCanvas("midiPreviewCanvas")
            document.getElementById("previewPlayBtn").disabled = false
            document.getElementById("previewProgress").disabled = false
            document.getElementById("previewTime").textContent = "0:00 / " + this.formatTime(this.midiData.duration)
        } catch (error) {
            console.error("Parse MIDI error:", error)
            throw new Error("MIDI解析失败，请确保文件格式正确")
        }
    },

    adjustZoom(delta) {
        this.midiZoom = Math.max(0.5, Math.min(3.0, this.midiZoom + delta))
        document.getElementById("zoomLevel").textContent = Math.round(this.midiZoom * 100) + "%"
        this.drawMidiCanvas("midiPreviewCanvas")
    },

    resetZoom() {
        this.midiZoom = 1.0
        this.midiPanX = 0
        document.getElementById("zoomLevel").textContent = "100%"
        this.drawMidiCanvas("midiPreviewCanvas")
    },

    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        }
        if (this.audioContext.state === "suspended") {
            this.audioContext.resume().catch((e) => console.error("Failed to resume AudioContext:", e))
        }
    },

    togglePreviewPlayback() {
        this.initAudioContext()

        if (this.midiPlaybackInterval) {
            this.stopPreviewPlayback()
            return
        }

        if (this.audioContext.state === "suspended") {
            this.audioContext
                .resume()
                .then(() => this._startMidiPlayback())
                .catch((e) => {
                    console.error("Failed to resume AudioContext:", e)
                    showToast("请再次点击播放按钮")
                })
        } else {
            this._startMidiPlayback()
        }
    },

    _startMidiPlayback() {
        if (!this.midiNotes || this.midiNotes.length === 0) {
            showToast("没有音符可播放")
            return
        }

        this.midiCurrentTime = 0
        const startTime = this.audioContext.currentTime + 0.05

        // Clear any existing oscillators
        this.stopAllOscillators()

        // Schedule all notes
        this.midiNotes.forEach((note) => {
            const oscData = this.playMidiNote(note.note, startTime + note.time, note.duration, note.velocity / 127)
            if (oscData) this.activeOscillators.push(oscData)
        })

        const totalDuration = this.midiData.duration
        document.getElementById("previewPlayBtn").innerHTML = '<span class="btn-icon">⏸</span><span>暂停</span>'

        this.midiPlaybackInterval = setInterval(() => {
            this.midiCurrentTime += 0.05
            const progress = Math.min((this.midiCurrentTime / totalDuration) * 100, 100)

            const progressBar = document.getElementById("previewProgress")
            const timeDisplay = document.getElementById("previewTime")
            if (progressBar) progressBar.value = progress
            if (timeDisplay) {
                timeDisplay.textContent = `${this.formatTime(this.midiCurrentTime)} / ${this.formatTime(totalDuration)}`
            }

            this.drawMidiCanvas()

            if (this.midiCurrentTime >= totalDuration) {
                this.stopPreviewPlayback()
            }
        }, 50)
    },

    playMidiNote(midiNote, time, duration, velocity = 0.7) {
        if (!this.audioContext) return null

        try {
            const osc = this.audioContext.createOscillator()
            const gainNode = this.audioContext.createGain()
            const filter = this.audioContext.createBiquadFilter()

            // Use triangle wave for piano-like sound
            osc.type = "triangle"
            const frequency = 440 * Math.pow(2, (midiNote - 69) / 12)
            osc.frequency.setValueAtTime(frequency, time)

            // Add a low-pass filter for smoother sound
            filter.type = "lowpass"
            filter.frequency.setValueAtTime(2000, time)

            // ADSR envelope
            gainNode.gain.setValueAtTime(0, time)
            gainNode.gain.linearRampToValueAtTime(velocity * 0.5, time + 0.02) // Attack
            gainNode.gain.exponentialRampToValueAtTime(velocity * 0.3, time + 0.1) // Decay
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration) // Release

            osc.connect(filter)
            filter.connect(gainNode)
            gainNode.connect(this.audioContext.destination)

            osc.start(time)
            osc.stop(time + duration + 0.1)

            return { osc, gainNode, stopTime: time + duration + 0.1 }
        } catch (error) {
            console.error("MIDI note play error:", error)
            return null
        }
    },

    stopPreviewPlayback() {
        if (this.midiPlaybackInterval) {
            clearInterval(this.midiPlaybackInterval)
            this.midiPlaybackInterval = null
        }
        this.stopAllOscillators()
        document.getElementById("previewPlayBtn").innerHTML = '<span class="btn-icon">▶</span><span>播放MIDI</span>'
    },

    stopAllOscillators() {
        const now = this.audioContext ? this.audioContext.currentTime : 0
        this.activeOscillators.forEach((oscData) => {
            try {
                if (oscData.osc && oscData.stopTime > now) {
                    oscData.gainNode.gain.cancelScheduledValues(now)
                    oscData.gainNode.gain.setValueAtTime(oscData.gainNode.gain.value, now)
                    oscData.gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
                    oscData.osc.stop(now + 0.05)
                }
            } catch (e) {
                // Oscillator already stopped
            }
        })
        this.activeOscillators = []
    },

    drawMidiCanvas(canvasId) {
        const canvas = document.getElementById(canvasId || "midiPreviewCanvas")
        if (!canvas || !this.midiNotes || this.midiNotes.length === 0) return

        const ctx = canvas.getContext("2d")
        const width = canvas.width
        const height = canvas.height

        // Clear canvas
        ctx.fillStyle = "#0a0a0a"
        ctx.fillRect(0, 0, width, height)

        // Apply zoom and pan
        ctx.save()
        ctx.scale(this.midiZoom, 1)
        ctx.translate(this.midiPanX, 0)

        const duration = this.midiData.duration
        const pixelsPerSecond = (width / duration) * 0.9

        // Find note range
        const minNote = Math.min(...this.midiNotes.map((n) => n.note))
        const maxNote = Math.max(...this.midiNotes.map((n) => n.note))
        const noteRange = maxNote - minNote + 1
        const noteHeight = height / noteRange

        // Draw grid lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
        ctx.lineWidth = 1
        for (let i = 0; i <= noteRange; i++) {
            const y = i * noteHeight
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(width, y)
            ctx.stroke()
        }

        // Draw time grid
        for (let i = 0; i <= duration; i++) {
            const x = i * pixelsPerSecond
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, height)
            ctx.stroke()
        }

        // Draw notes
        this.midiNotes.forEach((note) => {
            const x = note.time * pixelsPerSecond
            const y = (maxNote - note.note) * noteHeight
            const noteWidth = note.duration * pixelsPerSecond
            const velocity = note.velocity / 127

            // Gradient based on velocity
            const gradient = ctx.createLinearGradient(x, y, x + noteWidth, y + noteHeight)
            gradient.addColorStop(0, `rgba(102, 126, 234, ${velocity})`)
            gradient.addColorStop(1, `rgba(118, 75, 162, ${velocity})`)

            ctx.fillStyle = gradient
            ctx.fillRect(x, y, noteWidth, noteHeight * 0.9)

            // Note border
            ctx.strokeStyle = `rgba(255, 255, 255, ${velocity * 0.5})`
            ctx.lineWidth = 1
            ctx.strokeRect(x, y, noteWidth, noteHeight * 0.9)
        })

        // Draw playback position
        if (this.midiPlaybackInterval && this.midiData) {
            const playheadX = (this.midiCurrentTime / duration) * width * 0.9
            ctx.strokeStyle = "#ff4444"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(playheadX, 0)
            ctx.lineTo(playheadX, height)
            ctx.stroke()
        }

        ctx.restore()
    },

    seekPreviewHandler(event) {
        const value = event.target.value
        if (!this.midiData) return
        this.midiCurrentTime = (value / 100) * this.midiData.duration
        // If playing, stop and restart from new time might be needed for accurate seek
        if (this.midiPlaybackInterval) {
            this.togglePreviewPlayback() // This will stop it
            setTimeout(() => this.togglePreviewPlayback(), 100) // Then restart
        }
    },

    openFLStudio() {
        showToast(
            "此功能需要桌面客户端支持。\n\n浏览器安全限制无法直接启动本地应用程序。\n\n开发计划：\n1. 创建桌面客户端（Electron）\n2. 实现本地协议注册（flstudio://）\n3. 支持一键启动FL Studio",
        )
    },

    parseMidiFile(arrayBuffer) {
        return new Promise((resolve, reject) => {
            try {
                const view = new DataView(arrayBuffer)

                // Check for MIDI file header
                const header = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3))
                if (header !== "MThd") {
                    reject(new Error("不是有效的MIDI文件"))
                    return
                }

                // Read MIDI header info
                const format = view.getUint16(8)
                const trackCount = view.getUint16(10)
                const division = view.getUint16(12)

                // Calculate tick to second conversion
                // Default 120 BPM
                const microsecondsPerQuarter = 500000

                // If division is in smpte format, needs separate handling
                const isSmpte = (division & 0x8000) !== 0
                if (isSmpte) {
                    reject(new Error("SMPTE time division is not supported yet"))
                    return
                }

                const ticksPerBeat = division
                const secondsPerTick = microsecondsPerQuarter / 1000000 / ticksPerBeat

                // Parse tracks
                let pos = 14
                const notes = []
                let maxTime = 0
                const allActiveNotes = {} // To keep track of notes currently being played

                for (let track = 0; track < trackCount && pos < view.byteLength; track++) {
                    // Read track header
                    if (pos + 4 > view.byteLength) break // Ensure enough bytes to read MTrk and length
                    const trackHeader = String.fromCharCode(
                        view.getUint8(pos),
                        view.getUint8(pos + 1),
                        view.getUint8(pos + 2),
                        view.getUint8(pos + 3),
                    )

                    if (trackHeader !== "MTrk") {
                        // Find the next MTrk, or skip unknown block
                        let foundMtrk = false
                        for (let i = pos; i < view.byteLength - 3; i++) {
                            // Ensure there are enough bytes for MTrk check
                            if (
                                view.getUint8(i) === 77 && // M
                                view.getUint8(i + 1) === 84 && // T
                                view.getUint8(i + 2) === 114 && // r
                                view.getUint8(i + 3) === 107 // k
                            ) {
                                pos = i
                                foundMtrk = true
                                break
                            }
                        }
                        if (!foundMtrk) break // No more MTrk found
                        continue // Found MTrk, continue loop
                    }

                    const trackLength = view.getUint32(pos + 4)
                    pos += 8

                    const trackEnd = pos + trackLength
                    let currentTime = 0

                    while (pos < trackEnd && pos < view.byteLength) {
                        // Read delta time
                        let deltaTime = 0
                        let byte = 0
                        let shift = 0
                        do {
                            if (pos >= view.byteLength) {
                                reject(new Error("MIDI文件损坏: delta time读取不完整"))
                                return
                            }
                            byte = view.getUint8(pos++)
                            deltaTime |= (byte & 0x7f) << shift
                            shift += 7
                        } while (byte & 0x80)

                        currentTime += deltaTime * secondsPerTick

                        if (pos >= view.byteLength) {
                            reject(new Error("MIDI文件损坏: 事件读取不完整"))
                            return
                        }

                        // Read event
                        let eventByte = view.getUint8(pos++)

                        let command = eventByte & 0xf0
                        const channel = eventByte & 0x0f

                        // Handle running status
                        if (command < 0x80) {
                            // If it's a data byte, it's a running status event
                            pos-- // Put the byte back
                            // Assume previous command was Note On if not specified otherwise
                            eventByte = 0x90 | channel // Default to Note On
                            command = 0x90
                        }

                        if (command === 0x90 || command === 0x80) {
                            // Note On or Note Off
                            if (pos + 1 >= view.byteLength) {
                                reject(new Error("MIDI文件损坏: Note On/Off data incomplete"))
                                return
                            }

                            const note = view.getUint8(pos++)
                            const velocity = view.getUint8(pos++)

                            if (command === 0x90 && velocity > 0) {
                                // Note On
                                allActiveNotes[note] = {
                                    note,
                                    startTime: currentTime,
                                    velocity,
                                }
                            } else if (allActiveNotes[note]) {
                                // Note Off or Note On with velocity 0
                                const startNote = allActiveNotes[note]
                                const duration = currentTime - startNote.startTime

                                if (duration > 0) {
                                    notes.push({
                                        note: startNote.note,
                                        time: startNote.startTime,
                                        duration,
                                        velocity: startNote.velocity,
                                    })

                                    maxTime = Math.max(maxTime, currentTime)
                                }

                                delete allActiveNotes[note]
                            }
                        } else if (command === 0xb0) {
                            // Control Change
                            if (pos + 1 >= view.byteLength) break
                            pos += 2 // Skip control number and value
                        } else if (command === 0xe0) {
                            // Pitch Bend
                            if (pos + 1 >= view.byteLength) break
                            pos += 2 // Skip pitch bend MSB and LSB
                        } else if (command === 0xc0 || command === 0xd0) {
                            // Program Change or Channel Pressure
                            if (pos >= view.byteLength) break
                            pos += 1
                        } else if (eventByte === 0xff) {
                            // Meta Event
                            if (pos >= view.byteLength) break
                            const metaType = view.getUint8(pos++)

                            // Read length
                            let length = 0
                            let metaShift = 0
                            do {
                                if (pos >= view.byteLength) break
                                byte = view.getUint8(pos++)
                                length |= (byte & 0x7f) << metaShift
                                metaShift += 7
                            } while (byte & 0x80)

                            // Skip meta event data
                            pos += length
                        } else if (eventByte === 0xf0 || eventByte === 0xf7) {
                            // SysEx Event
                            let length = 0
                            let sysExShift = 0
                            do {
                                if (pos >= view.byteLength) break
                                byte = view.getUint8(pos++)
                                length |= (byte & 0x7f) << sysExShift
                                sysExShift += 7
                            } while (byte & 0x80)

                            pos += length
                        }
                    }
                }

                // Close any notes that were started but not ended
                Object.values(allActiveNotes).forEach((startNote) => {
                    // If a note wasn't explicitly turned off, we can assume it plays for a short default duration
                    // or until the end of the track if that's more appropriate.
                    // For simplicity, we'll give it a small duration.
                    const duration = 0.2 // Default short duration
                    notes.push({
                        note: startNote.note,
                        time: startNote.startTime,
                        duration: duration,
                        velocity: startNote.velocity,
                    })
                    maxTime = Math.max(maxTime, startNote.startTime + duration)
                })

                if (notes.length === 0) {
                    reject(new Error("MIDI文件中没有找到有效的音符"))
                    return
                }

                this.midiNotes = notes.sort((a, b) => a.time - b.time)

                resolve({
                    notes: this.midiNotes,
                    duration: maxTime + 1, // Add a small buffer at the end
                })
            } catch (error) {
                reject(error)
            }
        })
    },

    // ==================== 社区 ====================
    async loadCommunity() {
        try {
            const response = await fetch(`${CONFIG.BASE_URL}/api/songs/all`)
            const data = await response.json()

            if (data.code === 200) {
                this.allCommunity = data.data || []
                this.renderCommunity()
            }
        } catch (error) {
            console.error("Load community error:", error)
            showToast("加载社区失败")
        }
    },

    renderCommunity() {
        document.getElementById("mainContent").innerHTML = `
          <div class="container">
              <div class="section-header">
                  <h2 class="section-title">社区</h2>
                  <p class="section-subtitle">发现其他音乐人的精彩作品</p>
              </div>
              
              <div class="community-header">
                  <div class="search-bar">
                      <input type="text" id="communitySearch" placeholder="🔍 搜索歌曲或标签...">
                  </div>
                  <!-- Redesigned filter controls with custom styling -->
                  <div class="filter-controls">
                      <div class="custom-select">
                          <select id="sortSelect">
                              <option value="time">⏰ 最新发布</option>
                              <option value="plays">▶️ 播放量</option>
                              <option value="likes">❤️ 热度</option>
                          </select>
                      </div>
                      <div class="custom-select">
                          <select id="genreSelect">
                              <option value="">🎵 全部风格</option>
                              <option value="edm">🎧 EDM</option>
                              <option value="pop">🎤 Pop</option>
                              <option value="rock">🎸 Rock</option>
                              <option value="hip-hop">🎤 Hip-Hop</option>
                              <option value="electronic">⚡ Electronic</option>
                              <option value="house">🏠 House</option>
                              <option value="dubstep">🔊 Dubstep</option>
                              <option value="trap">🎹 Trap</option>
                          </select>
                      </div>
                  </div>
              </div>
              
              <div class="community-grid">
                  ${this.allCommunity.map((song) => this.renderCommunityCard(song)).join("")}
              </div>
          </div>
      `

        const searchInput = document.getElementById("communitySearch")
        if (searchInput) {
            // Attach event listener to the new search input
            searchInput.addEventListener("input", (e) => {
                e.stopPropagation()
                this.searchCommunity(e.target.value)
            })
            searchInput.addEventListener("click", (e) => {
                e.stopPropagation()
            })
            searchInput.addEventListener("focus", (e) => {
                e.stopPropagation()
            })
        }

        const sortSelect = document.getElementById("sortSelect")
        if (sortSelect) {
            sortSelect.addEventListener("change", (e) => this.sortCommunity(e.target.value))
        }

        const genreSelect = document.getElementById("genreSelect")
        if (genreSelect) {
            genreSelect.addEventListener("change", (e) => this.filterByGenre(e.target.value))
        }
    },

    searchCommunity(query) {
        if (!query.trim()) {
            this.renderCommunityGrid(this.allCommunity)
            return
        }
        const filtered = this.allCommunity.filter(
            (song) =>
                (song.title && song.title.toLowerCase().includes(query.toLowerCase())) ||
                (song.tags && song.tags.toLowerCase().includes(query.toLowerCase())),
        )
        this.renderCommunityGrid(filtered)
    },

    renderCommunityGrid(songs) {
        const grid = document.querySelector(".community-grid")
        if (!grid) return

        grid.innerHTML = songs.map((song) => this.renderCommunityCard(song)).join("")
    },

    sortCommunity(sortBy) {
        const sorted = [...this.allCommunity]

        switch (sortBy) {
            case "plays":
                sorted.sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
                break
            case "likes":
                sorted.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
                break
            case "time":
            default:
                sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                break
        }

        this.renderCommunityGrid(sorted)
    },

    filterByGenre(genre) {
        if (!genre) {
            this.renderCommunityGrid(this.allCommunity)
            return
        }

        const filtered = this.allCommunity.filter(
            (song) => song.tags && song.tags.toLowerCase().includes(genre.toLowerCase()),
        )
        this.renderCommunityGrid(filtered)
    },

    renderCommunityCard(song) {
        const coverHtml = song.coverImage
            ? `<img src="${song.coverImage}" alt="${song.title}" class="work-cover" onerror="this.outerHTML='<div class=\\'work-cover-placeholder\\'>${song.title?.substring(0, 2) || "Music"}</div>'">`
            : `<div class="work-cover-placeholder">${song.title?.substring(0, 2) || "Music"}</div>`;

        // 直接在这儿异步取名字，但用一个临时占位，等名字回来再替换
        const authorId = `author-${song.clipId}`;

        // 立刻返回一个“加载中”的名字，1秒内肯定能加载出来
        setTimeout(() => {
            if (song.userId) {
                fetch(`${CONFIG.BASE_URL}/api/users/getNicknameById?userId=${song.userId}`)
                    .then(r => r.text())
                    .then(name => {
                        const el = document.getElementById(authorId);
                        if (el) el.textContent = name || "神秘音乐人";
                    })
                    .catch(() => {
                        const el = document.getElementById(authorId);
                        if (el) el.textContent = "神秘音乐人";
                    });
            }
        }, 0);

        return `
      <div class="work-card community-card" onclick="APP.navigateTo('song-detail', {songId: '${song.clipId}'})">
          <!-- 作者信息 -->
          <div class="community-author">
              <img src="/placeholder.svg" class="author-avatar">
              <span class="author-name" id="${authorId}">加载中...</span>
              <span class="post-time">${this.formatTimeAgo(song.createdAt)}</span>
          </div>

          ${coverHtml}
          <div class="work-info">
              <h3 class="work-title">${song.title || "未命名"}</h3>
              <p class="work-tags">${song.tags || "AI生成"}</p>
              <div class="work-stats">
                  <span>Play ${song.playCount || 0}</span>
                  <span>Like ${song.likeCount || 0}</span>
              </div>

              ${song.status === "completed" ? `
              <div class="work-actions" onclick="event.stopPropagation()">
                  <button onclick="APP.playSong('${song.clipId}')">播放</button>
                  <button onclick="APP.downloadSong('${song.clipId}')">下载</button>
                  <button onclick="APP.likeSong('${song.clipId}')">Like</button>
                  ${song.midiUrl ? `<button onclick="APP.previewMidi('${song.clipId}')">MIDI</button>` : ''}
              </div>` : ''}
          </div>
      </div>
    `;
    },

    // ==================== 创作处理 ====================
    async handleInspiration(event) {
        event.preventDefault()
        if (!this.currentUser) {
            showToast("请先登录")
            this.showModal("loginModal")
            return
        }

        const title = document.getElementById("songTitle").value
        const prompt = document.getElementById("inspirationPrompt").value
        const mv = document.getElementById("mvVersion").value
        const instrumental = document.getElementById("instrumental").checked

        try {
            const formData = new FormData()
            formData.append("userId", this.currentUser.userId)
            formData.append("title", title)
            formData.append("prompt", prompt)
            formData.append("mv", mv)
            formData.append("instrumental", instrumental)

            const response = await fetch(`${CONFIG.BASE_URL}/api/songs/inspiration`, {
                method: "POST",
                body: formData,
            })
            const data = await response.json()

            if (data.code === 200) {
                showToast('创作任务已提交！请在"我的作品"中查看进度')
                this.navigateTo("works")
            } else {
                showToast(data.msg || "创作失败")
            }
        } catch (error) {
            console.error("Inspiration error:", error)
            showToast("创作失败，请检查网络连接")
        }
    },

    async handleCustom(event) {
        event.preventDefault()
        if (!this.currentUser) {
            showToast("请先登录")
            this.showModal("loginModal")
            return
        }

        const title = document.getElementById("songTitle").value
        const prompt = document.getElementById("customLyrics").value
        const tags = document.getElementById("styleTags").value
        const mv = document.getElementById("mvVersion").value
        const instrumental = document.getElementById("instrumental").checked

        try {
            const formData = new FormData()
            formData.append("userId", this.currentUser.userId)
            formData.append("title", title)
            formData.append("prompt", prompt)
            formData.append("tags", tags)
            formData.append("mv", mv)
            formData.append("instrumental", instrumental)

            const response = await fetch(`${CONFIG.BASE_URL}/api/songs/custom`, {
                method: "POST",
                body: formData,
            })
            const data = await response.json()

            if (data.code === 200) {
                showToast('创作任务已提交！请在"我的作品"中查看进度')
                this.navigateTo("works")
            } else {
                showToast(data.msg || "创作失败")
            }
        } catch (error) {
            console.error("Custom error:", error)
            showToast("创作失败，请检查网络连接")
        }
    },

    async generateWithArtist(artistId) {
        if (!this.currentUser) {
            showToast("请先登录")
            this.showModal("loginModal")
            return
        }

        const artist = ARTISTS.find((a) => a.id === artistId)
        if (!artist) return

        const title = prompt(`请输入歌曲标题（${artist.name}风格）`, `${artist.name} Style`)
        if (!title) return

        try {
            const formData = new FormData()
            formData.append("userId", this.currentUser.userId)
            formData.append("title", title)
            formData.append("prompt", artist.prompt)
            formData.append("personaId", artist.id)
            formData.append("artistClipId", "default")
            formData.append("mv", "chirp-v3-5")

            const response = await fetch(`${CONFIG.BASE_URL}/api/songs/artist`, {
                method: "POST",
                body: formData,
            })
            const data = await response.json()

            if (data.code === 200) {
                showToast('创作任务已提交！请在"我的作品"中查看进度')
                this.navigateTo("works")
            } else {
                showToast(data.msg || "创作失败")
            }
        } catch (error) {
            console.error("Artist generation error:", error)
            showToast("创作失败，请检查网络连接")
        }
    },

    switchMode(mode) {
        const inspirationBtn = document.getElementById("inspirationBtn")
        const customBtn = document.getElementById("customBtn")
        const form = document.getElementById("createForm")

        if (mode === "inspiration") {
            inspirationBtn.classList.add("active")
            customBtn.classList.remove("active")
            form.innerHTML = this.renderInspirationForm()
        } else {
            customBtn.classList.add("active")
            inspirationBtn.classList.remove("active")
            form.innerHTML = this.renderCustomForm()
        }
    },

    // ==================== 音频播放器 ====================
    setupAudioListeners() {
        this.audioElement.addEventListener("timeupdate", () => {
            if (this.audioElement.duration) {
                const progress = (this.audioElement.currentTime / this.audioElement.duration) * 100
                document.getElementById("progressBar").value = progress
                document.getElementById("currentTime").textContent = this.formatTime(this.audioElement.currentTime)
                document.getElementById("totalTime").textContent = this.formatTime(this.audioElement.duration)
            }
        })

        this.audioElement.addEventListener("ended", () => {
            this.nextTrack()
        })
    },

    // ==================== 终极修复版 playSong（支持社区无缝切歌）===================
    async playSong(clipId) {
        try {
            // 1. 先查我的作品（优先）
            let allSongs = []
            let foundSong = null
            let source = "" // "my" 或 "community"

            if (this.currentUser) {
                const myRes = await fetch(`${CONFIG.BASE_URL}/api/songs/my?userId=${this.currentUser.userId}`)
                const myData = await myRes.json()
                if (myData.code === 200 && myData.data) {
                    allSongs.push(...myData.data.filter(s => s.audioUrl))
                    foundSong = allSongs.find(s => s.clipId === clipId)
                    if (foundSong) source = "my"
                }
            }

            // 2. 没找到再查社区公开歌曲
            if (!foundSong) {
                const commRes = await fetch(`${CONFIG.BASE_URL}/api/songs/all`)
                const commData = await commRes.json()
                if (commData.code === 200 && commData.data) {
                    const publicSongs = commData.data.filter(s => s.isPublic === 1 && s.audioUrl)
                    allSongs.push(...publicSongs)
                    foundSong = publicSongs.find(s => s.clipId === clipId)
                    if (foundSong) source = "community"
                }
            }

            if (!foundSong || !foundSong.audioUrl) {
                showToast("这首歌暂时无法播放")
                return
            }

            // 关键来了：把所有能播的歌都塞进播放列表！
            this.playlist = allSongs
            this.currentTrackIndex = allSongs.findIndex(s => s.clipId === clipId)

            // 加载并播放
            this.loadTrack(this.currentTrackIndex)

            // 增加播放量
            fetch(`${CONFIG.BASE_URL}/api/songs/manage/play?clipId=${clipId}`, { method: "POST" })

            showToast(
                source === "my"
                    ? "正在播放你的作品"
                    : `正在播放社区作品（第 ${this.currentTrackIndex + 1} 首，共 ${this.playlist.length} 首）`
            )

        } catch (error) {
            console.error("Play song error:", error)
            showToast("播放失败，请重试")
        }
    },

    loadTrack(index) {
        if (index < 0 || index >= this.playlist.length) return

        const track = this.playlist[index]
        this.currentTrackIndex = index

        // Stop current playback
        this.audioElement.pause()
        this.audioElement.currentTime = 0
        this.isPlaying = false

        // Load new track
        this.audioElement.src = track.audioUrl
        document.getElementById("playerTitle").textContent = track.title || "未命名"
        document.getElementById("playerArtist").textContent = track.tags || "AI生成"
        document.getElementById("playPauseBtn").textContent = "▶"

        // Show player
        document.getElementById("audioPlayer").style.display = "block"

        // Auto play after loading
        this.audioElement.addEventListener(
            "canplay",
            () => {
                this.togglePlayPause()
            },
            { once: true },
        )
    },

    async togglePlayPause() {
        try {
            if (this.isPlaying) {
                this.audioElement.pause()
                document.getElementById("playPauseBtn").textContent = "▶"
                this.isPlaying = false
            } else {
                await this.audioElement.play()
                document.getElementById("playPauseBtn").textContent = "⏸"
                this.isPlaying = true
            }
        } catch (error) {
            console.error("Toggle play/pause error:", error)
            this.isPlaying = false
            document.getElementById("playPauseBtn").textContent = "▶"
        }
    },

    previousTrack() {
        if (this.currentTrackIndex > 0) {
            this.currentTrackIndex--
            this.loadTrack(this.currentTrackIndex)
        }
    },

    nextTrack() {
        if (this.currentTrackIndex < this.playlist.length - 1) {
            this.currentTrackIndex++
            this.loadTrack(this.currentTrackIndex)
        }
    },

    seekTo(value) {
        const time = (value / 100) * this.audioElement.duration
        this.audioElement.currentTime = time
    },

    setVolume(value) {
        this.audioElement.volume = value / 100
    },

    downloadCurrentSong() {
        if (this.playlist[this.currentTrackIndex]) {
            const song = this.playlist[this.currentTrackIndex]
            window.open(song.audioUrl, "_blank")
        }
    },

    closePlayer() {
        this.audioElement.pause()
        this.audioElement.src = ""
        this.isPlaying = false
        document.getElementById("audioPlayer").style.display = "none"
        document.getElementById("lyricsPanel").style.display = "none"
    },

    toggleLyrics() {
        const panel = document.getElementById("lyricsPanel")
        panel.style.display = panel.style.display === "none" ? "block" : "none"
    },

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    },

    // ==================== 歌曲操作 ====================
    async downloadSong(clipId) {
        try {
            const response = await fetch(`${CONFIG.BASE_URL}/api/songs/my?userId=${this.currentUser.userId}`)
            const data = await response.json()
            if (data.code === 200) {
                const song = data.data.find((s) => s.clipId === clipId)
                if (song && song.audioUrl) {
                    window.open(song.audioUrl, "_blank")
                }
            }
        } catch (error) {
            console.error("Download error:", error)
        }
    },

    async likeSong(clipId) {
        try {
            await fetch(`${CONFIG.BASE_URL}/api/songs/manage/like?clipId=${clipId}`, { method: "POST" })
            showToast("点赞成功！")
            // Refresh works if on that page, or community if on that page
            if (this.currentPage === "works") {
                this.loadWorks()
            } else if (this.currentPage === "community") {
                this.loadCommunity()
            }
        } catch (error) {
            console.error("Like error:", error)
            showToast("点赞失败")
        }
    },

    async deleteSong(clipId) {
        if (!confirm("确定要删除这首歌吗？")) return

        try {
            const formData = new FormData()
            formData.append("userId", this.currentUser.userId)
            formData.append("clipId", clipId)

            const response = await fetch(`${CONFIG.BASE_URL}/api/songs/manage/delete`, {
                method: "POST",
                body: formData,
            })
            const data = await response.json()

            if (data.code === 200) {
                showToast("删除成功")
                // Refresh the list after deletion
                if (this.currentPage === "works") {
                    this.loadWorks()
                } else if (this.currentPage === "community") {
                    this.loadCommunity()
                }
            } else {
                showToast(data.msg || "删除失败")
            }
        } catch (error) {
            console.error("Delete error:", error)
            showToast("删除失败")
        }
    },

    async convertToMidi(clipId) {
        if (!confirm("确定要将这首歌转换为MIDI吗？")) return

        console.log("[MIDI转换] 开始请求")
        console.log("[MIDI转换] currentUser:", this.currentUser)
        console.log("[MIDI转换] userId:", this.currentUser.userId)
        console.log("[MIDI转换] clipId:", clipId)

        try {
            // Method 1: Most stable (recommended) - append directly to URL, backend @RequestParam will receive it
            const url = `${CONFIG.BASE_URL}/api/songs/manage/convertMidi?userId=${this.currentUser.userId}&clipId=${clipId}`
            console.log("[MIDI转换] 请求地址:", url)

            const response = await fetch(url, {
                method: "POST",
                // Headers can be omitted, browser defaults to text/plain, Spring can still receive it
            })

            console.log("[MIDI转换] 响应状态:", response.status)

            const data = await response.json()
            console.log("[MIDI转换] 后端返回数据:", data)

            if (data.code === 200) {
                showToast("MIDI转换已开始，请稍后查看")
                console.log("MIDI转换任务提交成功")
                // Refresh works list after a delay to allow backend processing
                setTimeout(() => {
                    if (this.currentPage === "works") {
                        this.loadWorks()
                    } else if (this.currentPage === "community") {
                        this.loadCommunity()
                    }
                }, 2000)
            } else {
                showToast(data.msg || "转换失败")
                console.warn("MIDI转换失败，后端返回:", data)
            }
        } catch (error) {
            console.error("Convert MIDI error:", error)
            showToast("转换失败，请检查网络或控制台")
        }
    },

    // ==================== MIDI预览 ====================
    async previewMidi(clipId) {
        try {
            // First, try to find the song in the user's own works
            const mySongsResponse = await fetch(`${CONFIG.BASE_URL}/api/songs/my?userId=${this.currentUser.userId}`)
            const mySongsData = await mySongsResponse.json()

            let song = null
            if (mySongsData.code === 200) {
                song = mySongsData.data.find((s) => s.clipId === clipId)
            }

            // If not found in own works, try fetching from community
            if (!song) {
                const communityResponse = await fetch(`${CONFIG.BASE_URL}/api/songs/all`)
                const communityData = await communityResponse.json()
                if (communityData.code === 200) {
                    song = communityData.data.find((s) => s.clipId === clipId)
                }
            }

            if (song && song.midiUrl) {
                await this.loadMidiData(song.midiUrl)
                this.showModal("midiModal")
            } else if (song && !song.midiUrl) {
                showToast("该歌曲还没有MIDI文件。")
            } else {
                showToast("找不到该歌曲。")
            }
        } catch (error) {
            console.error("Preview MIDI error:", error)
            showToast("加载MIDI失败")
        }
    },

    async loadMidiData(midiUrl) {
        try {
            const response = await fetch(midiUrl)
            const arrayBuffer = await response.arrayBuffer()
            this.midiData = await this.parseMidiFile(arrayBuffer)
            this.midiNotes = this.midiData.notes // Ensure midiNotes is populated
            this.drawMidiCanvas("midiCanvas")
            // Enable controls after loading
            document.getElementById("midiPlayBtn").disabled = false
            document.getElementById("midiProgress").disabled = false
            document.getElementById("midiTime").textContent = "0:00 / " + this.formatTime(this.midiData.duration)
        } catch (error) {
            console.error("Load MIDI data error:", error)
            showToast("加载MIDI数据失败")
        }
    },

    // drawMidiCanvas(canvasId) { ... } // This function was originally duplicated, but the logic is now consolidated in the drawMidiCanvas function above.

    toggleMidiPlayback() {
        if (this.midiPlaybackInterval) {
            clearInterval(this.midiPlaybackInterval)
            this.midiPlaybackInterval = null
            document.getElementById("midiPlayBtn").textContent = "播放MIDI"
            this.stopMidiAudio()
        } else {
            this.playMidiAudio()
            document.getElementById("midiPlayBtn").textContent = "停止"
        }
    },

    async playMidiAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        }

        // Resume audio context if suspended
        if (this.audioContext.state === "suspended") {
            try {
                await this.audioContext.resume()
            } catch (e) {
                console.error("Failed to resume AudioContext for MIDI playback:", e)
                showToast("Audio context needs to be resumed. Please try clicking play again.")
                return
            }
        }

        this.midiCurrentTime = 0
        const startTime = this.audioContext.currentTime

        // Schedule all notes to play
        this.midiNotes.forEach((note) => {
            const noteTime = startTime + note.time
            this.playMidiNote(note.note, noteTime, note.duration, note.velocity / 127)
        })

        // Update progress bar
        const totalDuration = this.midiData.duration
        this.midiPlaybackInterval = setInterval(() => {
            this.midiCurrentTime += 0.1
            const progress = (this.midiCurrentTime / totalDuration) * 100
            document.getElementById("midiProgress").value = Math.min(progress, 100)
            document.getElementById("midiTime").textContent =
                `${this.formatTime(this.midiCurrentTime)} / ${this.formatTime(totalDuration)}`

            if (this.midiCurrentTime >= totalDuration) {
                this.toggleMidiPlayback() // This will also stop the interval
            }
        }, 100)
    },

    playMidiNote(midiNote, time, duration, velocity) {
        if (!this.audioContext) return

        try {
            const frequency = 440 * Math.pow(2, (midiNote - 69) / 12)

            const oscillator = this.audioContext.createOscillator()
            const gainNode = this.audioContext.createGain()

            oscillator.type = "triangle" // Changed to triangle for slightly different tone
            oscillator.frequency.value = frequency

            const now = this.audioContext.currentTime
            const scheduledTime = Math.max(time, now) // Ensure scheduled time is not in the past

            gainNode.gain.setValueAtTime(velocity * 0.3, scheduledTime) // Lower volume for MIDI preview
            gainNode.gain.exponentialRampToValueAtTime(0.01, scheduledTime + duration)

            oscillator.connect(gainNode)
            gainNode.connect(this.audioContext.destination)

            oscillator.start(scheduledTime)
            oscillator.stop(scheduledTime + duration) // Schedule stop at the end of duration
        } catch (error) {
            console.error("[v0] MIDI note play error:", error)
        }
    },

    stopMidiAudio() {
        if (this.midiPlaybackInterval) {
            clearInterval(this.midiPlaybackInterval)
            this.midiPlaybackInterval = null
        }
        // It's generally better to let scheduled oscillator stops handle note endings.
        // Closing the audio context is too destructive if other audio is playing.
    },

    seekMidi(value) {
        // Simplified MIDI seek function
        // Need to stop current playback and restart from new time if playing
        const wasPlaying = this.midiPlaybackInterval !== null
        if (wasPlaying) {
            this.toggleMidiPlayback() // Stop playback
        }

        this.midiCurrentTime = (value / 100) * this.midiData.duration
        document.getElementById("midiTime").textContent =
            `${this.formatTime(this.midiCurrentTime)} / ${this.formatTime(this.midiData.duration)}`

        if (wasPlaying) {
            setTimeout(() => this.toggleMidiPlayback(), 100) // Restart playback from new time
        }
    },

    closeMidiModal() {
        this.closeModal("midiModal")
        if (this.midiPlaybackInterval) {
            this.toggleMidiPlayback() // Stop playback and clear interval
        }
        // Optionally reset the canvas or progress bar
        if (this.midiData) {
            this.midiCurrentTime = 0
            document.getElementById("midiProgress").value = 0
            document.getElementById("midiTime").textContent = `0:00 / ${this.formatTime(this.midiData.duration)}`
        }
    },

    // ==================== VIP购买 ====================
    // ==================== VIP购买 - 最终正确版（走自己后端代理）===================
    async purchaseVIP(plan) {
        if (!this.currentUser) {
            showToast("请先登录")
            return
        }

        try {
            const res = await fetch("http://175.24.205.213:8102/api/payment/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: this.currentUser.userId,
                    plan: plan, // "monthly" 或 "yearly"
                }),
            })

            const data = await res.json()

            if (data.success && data.checkout_url) {
                // Save plan temporarily for verification after redirect
                localStorage.setItem("pending_vip_purchase", JSON.stringify({ userId: this.currentUser.userId, plan: plan }))
                window.location.href = data.checkout_url
            } else {
                showToast(data.message || "创建支付失败")
            }
        } catch (e) {
            showToast("网络错误")
            console.error(e)
        }
    },

    // Check for payment success callback
    checkPaymentSuccess() {
        const urlParams = new URLSearchParams(window.location.search)
        const paymentStatus = urlParams.get("payment")

        if (paymentStatus === "success") {
            const pendingPurchase = localStorage.getItem("pending_vip_purchase")
            if (pendingPurchase) {
                const purchase = JSON.parse(pendingPurchase)

                // Call backend to update VIP status
                const endpoint =
                    purchase.plan === "monthly"
                        ? `${CONFIG.BASE_URL}/api/users/${purchase.userId}/monthly-vip`
                        : `${CONFIG.BASE_URL}/api/users/${purchase.userId}/yearly-vip`

                fetch(endpoint, { method: "POST" })
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.code === 200) {
                            showToast("VIP开通成功！")
                            localStorage.removeItem("pending_vip_purchase")
                            // Update local user info
                            this.currentUser.isVip = true
                            localStorage.setItem("museflow_user", JSON.stringify(this.currentUser))
                            this.updateUserUI()
                            this.navigateTo("profile") // Navigate to profile to show updated status
                        } else {
                            showToast(data.message || "VIP状态更新失败")
                        }
                    })
                    .catch((error) => {
                        console.error("Error updating VIP status:", error)
                        showToast("VIP状态更新时发生错误")
                    })
            }

            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname)
        }
    },

    // ==================== 模态框 ====================
    showModal(modalId) {
        const modal = document.getElementById(modalId)
        if (modal) {
            modal.style.display = "block"
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId)
        if (modal) {
            modal.style.display = "none"
        }
    },

    async viewSongDetail(clipId) {
        // Try to find the song in my works first
        let song = this.allWorks.find((s) => s.clipId === clipId)

        // If not found, try to find in community
        if (!song) {
            song = this.allCommunity.find((s) => s.clipId === clipId)
        }

        if (!song) {
            showToast("歌曲不存在")
            return
        }

        document.getElementById("mainContent").innerHTML = `
            <div class="container song-detail">
                <button class="btn-secondary" onclick="history.back()" style="margin-bottom: 2rem;">← 返回</button>
                
                <div class="song-detail-container">
                    <div>
                        ${
            song.coverImage
                ? `<img src="${song.coverImage}" alt="${song.title}" class="song-cover-large" onerror="this.outerHTML='<div class=\\'song-cover-placeholder-large\\'>${song.title?.substring(0, 2) || "🎵"}</div>'">`
                : `<div class="song-cover-placeholder-large">
                              <div>🎵</div>
                              <div style="font-size: 1.5rem; margin-top: 1rem;">${song.title || "未命名"}</div>
                          </div>`
        }
                    </div>
                    
                    <div class="song-meta">
                        <h1 class="song-title-large">${song.title || "未命名"}</h1>
                        <div class="song-info-row">
                            <span>🎵 ${song.tags || "AI生成"}</span>
                            <span>👀 ${song.playCount || 0} 播放</span>
                            <span>❤️ ${song.likeCount || 0} 喜欢</span>
                        </div>
                        <div class="song-actions-large">
                            ${song.audioUrl ? `<button class="btn-primary" onclick="APP.playSong('${song.clipId}')">播放歌曲</button>` : ""}
                            ${song.audioUrl ? `<button class="btn-secondary" onclick="window.open('${song.audioUrl}', '_blank')">下载</button>` : ""}
                            ${
            song.midiUrl
                ? `<button class="btn-secondary" onclick="APP.previewMidi('${song.clipId}')">预览MIDI</button>`
                : `<button class="btn-secondary" onclick="APP.convertToMidi('${song.clipId}')">转MIDI</button>`
        }
                        </div>
                    </div>
                </div>
                
                ${
            song.lyrics
                ? `
                <div class="lyrics-section">
                    <div class="lyrics-toggle" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
                        <h3>歌词</h3>
                        <span style="font-size: 1.5rem;">▼</span>
                    </div>
                    <div class="lyrics-text" style="display: none;">${song.lyrics}</div>
                </div>
                `
                : ""
        }
            </div>
        `
    },

    renderCreate() {
        document.getElementById("mainContent").innerHTML = `
          <div class="container create-section">
              <div class="section-header">
                  <h2 class="section-title">AI音乐创作</h2>
                  <p class="section-subtitle">让AI为你创作独一无二的音乐</p>
              </div>
              
              <div class="mode-selector">
                  <div class="mode-btn active" onclick="APP.switchCreateMode('inspiration')" id="inspirationModeBtn">
                      <h3 style="color: white;">💡 灵感模式</h3>
                      <p style="color: white; margin-top: 0.5rem; font-size: 0.9rem;">选择艺术家风格快速创作</p>
                  </div>
                  <div class="mode-btn" onclick="APP.switchCreateMode('custom')" id="customModeBtn">
                      <h3 style="color: white;">✨ 自定义模式</h3>
                      <p style="color: white; margin-top: 0.5rem; font-size: 0.9rem;">完全掌控每个创作细节</p>
                  </div>
              </div>
              
              <div id="inspirationMode">
                  <div class="section-header">
                      <h3 class="section-title" style="font-size: 1.8rem;">选择艺术家风格</h3>
                      <p class="section-subtitle">点击艺术家卡片即可创作该风格的音乐</p>
                  </div>
                  <div class="artists-grid">
                      ${ARTISTS.map(
            (artist) => `
                          <div class="artist-card" onclick="APP.generateWithArtist('${artist.id}')">
                              <img src="${artist.image}" alt="${artist.name}" class="artist-image" onerror="this.src='/placeholder.svg'">
                              <div class="artist-info">
                                  <h3 class="artist-name">${artist.name}</h3>
                                  <p class="artist-genre">${artist.genre}</p>
                                  <p class="artist-desc">${artist.description}</p>
                              </div>
                          </div>
                      `,
        ).join("")}
                      <!-- Added custom artist button -->
                      <div class="artist-card artist-card-add" onclick="APP.addCustomArtist()">
                          <div class="artist-image" style="display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                              <div style="font-size: 5rem; color: white;">+</div>
                          </div>
                          <div class="artist-info">
                              <h3 class="artist-name">自定义艺术家</h3>
                              <p class="artist-genre">AI生成</p>
                              <p class="artist-desc">输入任意艺术家名称，AI将生成其风格描述</p>
                          </div>
                      </div>
                  </div>
              </div>
              
              <div id="customMode" style="display: none;">
                  <form class="create-form" onsubmit="APP.handleCustomCreate(event)">
                      <div class="form-group">
                          <label>歌曲标题</label>
                          <input type="text" name="title" placeholder="输入歌曲标题" required>
                      </div>
                      <div class="form-group">
                          <label>音乐描述/提示词</label>
                          <textarea name="prompt" placeholder="描述你想要的音乐风格、情感、乐器等..." required></textarea>
                      </div>
                      <div class="form-group">
                          <label>歌词（可选）</label>
                          <textarea name="lyrics" placeholder="输入歌词内容，留空则AI自动生成"></textarea>
                      </div>
                      <div class="form-group">
                          <label>音乐风格标签</label>
                          <input type="text" name="tags" placeholder="例如：流行、电子、摇滚">
                      </div>
                      <div class="form-group checkbox-group">
                          <input type="checkbox" name="instrumental" id="instrumental">
                          <label for="instrumental">纯音乐（无人声）</label>
                      </div>
                      <button type="submit" class="btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem;">开始创作</button>
                  </form>
              </div>
          </div>
      `
    },

    // Handler for switching between inspiration and custom modes
    switchCreateMode(mode) {
        const inspirationModeBtn = document.getElementById("inspirationModeBtn")
        const customModeBtn = document.getElementById("customModeBtn")
        const inspirationModeDiv = document.getElementById("inspirationMode")
        const customModeDiv = document.getElementById("customMode")

        if (mode === "inspiration") {
            inspirationModeBtn.classList.add("active")
            customModeBtn.classList.remove("active")
            inspirationModeDiv.style.display = "block"
            customModeDiv.style.display = "none"
        } else {
            customModeBtn.classList.add("active")
            inspirationModeBtn.classList.remove("active")
            customModeDiv.style.display = "block"
            inspirationModeDiv.style.display = "none"
        }
    },

    async addCustomArtist() {
        const artistName = prompt("请输入艺术家名称（例如：Martin Garrix, Avicii）")
        if (!artistName || !artistName.trim()) return

        try {
            // Show loading indicator
            const loadingMsg = document.createElement("div")
            loadingMsg.className = "loading-overlay"
            loadingMsg.innerHTML = `
                <div style="background: rgba(25,25,25,0.95); padding: 2rem; border-radius: 16px; text-align: center;">
                    <div class="loading" style="margin: 0 auto 1rem;"></div>
                    <p style="color: white;">AI正在分析 ${artistName} 的音乐风格...</p>
                </div>
            `
            loadingMsg.style.cssText =
                "position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;"
            document.body.appendChild(loadingMsg)

            const formData = new FormData()
            formData.append("prompt", artistName)

            const response = await fetch(`${CONFIG.BASE_URL}/api/prompt`, {
                method: "POST",
                body: formData,
            })

            if (!response.ok) throw new Error("AI生成失败")

            const aiPrompt = await response.text()

            // Remove loading indicator
            document.body.removeChild(loadingMsg)

            const title = prompt(`AI生成的风格描述：\n\n${aiPrompt}\n\n请输入歌曲标题：`, `${artistName} Style`)
            if (!title) return

            // Generate song with the AI prompt
            if (!this.currentUser) {
                showToast("请先登录")
                this.showModal("loginModal")
                return
            }

            const songFormData = new FormData()
            songFormData.append("userId", this.currentUser.userId)
            songFormData.append("title", title)
            songFormData.append("prompt", aiPrompt) // Use the AI-generated prompt
            songFormData.append("personaId", "custom") // Mark as custom
            songFormData.append("artistClipId", "default")
            songFormData.append("mv", "chirp-v3-5")

            const songResponse = await fetch(`${CONFIG.BASE_URL}/api/songs/artist`, {
                method: "POST",
                body: songFormData,
            })
            const songData = await songResponse.json()

            if (songData.code === 200) {
                showToast(`创作任务已提交！\n使用AI生成的 ${artistName} 风格描述\n请在"我的作品"中查看进度`)
                this.navigateTo("works")
            } else {
                throw new Error(songData.message || "创作失败")
            }
        } catch (error) {
            showToast("生成失败：" + error.message)
            console.error("Add custom artist error:", error)
        }
    },

    // Handle form submission for custom creation mode
    handleCustomCreate(event) {
        event.preventDefault()
        if (!this.currentUser) {
            showToast("请先登录")
            this.showModal("loginModal")
            return
        }

        const form = event.target
        const title = form.elements.title.value
        const prompt = form.elements.prompt.value
        const lyrics = form.elements.lyrics.value
        const tags = form.elements.tags.value
        const instrumental = form.elements.instrumental.checked

        try {
            const formData = new FormData()
            formData.append("userId", this.currentUser.userId)
            formData.append("title", title)
            formData.append("prompt", prompt)
            if (lyrics) formData.append("lyrics", lyrics) // Only append if lyrics are provided
            formData.append("tags", tags)
            formData.append("instrumental", instrumental)
            formData.append("mv", "chirp-v3-5") // Defaulting to chirp-v3-5

            const response = fetch(`${CONFIG.BASE_URL}/api/songs/custom`, {
                method: "POST",
                body: formData,
            })

            // Make sure to await the fetch call and the response.json() call
            response
                .then((res) => res.json())
                .then((data) => {
                    if (data.code === 200) {
                        showToast('创作任务已提交！请在"我的作品"中查看进度')
                        this.navigateTo("works")
                    } else {
                        showToast(data.msg || "创作失败")
                    }
                })
                .catch((error) => {
                    console.error("Custom creation error:", error)
                    showToast("创作失败，请检查网络连接")
                })
        } catch (error) {
            console.error("Custom creation error (outer catch):", error)
            showToast("创作失败，请检查网络连接")
        }
    },
}

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    APP.init()
    APP.checkPaymentSuccess() // Check for payment status on page load
})

// Close modals if clicking outside them
window.onclick = (event) => {
    const modals = document.getElementsByClassName("modal")
    for (let i = 0; i < modals.length; i++) {
        if (event.target === modals[i]) {
            modals[i].style.display = "none"
        }
    }
}

// Update user info on window load to reflect any changes (like after payment)
window.addEventListener("load", () => {
    APP.updateUserUI()
})
