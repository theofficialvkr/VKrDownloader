// javascript.js - VKrDownloader with Fixed Search Results & iFrame Support

class VKrDownloader {
    constructor() {
        this.API_BASE_URL = 'https://vkrdownloader.org/server';
        this.API_KEY = 'vkrdownloader';
        
        // DOM Elements
        this.inputUrl = document.getElementById('inputUrl');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.loading = document.getElementById('loading');
        this.container = document.getElementById('container');
        this.thumb = document.getElementById('thumb');
        this.title = document.getElementById('title');
        this.description = document.getElementById('description');
        this.uploader = document.getElementById('uploader');
        this.duration = document.getElementById('duration');
        this.extractor = document.getElementById('extractor');
        this.downloadDiv = document.getElementById('download');
        this.downloadURLDiv = document.getElementById('downloadURL');
        this.searchResults = document.getElementById('searchResults');
        this.searchGrid = document.getElementById('searchGrid');
        this.searchCount = document.getElementById('searchCount');
        this.searchBack = document.getElementById('searchBack');
        this.resultsClose = document.getElementById('resultsClose');
        this.urlCopy = document.getElementById('urlCopy');
        this.directUrl = document.getElementById('directUrl');
        this.formatFilter = document.getElementById('formatFilter');
        this.fab = document.getElementById('fab');
        this.themeToggle = document.getElementById('themeToggle');
        this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
        this.inputClear = document.getElementById('inputClear');
        this.inputPaste = document.getElementById('inputPaste');
        
        // State
        this.currentVideoData = null;
        this.currentSearchResults = [];
        this.isSearchMode = false;
        this.currentVideoUrl = '';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupTheme();
        this.setupPreloader();
        this.createParticles();
        this.setupMobileMenu();
        this.setupSmoothScroll();
    }
    
