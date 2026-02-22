<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Request Feature - VanFact API">
    <meta name="theme-color" content="#0f0f1a">
    
    <title>Request Feature | VanFact API</title>
    <link rel="icon" href="https://cdn-icons-png.flaticon.com/512/2912/2912780.png" type="image/x-icon">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --secondary: #ec4899;
            --accent: #06b6d4;
            --success: #22c55e;
            --warning: #f59e0b;
            --error: #ef4444;
            --dark: #0a0a0f;
            --darker: #050508;
            --card: #12121a;
            --border: #2a2a3a;
            --text: #f8fafc;
            --text-muted: #64748b;
            --text-secondary: #94a3b8;
            --gradient-1: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background: var(--darker);
            color: var(--text);
            line-height: 1.6;
            min-height: 100vh;
        }
        
        .bg-effects {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            overflow: hidden;
        }
        
        .bg-effects::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: 
                radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%);
            animation: rotate 60s linear infinite;
        }
        
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        /* Header */
        .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 70px;
            background: rgba(10, 10, 15, 0.9);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--border);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
        }
        
        .logo {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.5rem;
            font-weight: 700;
            background: var(--gradient-1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
        }
        
        .nav-links a {
            color: var(--text-muted);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
        }
        
        .nav-links a:hover {
            color: var(--text);
        }
        
        /* Main Content */
        .main-content {
            padding-top: 100px;
            max-width: 800px;
            margin: 0 auto;
            padding-left: 2rem;
            padding-right: 2rem;
            padding-bottom: 4rem;
        }
        
        .page-header {
            text-align: center;
            margin-bottom: 3rem;
        }
        
        .page-header h1 {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 2.5rem;
            margin-bottom: 1rem;
            background: var(--gradient-1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .page-header p {
            color: var(--text-secondary);
            font-size: 1.1rem;
        }
        
        /* Form Card */
        .form-card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 2.5rem;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        
        .form-label .required {
            color: var(--error);
            margin-left: 0.25rem;
        }
        
        .form-input,
        .form-textarea {
            width: 100%;
            background: var(--dark);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 1rem 1.25rem;
            color: var(--text);
            font-family: inherit;
            font-size: 1rem;
            transition: all 0.3s;
        }
        
        .form-input:focus,
        .form-textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .form-textarea {
            min-height: 120px;
            resize: vertical;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9rem;
        }
        
        .form-hint {
            margin-top: 0.5rem;
            font-size: 0.8rem;
            color: var(--text-muted);
        }
        
        .char-count {
            text-align: right;
            font-size: 0.8rem;
            color: var(--text-muted);
            margin-top: 0.25rem;
        }
        
        /* Submit Button */
        .btn-submit {
            width: 100%;
            background: var(--gradient-1);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            transition: all 0.3s;
        }
        
        .btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
        }
        
        .btn-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .btn-submit.loading i {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* Success Message */
        .success-message {
            display: none;
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid rgba(34, 197, 94, 0.3);
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
            margin-top: 2rem;
        }
        
        .success-message.show {
            display: block;
            animation: slideUp 0.5s ease-out;
        }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .success-icon {
            width: 80px;
            height: 80px;
            background: rgba(34, 197, 94, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2.5rem;
            color: var(--success);
        }
        
        .success-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        
        .success-text {
            color: var(--text-secondary);
            margin-bottom: 1.5rem;
        }
        
        .request-id {
            background: var(--dark);
            padding: 1rem;
            border-radius: 8px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9rem;
            color: var(--primary);
            margin-bottom: 1.5rem;
        }
        
        .btn-track {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: transparent;
            border: 1px solid var(--success);
            color: var(--success);
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s;
        }
        
        .btn-track:hover {
            background: rgba(34, 197, 94, 0.1);
        }
        
        /* Error Message */
        .error-message {
            display: none;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            margin-top: 2rem;
            color: var(--error);
        }
        
        .error-message.show {
            display: block;
        }
        
        /* Features Preview */
        .features-preview {
            margin-top: 4rem;
            padding-top: 3rem;
            border-top: 1px solid var(--border);
        }
        
        .features-preview h3 {
            text-align: center;
            margin-bottom: 2rem;
            font-size: 1.25rem;
            color: var(--text-secondary);
        }
        
        .feature-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            justify-content: center;
        }
        
        .feature-tag {
            background: var(--card);
            border: 1px solid var(--border);
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.875rem;
            color: var(--text-secondary);
        }
        
        /* Footer */
        footer {
            text-align: center;
            padding: 3rem 2rem;
            color: var(--text-muted);
            font-size: 0.875rem;
            border-top: 1px solid var(--border);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .header {
                padding: 0 1rem;
            }
            
            .nav-links {
                display: none;
            }
            
            .main-content {
                padding-left: 1rem;
                padding-right: 1rem;
            }
            
            .form-card {
                padding: 1.5rem;
            }
            
            .page-header h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="bg-effects"></div>
    
    <!-- Header -->
    <header class="header">
        <a href="/" class="logo">
            <i class="fas fa-rocket"></i>
            VanFact API
        </a>
        <ul class="nav-links">
            <li><a href="/">Home</a></li>
            <li><a href="/docs/apis.html">Docs</a></li>
            <li><a href="/request.html" style="color: var(--primary);">Request</a></li>
        </ul>
    </header>
    
    <!-- Main Content -->
    <main class="main-content">
        <div class="page-header">
            <h1>Request Feature</h1>
            <p>Punya ide fitur baru? Kirim request ke kami dan tim akan mereviewnya!</p>
        </div>
        
        <div class="form-card">
            <form id="requestForm">
                <div class="form-group">
                    <label class="form-label">
                        Nama Kamu <span class="required">*</span>
                    </label>
                    <input type="text" class="form-input" id="name" placeholder="Masukkan nama kamu" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">
                        Nama Fitur <span class="required">*</span>
                    </label>
                    <input type="text" class="form-input" id="feature" placeholder="Contoh: Pinterest Downloader" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">
                        Deskripsi Fitur <span class="required">*</span>
                    </label>
                    <textarea class="form-textarea" id="description" placeholder="Jelaskan fitur yang kamu inginkan..." required></textarea>
                    <div class="char-count"><span id="descCount">0</span>/500</div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">
                        Code JavaScript (Opsional)
                    </label>
                    <textarea class="form-textarea" id="code" placeholder="// Jika punya code contoh, paste disini&#10;function example() {&#10;  return 'Hello World';&#10;}" style="min-height: 150px; font-family: 'JetBrains Mono', monospace;"></textarea>
                    <div class="form-hint">
                        <i class="fas fa-info-circle"></i> 
                        Jika kamu sudah punya code atau contoh implementasi, bisa paste disini. Ini akan membantu kami mengembangkan fitur lebih cepat!
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">
                        Kontak (Opsional)
                    </label>
                    <input type="text" class="form-input" id="contact" placeholder="Email, WhatsApp, atau Telegram">
                    <div class="form-hint">Untuk kami hubungi jika ada pertanyaan tentang request ini</div>
                </div>
                
                <button type="submit" class="btn-submit" id="submitBtn">
                    <i class="fas fa-paper-plane"></i>
                    Kirim Request
                </button>
            </form>
            
            <!-- Success Message -->
            <div class="success-message" id="successMessage">
                <div class="success-icon">
                    <i class="fas fa-check"></i>
                </div>
                <div class="success-title">Request Berhasil Dikirim!</div>
                <div class="success-text">
                    Terima kasih! Tim kami akan mereview request kamu.
                </div>
                <div class="request-id" id="requestIdDisplay">
                    Request ID: <span id="requestId"></span>
                </div>
                <a href="#" class="btn-track" onclick="trackRequest(); return false;">
                    <i class="fas fa-search"></i>
                    Cek Status Request
                </a>
            </div>
            
            <!-- Error Message -->
            <div class="error-message" id="errorMessage">
                <i class="fas fa-exclamation-circle"></i>
                <span id="errorText">Terjadi kesalahan. Silakan coba lagi.</span>
            </div>
        </div>
        
        <!-- Features Preview -->
        <div class="features-preview">
            <h3>Fitur yang sering direquest:</h3>
            <div class="feature-tags">
                <span class="feature-tag"><i class="fas fa-music"></i> Spotify Downloader</span>
                <span class="feature-tag"><i class="fas fa-image"></i> Pinterest Downloader</span>
                <span class="feature-tag"><i class="fas fa-link"></i> URL Shortener</span>
                <span class="feature-tag"><i class="fas fa-qrcode"></i> QR Code Generator</span>
                <span class="feature-tag"><i class="fas fa-image"></i> Image Converter</span>
                <span class="feature-tag"><i class="fas fa-file-pdf"></i> PDF Tools</span>
                <span class="feature-tag"><i class="fas fa-robot"></i> More AI Features</span>
            </div>
        </div>
    </main>
    
    <footer>
        <p>© 2024 VanFact API • Made with <i class="fas fa-heart" style="color: var(--secondary);"></i> by Ndii</p>
    </footer>
    
    <script>
        const BASE_URL = window.location.origin + '/api';
        
        // Character count
        document.getElementById('description').addEventListener('input', function() {
            const count = this.value.length;
            document.getElementById('descCount').textContent = count;
            if (count > 500) {
                this.value = this.value.substring(0, 500);
                document.getElementById('descCount').textContent = 500;
            }
        });
        
        // Form submission
        document.getElementById('requestForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const btn = document.getElementById('submitBtn');
            const originalContent = btn.innerHTML;
            
            btn.classList.add('loading');
            btn.innerHTML = '<i class="fas fa-circle-notch"></i> Mengirim...';
            btn.disabled = true;
            
            // Hide previous messages
            document.getElementById('successMessage').classList.remove('show');
            document.getElementById('errorMessage').classList.remove('show');
            
            const data = {
                name: document.getElementById('name').value.trim(),
                feature: document.getElementById('feature').value.trim(),
                description: document.getElementById('description').value.trim(),
                code: document.getElementById('code').value.trim() || null,
                contact: document.getElementById('contact').value.trim() || null
            };
            
            try {
                const response = await fetch(`${BASE_URL}/request`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': 'ndii'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.status) {
                    // Save request ID to localStorage
                    let myRequests = JSON.parse(localStorage.getItem('myRequests') || '[]');
                    myRequests.push({
                        id: result.data.id,
                        feature: data.feature,
                        status: 'pending',
                        createdAt: new Date().toISOString()
                    });
                    localStorage.setItem('myRequests', JSON.stringify(myRequests));
                    
                    // Show success
                    document.getElementById('requestId').textContent = result.data.id;
                    document.getElementById('successMessage').classList.add('show');
                    document.getElementById('requestForm').reset();
                    document.getElementById('descCount').textContent = '0';
                } else {
                    throw new Error(result.message || 'Gagal mengirim request');
                }
                
            } catch (err) {
                document.getElementById('errorText').textContent = err.message;
                document.getElementById('errorMessage').classList.add('show');
            } finally {
                btn.classList.remove('loading');
                btn.innerHTML = originalContent;
                btn.disabled = false;
            }
        });
        
        function trackRequest() {
            const requestId = document.getElementById('requestId').textContent;
            window.location.href = `/track.html?id=${requestId}`;
        }
    </script>
</body>
</html>