    setupEventListeners() {
        // Main download button
        this.downloadBtn.addEventListener('click', () => this.handleDownload());
        
        // Enter key in input
        this.inputUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleDownload();
            }
        });
        
        // Input actions
        this.inputClear.addEventListener('click', () => {
            this.inputUrl.value = '';
            this.inputUrl.focus();
        });
        
        this.inputPaste.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                this.inputUrl.value = text;
                this.showNotification('Pasted from clipboard!', 'success');
            } catch (err) {
                this.showNotification('Unable to paste from clipboard', 'error');
            }
        });
        
        // Search back button
        this.searchBack.addEventListener('click', () => {
            this.hideSearchResults();
        });
        
        // Results close button
        this.resultsClose.addEventListener('click', () => {
            this.hideResults();
        });
        
        // URL copy button
        this.urlCopy.addEventListener('click', () => {
            if (this.directUrl && this.directUrl.value) {
                this.copyToClipboard(this.directUrl.value);
            }
        });
        
        // Format filter
        if (this.formatFilter) {
            this.formatFilter.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn')) {
                    // Update active button
                    this.formatFilter.querySelectorAll('.filter-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    e.target.classList.add('active');
                    
                    // Filter formats
                    const filter = e.target.dataset.filter;
                    this.filterFormats(filter);
                }
            });
        }
        
        // FAB
        this.fab.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Mobile menu toggle
        if (this.mobileMenuToggle) {
            this.mobileMenuToggle.addEventListener('click', () => {
                document.querySelector('.nav-menu').classList.toggle('show');
            });
        }
        
        // Smooth scroll for nav links
        document.querySelectorAll('[data-scroll]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const headerOffset = 80;
                    const elementPosition = targetElement.offsetTop;
                    const offsetPosition = elementPosition - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update active nav link
                    document.querySelectorAll('.nav-link').forEach(navLink => {
                        navLink.classList.remove('active');
                    });
                    link.classList.add('active');
                    
                    // Close mobile menu if open
                    document.querySelector('.nav-menu').classList.remove('show');
                }
            });
        });
    }
    
    setupTheme() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('vkr_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
        this.applyTheme(savedTheme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('vkr_theme', newTheme);
        this.updateThemeIcon(newTheme);
        this.applyTheme(newTheme);
    }
    
    updateThemeIcon(theme) {
        const icon = this.themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
    
    applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === 'light') {
            root.style.setProperty('--dark-1', '#f8fafc');
            root.style.setProperty('--dark-2', '#f1f5f9');
            root.style.setProperty('--dark-3', '#e2e8f0');
            root.style.setProperty('--dark-4', '#cbd5e1');
            
            root.style.setProperty('--light-1', '#0f172a');
            root.style.setProperty('--light-2', '#1e293b');
            root.style.setProperty('--light-3', '#334155');
            root.style.setProperty('--light-4', '#475569');
            
            root.style.setProperty('--gray-1', '#475569');
            root.style.setProperty('--gray-2', '#64748b');
            root.style.setProperty('--gray-3', '#94a3b8');
        } else {
            root.style.setProperty('--dark-1', '#0f172a');
            root.style.setProperty('--dark-2', '#1e293b');
            root.style.setProperty('--dark-3', '#334155');
            root.style.setProperty('--dark-4', '#475569');
            
            root.style.setProperty('--light-1', '#f8fafc');
            root.style.setProperty('--light-2', '#f1f5f9');
            root.style.setProperty('--light-3', '#e2e8f0');
            root.style.setProperty('--light-4', '#cbd5e1');
            
            root.style.setProperty('--gray-1', '#94a3b8');
            root.style.setProperty('--gray-2', '#64748b');
            root.style.setProperty('--gray-3', '#475569');
        }
    }
    
    setupPreloader() {
        // Hide preloader after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.querySelector('.preloader').classList.add('loaded');
            }, 1000);
        });
    }
    
    createParticles() {
        const particlesContainer = document.querySelector('.particles-container');
        if (!particlesContainer) return;
        
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random properties
            const size = Math.random() * 5 + 2;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 5;
            const color = Math.random() > 0.5 ? 'var(--primary)' : 'var(--secondary)';
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${posX}%;
                top: ${posY}%;
                background: ${color};
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
                opacity: 0.3;
            `;
            
            particlesContainer.appendChild(particle);
        }
    }
    
    setupMobileMenu() {
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const navMenu = document.querySelector('.nav-menu');
            const toggleBtn = document.querySelector('.mobile-menu-toggle');
            
            if (navMenu && navMenu.classList.contains('show') && 
                !navMenu.contains(e.target) && 
                toggleBtn && !toggleBtn.contains(e.target)) {
                navMenu.classList.remove('show');
            }
        });
    }
    
    setupSmoothScroll() {
        // Add scroll animation to elements
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        document.querySelectorAll('.feature-card, .platform-card, .step').forEach(el => {
            observer.observe(el);
        });
    }
    
    async handleDownload() {
        const input = this.inputUrl.value.trim();
        
        if (!input) {
            this.showNotification('Please enter a video URL or search term', 'error');
            this.shakeElement(this.inputUrl);
            return;
        }
        
        this.showLoading();
        this.hideResults();
        this.hideSearchResults();
        
        try {
            // Store current input
            this.currentVideoUrl = input;
            
            // First, determine if it's a URL or search term
            const isUrl = this.isValidUrl(input);
            
            if (isUrl) {
                // It's a URL - fetch video data
                const data = await this.fetchVideoData(input);
                this.displayVideoData(data);
                this.trackEvent('video_analyze', {
                    'event_category': 'download',
                    'event_label': this.getDomainFromUrl(input),
                    'value': 1
                });
            } else {
                // It's a search term
                const results = await this.fetchSearchResults(input);
                this.displaySearchResults(results, input);
                this.trackEvent('search', {
                    'event_category': 'search',
                    'event_label': input,
                    'value': results.length
                });
            }
        } catch (error) {
            console.error('Download error:', error);
            
            // Determine error message based on input type
            const errorMsg = this.isValidUrl(input) 
                ? `Unable to fetch video information: ${error.message}`
                : `Search failed: ${error.message}`;
            
            this.showNotification(errorMsg, 'error');
            
            // Show fallback for URLs
            if (this.isValidUrl(input)) {
                this.showDirectDownloadFallback(input);
            }
        } finally {
            this.hideLoading();
        }
    }
    
    isValidUrl(string) {
        // Updated URL validation
        try {
            // Try to create a URL object
            const url = new URL(string);
            
            // Check if it has a valid protocol
            if (!url.protocol.match(/^https?:$/)) {
                return false;
            }
            
            // Check if it has a hostname
            if (!url.hostname) {
                return false;
            }
            
            return true;
            
        } catch (_) {
            // If URL parsing fails, it's not a valid URL
            return false;
        }
    }
    
    async fetchVideoData(url) {
        const encodedUrl = encodeURIComponent(url);
        const apiUrl = `${this.API_BASE_URL}?api_key=${this.API_KEY}&vkr=${encodedUrl}`;
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(30000)
        });
        
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check for API errors
        if (data.success === false) {
            throw new Error(data.error?.message || 'API returned an error');
        }
        
        return data;
    }
    
    async fetchSearchResults(query) {
        const encodedQuery = encodeURIComponent(query);
        const apiUrl = `${this.API_BASE_URL}?api_key=${this.API_KEY}&vkr=${encodedQuery}`;
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(30000)
        });
        
        if (!response.ok) {
            throw new Error(`Search failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle search results from the new API format
        if (data.data && data.data.results) {
            // Convert object of results to array
            const resultsObj = data.data.results;
            const resultsArray = Object.keys(resultsObj).map(key => {
                const item = resultsObj[key];
                return {
                    id: item.id,
                    title: item.title,
                    thumbnail: item.thumb,
                    duration: item.duration,
                    uploader: item.uploader,
                    views: item.views,
                    url: `https://www.youtube.com/watch?v=${item.id}`
                };
            });
            return resultsArray;
        } else if (Array.isArray(data)) {
            return data;
        } else if (data.results && Array.isArray(data.results)) {
            return data.results;
        } else if (data.success && data.data && Array.isArray(data.data)) {
            return data.data;
        } else {
            throw new Error('No search results found');
        }
    }
    
    showLoading() {
        if (this.loading) {
            this.loading.style.display = 'flex';
        }
        
        if (this.downloadBtn) {
            this.downloadBtn.disabled = true;
            
            // Update button text with loading animation
            const buttonContent = this.downloadBtn.querySelector('.button-content span');
            if (buttonContent) {
                const originalText = buttonContent.textContent;
                buttonContent.textContent = 'Processing...';
                this.downloadBtn.dataset.originalText = originalText;
            }
        }
    }
    
    hideLoading() {
        if (this.loading) {
            this.loading.style.display = 'none';
        }
        
        if (this.downloadBtn) {
            this.downloadBtn.disabled = false;
            
            // Restore original button text
            const buttonContent = this.downloadBtn.querySelector('.button-content span');
            if (buttonContent) {
                const originalText = this.downloadBtn.dataset.originalText || 'Extract & Download';
                buttonContent.textContent = originalText;
            }
        }
    }
    
    displayVideoData(data) {
        // Clear previous results
        this.clearContainers();
        
        // Store video data
        this.currentVideoData = data;
        
        // Extract video info
        const videoInfo = data.data || data;
        
        // Display video preview
        this.displayVideoPreview(videoInfo);
        
        // Display video metadata
        this.displayVideoMetadata(videoInfo);
        
        // Display download formats
        this.displayDownloadFormats(videoInfo);
        
        // Add iFrame download buttons
        this.addIframeDownloadButtons(videoInfo);
        
        // Set direct download URL
        this.setDirectDownloadUrl(videoInfo);
        
        // Show results container
        this.showResults();
        
        // Scroll to results
        setTimeout(() => {
            if (this.container) {
                this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
    }
    
    displaySearchResults(results, query) {
        // Store search results
        this.currentSearchResults = results;
        
        // Update search count
        if (this.searchCount) {
            this.searchCount.textContent = `${results.length} results found for "${query}"`;
        }
        
        // Clear previous results
        if (this.searchGrid) {
            this.searchGrid.innerHTML = '';
        }
        
        // Display results
        if (!results || results.length === 0) {
            if (this.searchGrid) {
                this.searchGrid.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search"></i>
                        <h3>No results found</h3>
                        <p>Try a different search term or check your spelling.</p>
                    </div>
                `;
            }
        } else {
            results.forEach((result, index) => {
                if (this.searchGrid) {
                    const card = this.createSearchCard(result, index);
                    this.searchGrid.appendChild(card);
                }
            });
        }
        
        // Show search results container
        this.showSearchResults();
        
        // Scroll to results
        setTimeout(() => {
            if (this.searchResults) {
                this.searchResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
    }
    
    createSearchCard(video, index) {
        const card = document.createElement('div');
        card.className = 'search-card';
        
        const thumbnail = video.thumbnail || video.thumb || 
                         `https://via.placeholder.com/320x180/1e293b/ffffff?text=${encodeURIComponent(video.title || 'Video')}`;
        const title = video.title || video.name || 'Untitled Video';
        const channel = video.uploader || video.channel || video.author || 'Unknown Channel';
        const duration = video.duration || '';
        const description = video.description || '';
        
        card.innerHTML = `
            <div class="search-thumbnail">
                <img src="${thumbnail}" alt="${title}" loading="lazy">
                ${duration ? `<span class="video-duration">${this.formatDurationFromString(duration)}</span>` : ''}
            </div>
            <div class="search-content">
                <h3 class="search-title">${DOMPurify.sanitize(title)}</h3>
                <div class="search-channel">
                    <i class="fas fa-user-circle"></i>
                    <span>${DOMPurify.sanitize(channel)}</span>
                </div>
                ${video.views ? `
                    <div class="search-views">
                        <i class="fas fa-eye"></i>
                        <span>${this.formatViews(video.views)} views</span>
                    </div>
                ` : ''}
                ${description ? `
                    <p class="search-desc">${DOMPurify.sanitize(this.truncateText(description, 120))}</p>
                ` : ''}
                <div class="search-actions">
                    <button class="search-download-btn" data-index="${index}">
                        <i class="fas fa-download"></i> Download
                    </button>
                    ${video.url ? `
                        <button class="search-preview-btn" data-index="${index}">
                            <i class="fas fa-play"></i> Preview
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Add event listeners
        const downloadBtn = card.querySelector('.search-download-btn');
        const previewBtn = card.querySelector('.search-preview-btn');
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.downloadSearchResult(index);
            });
        }
        
        if (previewBtn) {
            previewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.previewSearchResult(index);
            });
        }
        
        // Whole card click
        card.addEventListener('click', () => {
            this.downloadSearchResult(index);
        });
        
        return card;
    }
    
    downloadSearchResult(index) {
        const video = this.currentSearchResults[index];
        if (video && video.url) {
            this.inputUrl.value = video.url;
            this.handleDownload();
        } else {
            this.showNotification('No download URL available for this video', 'error');
        }
    }
    
    previewSearchResult(index) {
        const video = this.currentSearchResults[index];
        if (video && video.url) {
            window.open(video.url, '_blank');
        }
    }
    
    clearContainers() {
        if (this.thumb) this.thumb.innerHTML = '';
        if (this.title) this.title.innerHTML = '';
        if (this.description) this.description.innerHTML = '';
        if (this.uploader) this.uploader.innerHTML = '';
        if (this.duration) this.duration.innerHTML = '';
        if (this.extractor) this.extractor.innerHTML = '';
        if (this.downloadDiv) this.downloadDiv.innerHTML = '';
        if (this.downloadURLDiv) this.downloadURLDiv.innerHTML = '';
    }
    
    displayVideoPreview(videoInfo) {
        let previewHtml = '';
        
        if (videoInfo.thumbnail) {
            previewHtml = `
                <div class="video-preview-thumbnail" style="background-image: url('${videoInfo.thumbnail}')">
                    <div class="play-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <video class="video-player-element" controls style="display: none;">
                    ${videoInfo.downloads && videoInfo.downloads[0] && videoInfo.downloads[0].url ? 
                      `<source src="${videoInfo.downloads[0].url}" type="video/mp4">` : ''}
                </video>
            `;
        } else {
            previewHtml = `
                <div class="video-preview-placeholder">
                    <i class="fas fa-video"></i>
                    <p>Video Preview</p>
                </div>
            `;
        }
        
        if (this.thumb) {
            this.thumb.innerHTML = previewHtml;
        }
        
        // Add click event for play button
        setTimeout(() => {
            const playOverlay = this.thumb ? this.thumb.querySelector('.play-overlay') : null;
            if (playOverlay) {
                playOverlay.addEventListener('click', () => {
                    const thumbnail = this.thumb.querySelector('.video-preview-thumbnail');
                    const videoElement = this.thumb.querySelector('.video-player-element');
                    
                    if (thumbnail && videoElement) {
                        thumbnail.style.display = 'none';
                        videoElement.style.display = 'block';
                        videoElement.play().catch(e => console.log('Auto-play failed:', e));
                    }
                });
            }
        }, 100);
    }
    
    displayVideoMetadata(videoInfo) {
        // Title
        if (this.title && videoInfo.title) {
            this.title.textContent = DOMPurify.sanitize(videoInfo.title);
        }
        
        // Description
        if (this.description && videoInfo.description) {
            const shortDesc = this.truncateText(videoInfo.description, 200);
            this.description.innerHTML = `
                <p>${DOMPurify.sanitize(shortDesc)}</p>
                ${videoInfo.description.length > 200 ? `
                    <button class="show-more-btn" onclick="this.previousElementSibling.textContent = '${this.escapeHtml(videoInfo.description)}'; this.remove()">
                        Show More
                    </button>
                ` : ''}
            `;
        }
        
        // Uploader/Channel
        if (this.uploader && videoInfo.channel) {
            this.uploader.innerHTML = `
                <i class="fas fa-user"></i>
                <span>${DOMPurify.sanitize(videoInfo.channel)}</span>
            `;
        }
        
        // Duration
        if (this.duration && videoInfo.duration) {
            this.duration.innerHTML = `
                <i class="fas fa-clock"></i>
                <span>${this.formatDuration(videoInfo.duration)}</span>
            `;
        }
        
        // Source
        if (this.extractor && videoInfo.source) {
            const source = this.getDomainFromUrl(videoInfo.source) || videoInfo.source;
            this.extractor.innerHTML = `
                <i class="fas fa-globe"></i>
                <span>${DOMPurify.sanitize(source)}</span>
            `;
        }
    }
    
    displayDownloadFormats(videoInfo) {
        if (!this.downloadDiv) return;
        
        if (!videoInfo.downloads || videoInfo.downloads.length === 0) {
            this.downloadDiv.innerHTML = `
                <div class="no-formats">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>No download formats available</h4>
                    <p>Try the direct download link below or check if the URL is correct.</p>
                </div>
            `;
            return;
        }
        
        // Group formats by type for filtering
        let formatsHtml = '';
        
        videoInfo.downloads.forEach((download, index) => {
            const quality = download.quality || download.format_id || download.format || `Format ${index + 1}`;
            const extension = download.ext || 'mp4';
            const size = download.size || 'Unknown size';
            const type = this.getFormatType(quality, extension);
            const color = this.getFormatColor(type);
            
            formatsHtml += `
                <div class="format-card" data-type="${type}" style="border-left-color: ${color};">
                    <div class="format-header">
                        <span class="format-quality">${quality.toUpperCase()}</span>
                        <span class="format-size">${size}</span>
                    </div>
                    <div class="format-details">
                        ${download.source ? `<span><i class="fas fa-server"></i> ${download.source}</span>` : ''}
                        <span><i class="fas fa-file"></i> ${extension.toUpperCase()}</span>
                        <span><i class="fas fa-tag"></i> ${type.toUpperCase()}</span>
                    </div>
                    <a href="${download.url}" 
                       class="download-btn" 
                       target="_blank"
                       data-quality="${quality}"
                       data-format="${extension}"
                       style="background: ${color};"
                       onclick="window.vkrDownloader.trackDownload('${quality}', '${extension}')">
                        <i class="fas fa-download"></i> Download ${extension.toUpperCase()}
                    </a>
                </div>
            `;
        });
        
        this.downloadDiv.innerHTML = formatsHtml;
    }
    
    addIframeDownloadButtons(videoInfo) {
        if (!this.downloadDiv || !this.currentVideoUrl) return;
        
        // Add iFrame buttons section
        const iframeSection = document.createElement('div');
        iframeSection.className = 'iframe-section';
        iframeSection.innerHTML = `
            <div class="section-header">
                <h4>
                    <i class="fas fa-external-link-alt"></i>
                    Quick Download Buttons
                </h4>
                <p class="section-subtitle">One-click download buttons for common formats</p>
            </div>
            <div class="iframe-buttons-container">
                <div class="iframe-buttons-grid">
                    ${this.generateIframeButtons()}
                </div>
            </div>
        `;
        
        this.downloadDiv.appendChild(iframeSection);
    }
    
    generateIframeButtons() {
        const qualities = ['mp3', '360', '480', '720', '1080'];
        const videoUrl = encodeURIComponent(this.currentVideoUrl);
        
        return qualities.map(quality => {
            const qualityName = quality === 'mp3' ? 'MP3 Audio' : `${quality}p Video`;
            const icon = quality === 'mp3' ? 'fa-music' : 'fa-video';
            
            return `
                <div class="iframe-button-wrapper">
                    <iframe 
                        style="border: 0; outline: none; width: 100%; min-width: 150px; max-height: 45px; height: 45px !important; overflow: hidden;" 
                        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads allow-downloads-without-user-activation" 
                        scrolling="no"
                        src="https://vkrdownloader.org/server/apibtn?q=${quality}&vkr=${videoUrl}">
                    </iframe>
                    <div class="iframe-label">
                        <i class="fas ${icon}"></i>
                        <span>${qualityName}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    filterFormats(filter) {
        if (!this.downloadDiv) return;
        
        const formatCards = this.downloadDiv.querySelectorAll('.format-card');
        
        formatCards.forEach(card => {
            const type = card.dataset.type;
            
            if (filter === 'all' || type === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    getFormatType(quality, extension) {
        const qualityLower = quality.toLowerCase();
        const extLower = extension.toLowerCase();
        
        if (extLower === 'mp3' || extLower === 'm4a' || qualityLower.includes('audio')) {
            return 'audio';
        } else if (qualityLower.includes('1080') || qualityLower.includes('4k') || qualityLower.includes('hd')) {
            return 'hd';
        } else if (qualityLower.includes('720') || qualityLower.includes('480') || qualityLower.includes('360')) {
            return 'video';
        } else {
            return 'video';
        }
    }
    
    getFormatColor(type) {
        const colors = {
            'video': '#6366f1',
            'audio': '#10b981',
            'hd': '#ec4899'
        };
        
        return colors[type] || '#6366f1';
    }
    
    setDirectDownloadUrl(videoInfo) {
        if (!this.directUrl) return;
        
        const originalInput = this.currentVideoUrl;
        const directUrl = `https://vkrdownloader.org/download.php?vkr=${encodeURIComponent(originalInput)}`;
        
        this.directUrl.value = directUrl;
    }
    
    showDirectDownloadFallback(url) {
        this.clearContainers();
        
        const domain = this.getDomainFromUrl(url);
        
        if (this.title) {
            this.title.innerHTML = `<h3>Direct Download Available</h3>`;
        }
        
        if (this.description) {
            this.description.innerHTML = `
                <p>Unable to fetch detailed information. Here's a direct download link for the video:</p>
            `;
        }
        
        if (this.downloadDiv) {
            this.downloadDiv.innerHTML = `
                <div class="format-card" style="border-left-color: #6366f1;">
                    <div class="format-header">
                        <span class="format-quality">DIRECT DOWNLOAD</span>
                        <span class="format-size">Auto-detected format</span>
                    </div>
                    <div class="format-details">
                        <span><i class="fas fa-globe"></i> ${domain}</span>
                        <span><i class="fas fa-file"></i> MP4</span>
                        <span><i class="fas fa-tag"></i> VIDEO</span>
                    </div>
                    <a href="https://vkrdownloader.org/download.php?vkr=${encodeURIComponent(url)}" 
                       class="download-btn" 
                       target="_blank"
                       style="background: #6366f1;">
                        <i class="fas fa-download"></i> Download Video
                    </a>
                </div>
            `;
        }
        
        // Add iFrame buttons for direct download too
        this.currentVideoUrl = url;
        this.addIframeDownloadButtons({});
        
        this.showResults();
    }
    
    showResults() {
        if (this.container) {
            this.container.style.display = 'block';
        }
        this.hideSearchResults();
    }
    
    hideResults() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }
    
    showSearchResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'block';
        }
        this.hideResults();
    }
    
    hideSearchResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'none';
        }
    }
    
    // Utility Methods
    getDomainFromUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch {
            return 'unknown';
        }
    }
    
    formatDuration(seconds) {
        if (!seconds || isNaN(seconds)) return 'N/A';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    formatDurationFromString(durationStr) {
        // Handle format like "00 hr 05 min 14 sec"
        if (!durationStr) return '';
        
        const match = durationStr.match(/(\d+)\s*hr\s*(\d+)\s*min\s*(\d+)\s*sec/);
        if (match) {
            const hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const seconds = parseInt(match[3]);
            
            if (hours > 0) {
                return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        return durationStr;
    }
    
    formatViews(views) {
        if (!views) return '0';
        
        if (views >= 1000000) {
            return (views / 1000000).toFixed(1) + 'M';
        } else if (views >= 1000) {
            return (views / 1000).toFixed(1) + 'K';
        }
        return views.toString();
    }
    
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/'/g, "\\'");
    }
    
    // UI Methods
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'error' ? 'exclamation-circle' : 
                     type === 'success' ? 'check-circle' : 'info-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Add close event
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.remove();
            });
        }
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    shakeElement(element) {
        if (!element) return;
        
        element.classList.add('shake');
        setTimeout(() => {
            if (element) {
                element.classList.remove('shake');
            }
        }, 500);
    }
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Link copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Copy failed:', err);
            this.showNotification('Failed to copy link', 'error');
        });
    }
    
    trackDownload(quality, format) {
        this.trackEvent('download_start', {
            'event_category': 'video',
            'event_label': `${quality}_${format}`,
            'value': 1
        });
    }
    
    trackEvent(eventName, params) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, params);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.vkrDownloader = new VKrDownloader();
});

// Add CSS for additional elements
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .video-preview-thumbnail {
        width: 100%;
        height: 400px;
        background-size: cover;
        background-position: center;
        border-radius: var(--radius-lg);
        overflow: hidden;
        position: relative;
        cursor: pointer;
    }
    
    .play-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 4rem;
        transition: var(--transition);
    }
    
    .play-overlay:hover {
        background: rgba(0, 0, 0, 0.7);
    }
    
    .video-player-element {
        width: 100%;
        height: 400px;
        border-radius: var(--radius-lg);
        background: #000;
    }
    
    .video-preview-placeholder {
        width: 100%;
        height: 400px;
        background: rgba(15, 23, 42, 0.6);
        border-radius: var(--radius-lg);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--gray-1);
    }
    
    .video-preview-placeholder i {
        font-size: 4rem;
        margin-bottom: 1rem;
    }
    
    .show-more-btn {
        background: none;
        border: none;
        color: var(--primary);
        cursor: pointer;
        font-weight: 600;
        padding: 5px 0;
        margin-top: 10px;
        display: inline-block;
    }
    
    .show-more-btn:hover {
        text-decoration: underline;
    }
    
    .no-results {
        text-align: center;
        padding: 4rem;
        grid-column: 1 / -1;
    }
    
    .no-results i {
        font-size: 4rem;
        color: var(--gray-2);
        margin-bottom: 1.5rem;
    }
    
    .no-results h3 {
        color: var(--light-1);
        margin-bottom: 1rem;
    }
    
    .no-results p {
        color: var(--gray-1);
    }
    
    /* iFrame Download Buttons */
    .iframe-section {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .iframe-section .section-header {
        text-align: center;
        margin-bottom: 1.5rem;
    }
    
    .iframe-section h4 {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        color: var(--light-1);
        font-size: 1.3rem;
        margin-bottom: 0.5rem;
    }
    
    .iframe-section h4 i {
        color: var(--primary);
    }
    
    .iframe-section .section-subtitle {
        color: var(--gray-1);
        font-size: 0.95rem;
    }
    
    .iframe-buttons-container {
        background: rgba(15, 23, 42, 0.6);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
    }
    
    .iframe-buttons-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
    }
    
    .iframe-button-wrapper {
        text-align: center;
    }
    
    .iframe-button-wrapper iframe {
        border-radius: var(--radius);
        margin-bottom: 0.5rem;
        display: block;
    }
    
    .iframe-label {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--gray-1);
        font-size: 0.9rem;
        font-weight: 500;
    }
    
    .iframe-label i {
        color: var(--primary);
    }
    
    /* Search views */
    .search-views {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--gray-2);
        font-size: 0.85rem;
        margin-bottom: 0.5rem;
    }
    
    .search-views i {
        font-size: 0.8rem;
    }
    
    /* Mobile menu styles */
    @media (max-width: 992px) {
        .nav-menu {
            position: fixed;
            top: 80px;
            left: 0;
            width: 100%;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(20px);
            padding: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: none;
            flex-direction: column;
            gap: 0.5rem;
            z-index: 999;
        }
        
        .nav-menu.show {
            display: flex;
        }
        
        .nav-link {
            padding: 1rem;
            border-radius: var(--radius);
        }
    }
    
    /* Animation classes */
    .animate-in {
        animation: slide-up 0.6s ease-out;
    }
    
    /* Notification styles */
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgba(30, 41, 59, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 15px 20px;
        display: flex;
        align-items: center;
        gap: 15px;
        color: white;
        z-index: 9999;
        transform: translateX(120%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        max-width: 400px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.success {
        border-left: 4px solid #10b981;
    }
    
    .notification.error {
        border-left: 4px solid #ef4444;
    }
    
    .notification.info {
        border-left: 4px solid #6366f1;
    }
    
    .notification i {
        font-size: 1.2rem;
    }
    
    .notification.success i {
        color: #10b981;
    }
    
    .notification.error i {
        color: #ef4444;
    }
    
    .notification.info i {
        color: #6366f1;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        margin-left: auto;
        padding: 5px;
        border-radius: 6px;
        transition: all 0.2s;
    }
    
    .notification-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
    }
    
    /* Theme transition */
    * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }
    
    /* Light theme specific */
    [data-theme="light"] .download-card,
    [data-theme="light"] .results-container,
    [data-theme="light"] .search-results-container,
    [data-theme="light"] .feature-card,
    [data-theme="light"] .platform-card,
    [data-theme="light"] .format-card,
    [data-theme="light"] .search-card {
        background: rgba(255, 255, 255, 0.8);
        border-color: rgba(0, 0, 0, 0.1);
    }
    
    [data-theme="light"] .header {
        background: rgba(255, 255, 255, 0.9);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    [data-theme="light"] .nav-link {
        color: rgba(0, 0, 0, 0.7);
    }
    
    [data-theme="light"] .nav-link:hover,
    [data-theme="light"] .nav-link.active {
        color: #000;
        background: rgba(0, 0, 0, 0.05);
    }
    
    [data-theme="light"] .theme-toggle {
        border-color: rgba(0, 0, 0, 0.1);
        background: rgba(255, 255, 255, 0.9);
        color: #000;
    }
    
    [data-theme="light"] .input-field {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(0, 0, 0, 0.1);
        color: #000;
    }
    
    [data-theme="light"] .input-field::placeholder {
        color: rgba(0, 0, 0, 0.5);
    }
    
    [data-theme="light"] .tag {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(0, 0, 0, 0.1);
        color: rgba(0, 0, 0, 0.7);
    }
    
    [data-theme="light"] .feature {
        color: rgba(0, 0, 0, 0.7);
    }
    
    [data-theme="light"] .hero-badge {
        background: rgba(99, 102, 241, 0.1);
        border-color: rgba(99, 102, 241, 0.2);
        color: var(--primary);
    }
`;
document.head.appendChild(additionalStyles);

// Add global utility functions
window.formatDuration = function(seconds) {
    const vkr = window.vkrDownloader;
    return vkr ? vkr.formatDuration(seconds) : 'N/A';
};

window.copyToClipboard = function(text) {
    const vkr = window.vkrDownloader;
    if (vkr) vkr.copyToClipboard(text);
};
