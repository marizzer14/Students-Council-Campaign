// App State
let appState = {
    isAdmin: false,
    adminCode: 'ADMIN123',
    positions: [
        { id: 'pos1', title: 'President', description: 'Student body president', order: 1 },
        { id: 'pos2', title: 'Vice President', description: 'Assistant to president', order: 2 },
        { id: 'pos3', title: 'Secretary', description: 'Records and communication', order: 3 }
    ],
    candidates: [
        { id: 'c1', positionId: 'pos1', name: 'Greg Legarto', bio: 'Candidate 1', img: 'assets/imgs/Pres1.png' },
        { id: 'c2', positionId: 'pos1', name: 'Mariel Ann Magtibay', bio: 'Candidate 2', img: 'assets/imgs/Press2.png' },
        { id: 'c3', positionId: 'pos2', name: 'John Lenard Ebalan', bio: 'Candidate 1', img: 'assets/imgs/VPress1.png' },
        { id: 'c4', positionId: 'pos2', name: 'Maricar Berunio', bio: 'Candidate 2', img: 'assets/imgs/VPress2.png' },
        { id: 'c5', positionId: 'pos3', name: 'Johnrey Serito', bio: 'Candidate 1', img: 'assets/imgs/Secretary1.png' },
        { id: 'c6', positionId: 'pos3', name: 'Jemson Ganadores ', bio: 'Candidate 2', img: 'assets/imgs/Secretary2.png' }
    ],
    votes: {},
    voters: [],
    currentVoter: null
};

// Load data
function loadData() {
    const saved = localStorage.getItem('campaignData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            appState.positions = parsed.positions || appState.positions;
            appState.candidates = parsed.candidates || appState.candidates;
            appState.votes = parsed.votes || {};
            appState.voters = parsed.voters || [];
        } catch (e) {
            console.error('Error loading data', e);
        }
    }
}

// Save data
function saveData() {
    localStorage.setItem('campaignData', JSON.stringify({
        positions: appState.positions,
        candidates: appState.candidates,
        votes: appState.votes,
        voters: appState.voters
    }));
}

// Show toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Email Confirmation via EmailJS
function sendEmailConfirmation(email, voterName, votes) {
    // Create vote summary as HTML for better formatting
    let voteSummaryHtml = '<ul style="list-style-type: none; padding-left: 0;">';
    votes.forEach(vote => {
        voteSummaryHtml += `<li style="margin-bottom: 8px; padding: 8px; background: #f8fafc; border-radius: 8px;">
            <strong>${vote.position}:</strong> ${vote.candidate}
        </li>`;
    });
    voteSummaryHtml += '</ul>';
    
    // Create plain text summary as fallback
    let voteSummaryText = '';
    votes.forEach(vote => {
        voteSummaryText += `${vote.position}: ${vote.candidate}\n`;
    });
    
    // IMPORTANT: EmailJS expects the recipient email in a specific format
    // The parameter name should match what's in your EmailJS template
    const templateParams = {
        // For the recipient - this is the MOST IMPORTANT part
        to_email: email,                    // Try this first
        email: email,                        // Alternative parameter name
        to: email,                           // Another common parameter name
        recipient: email,                     // And another
        
        // Personalization parameters
        to_name: voterName,
        voter_name: voterName,
        name: voterName,
        
        // Email content
        voter_email: email,
        vote_summary_html: voteSummaryHtml,
        vote_summary: voteSummaryText,
        vote_count: votes.length,
        total_positions: appState.positions.length,
        election_date: new Date().toLocaleDateString(),
        election_time: new Date().toLocaleTimeString(),
        
        // Subject and message
        subject: `Your Student Council Election Votes Confirmation - ${new Date().toLocaleDateString()}`,
        message: `Thank you for voting in the Student Council Election! Your voice matters.`
    };
    
    console.log('Sending email to:', email); // Debug log
    
    // Show sending status
    document.getElementById('emailDetails').innerHTML = `
        <strong>Sending to:</strong> ${email}<br>
        <strong>Status:</strong> <span style="color: #f59e0b;">⏳ Sending confirmation...</span>
    `;
    document.getElementById('emailModal').style.display = 'flex';
    
  const serviceId = 'studentcoucilcampaign'; // Replace with your service ID
    const templateId = 'template_p7kat39'; // Replace with your template ID
    
    // Send email via EmailJS
    emailjs.send(serviceId, templateId, templateParams)
        .then(function(response) {
            console.log('Email sent successfully!', response);
            
            // Show success
            document.getElementById('emailDetails').innerHTML = `
                <strong>To:</strong> ${email}<br>
                <strong>Your votes:</strong><br>
                ${votes.map(v => `• ${v.position}: ${v.candidate}`).join('<br>')}<br><br>
                <div style="background: #10b981; color: white; padding: 1rem; border-radius: 1rem; text-align: center;">
                    <strong style="font-size: 1.2rem;">✓ Email Sent Successfully!</strong><br>
                    <small>Check your inbox (and spam folder)</small>
                </div>
            `;
            showToast('✅ Confirmation email sent!', 'success');
        })
        .catch(function(error) {
            console.error('Email failed - Full error:', error);
            
            // Show detailed error
            let errorMessage = 'Email service unavailable';
            if (error.text) {
                errorMessage = error.text;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            document.getElementById('emailDetails').innerHTML = `
                <strong>To:</strong> ${email}<br>
                <strong>Your votes:</strong><br>
                ${votes.map(v => `• ${v.position}: ${v.candidate}`).join('<br>')}<br><br>
                <div style="background: #f59e0b; color: white; padding: 1rem; border-radius: 1rem; text-align: center;">
                    <strong>⚠ Email Service Unavailable</strong><br>
                    <small>Error: ${errorMessage}</small><br>
                    <small>But your vote is recorded!</small>
                    <br><br>
                    <small style="font-size: 0.8rem;">Debug: Recipient was "${email}"</small>
                </div>
            `;
            showToast('✅ Vote recorded! (Email confirmation failed)', 'success');
        });
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        document.getElementById('emailModal').style.display = 'none';
    }, 10000);
}

// Convert image file to base64 for storage
function readImageFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        reader.onerror = (e) => {
            reject(e);
        };
        reader.readAsDataURL(file);
    });
}

// Setup image upload functionality
function setupImageUpload() {
    const browseBtn = document.getElementById('browseImageBtn');
    const fileInput = document.getElementById('candidateImageUpload');
    const fileNameSpan = document.getElementById('selectedFileName');
    const previewImg = document.getElementById('previewImg');
    const hiddenInput = document.getElementById('candidateImage');
    
    if (browseBtn && fileInput) {
        // Remove existing listeners to avoid duplicates
        browseBtn.replaceWith(browseBtn.cloneNode(true));
        fileInput.replaceWith(fileInput.cloneNode(true));
        
        // Get fresh references
        const newBrowseBtn = document.getElementById('browseImageBtn');
        const newFileInput = document.getElementById('candidateImageUpload');
        const newFileNameSpan = document.getElementById('selectedFileName');
        const newPreviewImg = document.getElementById('previewImg');
        const newHiddenInput = document.getElementById('candidateImage');
        
        newBrowseBtn.addEventListener('click', function() {
            newFileInput.click();
        });
        
        newFileInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                // Show file name
                if (newFileNameSpan) {
                    newFileNameSpan.textContent = file.name;
                }
                
                // Check file size (limit to 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    showToast('Image too large. Max 2MB', 'error');
                    return;
                }
                
                try {
                    // Convert to base64
                    const base64Image = await readImageFile(file);
                    
                    // Update preview
                    if (newPreviewImg) {
                        newPreviewImg.src = base64Image;
                    }
                    
                    // Store in hidden input
                    if (newHiddenInput) {
                        newHiddenInput.value = base64Image;
                    }
                    
                    showToast('Image loaded successfully', 'success');
                } catch (error) {
                    console.error('Error reading image:', error);
                    showToast('Error loading image', 'error');
                }
            }
        });
    }
}

// Load home section
function loadHomeSection() {
    return `
        <section class="content-section active" id="homeSection">
            <div class="hero-section">
                <div class="hero-content">
                    <span class="hero-badge">STUDENT COUNCIL 2026</span>
                    <h1 class="hero-title">Survey and Poll Campaign</h1>
                    <p class="hero-description">
                        We appreciate your decision to spend a few minutes of your time to complete the poll for the campaign-leads. Your responses will help us to improve our services in the future.
                    </p>
                    <button class="vote-btn" id="homeVoteBtn">
                        <span>VOTE NOW</span>
                        <svg class="btn-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M4.16666 10H15.8333M15.8333 10L11.6667 5.83337M15.8333 10L11.6667 14.1667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="stats-preview">
                <div class="stat-card">
                    <span class="stat-number">${appState.positions.length}</span>
                    <span class="stat-label">Positions</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">${appState.candidates.length}</span>
                    <span class="stat-label">Candidates</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">${Object.keys(appState.votes).length}</span>
                    <span class="stat-label">Votes Cast</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">${appState.voters.length}</span>
                    <span class="stat-label">Voters</span>
                </div>
            </div>
        </section>
    `;
}

// Load voting section
function loadVotingSection() {
    let positionsHtml = '';
    
    if (appState.positions.length === 0) {
        positionsHtml = '<p class="no-positions">No positions available yet.</p>';
    } else {
        appState.positions.sort((a, b) => a.order - b.order).forEach(position => {
            const candidates = appState.candidates.filter(c => c.positionId === position.id);
            if (candidates.length === 0) return;
            
            let candidatesHtml = '';
            candidates.forEach(candidate => {
                const isSelected = appState.currentVoter && 
                    appState.votes[appState.currentVoter.id] && 
                    appState.votes[appState.currentVoter.id][position.id] === candidate.id;
                
                candidatesHtml += `
                    <div class="candidate-option ${isSelected ? 'selected' : ''}" 
                         data-position="${position.id}" 
                         data-candidate="${candidate.id}">
                        <img src="${candidate.img || 'https://via.placeholder.com/100'}" alt="${candidate.name}" class="candidate-image" onerror="this.src='https://via.placeholder.com/100'">
                        <div class="candidate-option-name">${candidate.name}</div>
                        <div class="candidate-option-bio">${candidate.bio || ''}</div>
                    </div>
                `;
            });
            
            positionsHtml += `
                <div class="position-voting-card" data-position-id="${position.id}">
                    <div class="position-header">
                        <h3>${position.title}</h3>
                        <p>${position.description || 'Select one candidate'}</p>
                    </div>
                    <div class="candidates-voting-grid">
                        ${candidatesHtml}
                    </div>
                </div>
            `;
        });
    }

    return `
        <section class="content-section active" id="voteSection">
            <div class="section-header">
                <h2>Cast Your Votes</h2>
                <p class="voter-greeting">Welcome, ${appState.currentVoter?.name || 'Voter'}!</p>
            </div>

            <div class="voting-instructions">
                <div class="instruction-card">
                    <div class="instruction-icon">📧</div>
                    <div class="instruction-text">
                        <h4>Your email: <span id="verifiedEmail">${appState.currentVoter?.email || ''}</span></h4>
                        <p>You'll receive email confirmation after submitting your votes</p>
                    </div>
                </div>
            </div>

            <div class="positions-voting-container">
                ${positionsHtml}
            </div>

            <div class="voting-actions">
                <button class="review-btn" id="reviewVotesBtn">Review Votes</button>
                <button class="submit-votes-btn" id="submitVotesBtn">
                    <span>Submit All Votes</span>
                </button>
            </div>
        </section>
    `;
}

// Load admin dashboard
function loadAdminDashboard() {
    let resultsHtml = '';
    
    appState.positions.forEach(position => {
        const candidates = appState.candidates.filter(c => c.positionId === position.id);
        const votesForPos = {};
        candidates.forEach(c => votesForPos[c.id] = 0);
        
        Object.values(appState.votes).forEach(voterVotes => {
            const candidateId = voterVotes[position.id];
            if (candidateId && votesForPos.hasOwnProperty(candidateId)) {
                votesForPos[candidateId]++;
            }
        });
        
        candidates.forEach(candidate => {
            const votes = votesForPos[candidate.id] || 0;
            resultsHtml += `
                <tr>
                    <td><strong>${position.title}</strong></td>
                    <td>${candidate.name}</td>
                    <td class="vote-count">${votes}</td>
                </tr>
            `;
        });
    });

    let positionsList = '';
    appState.positions.forEach(position => {
        positionsList += `
            <div class="position-item">
                <div class="position-info">
                    <h4>${position.title}</h4>
                    <p>${position.description || ''}</p>
                </div>
                <div class="position-actions">
                    <button class="edit-btn" onclick="window.editPosition('${position.id}')">Edit</button>
                    <button class="delete-btn" onclick="window.deletePosition('${position.id}')">Delete</button>
                </div>
            </div>
        `;
    });

    let candidatesList = '';
    appState.candidates.forEach(candidate => {
        const position = appState.positions.find(p => p.id === candidate.positionId);
        candidatesList += `
            <div class="candidate-item">
                <div class="candidate-info">
                    <img src="${candidate.img || 'https://via.placeholder.com/50'}" class="candidate-thumb" onerror="this.src='https://via.placeholder.com/50'">
                    <div class="candidate-details">
                        <h4>${candidate.name}</h4>
                        <p>${position?.title || 'Unknown'} - ${candidate.bio || ''}</p>
                    </div>
                </div>
                <div class="candidate-actions">
                    <button class="edit-btn" onclick="window.editCandidate('${candidate.id}')">Edit</button>
                    <button class="delete-btn" onclick="window.deleteCandidate('${candidate.id}')">Delete</button>
                </div>
            </div>
        `;
    });

    return `
        <section class="content-section active" id="adminSection">
            <div class="admin-dashboard">
                <div class="admin-header">
                    <h1>Admin Dashboard <span class="admin-badge">Admin</span></h1>
                    <button class="reset-btn" onclick="window.resetVotes()">Reset All Votes</button>
                </div>

                <div class="admin-tabs">
                    <button class="admin-tab active" data-tab="results">Results</button>
                    <button class="admin-tab" data-tab="positions">Positions</button>
                    <button class="admin-tab" data-tab="candidates">Candidates</button>
                </div>

                <div class="admin-tab-content active" id="resultsTab">
                    <table class="results-table">
                        <thead>
                            <tr>
                                <th>Position</th>
                                <th>Candidate</th>
                                <th>Votes</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${resultsHtml}
                        </tbody>
                    </table>
                </div>

                <div class="admin-tab-content" id="positionsTab">
                    <div class="admin-card">
                        <h3>Add New Position</h3>
                        <input type="text" id="newPositionTitle" placeholder="Position title" class="form-input" style="margin-bottom:1rem;">
                        <textarea id="newPositionDesc" placeholder="Description" class="form-input" style="margin-bottom:1rem;"></textarea>
                        <button class="verify-btn" id="addPositionBtn">Add Position</button>
                    </div>

                    <div class="admin-card">
                        <h3>Existing Positions</h3>
                        ${positionsList}
                    </div>
                </div>

                <div class="admin-tab-content" id="candidatesTab">
                    <div class="admin-card">
                        <h3>Add New Candidate</h3>
                        <select id="candidatePositionSelect" class="form-input" style="margin-bottom:1rem;">
                            <option value="">Select a position</option>
                            ${appState.positions.map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
                        </select>
                        <input type="text" id="candidateName" placeholder="Candidate name" class="form-input" style="margin-bottom:1rem;">
                        <textarea id="candidateBio" placeholder="Bio" class="form-input" style="margin-bottom:1rem;"></textarea>
                        
                        <!-- Image Upload Section -->
                        <div style="margin-bottom:1rem;">
                            <label style="display:block; margin-bottom:0.5rem; font-weight:600;">Candidate Photo</label>
                            <div style="display:flex; gap:1rem; align-items:center; margin-bottom:0.5rem;">
                                <input type="file" id="candidateImageUpload" accept="image/*" style="display:none;">
                                <button type="button" id="browseImageBtn" class="edit-btn" style="padding:0.8rem 1.5rem; display:flex; align-items:center; gap:0.5rem;">
                                    <span>📁</span> Browse Image
                                </button>
                                <span id="selectedFileName" style="color:#64748b;">No file selected</span>
                            </div>
                            <input type="hidden" id="candidateImage" value="">
                        </div>
                        
                        <!-- Image Preview -->
                        <div class="image-preview" id="imagePreview" style="margin-bottom:1rem;">
                            <img src="https://via.placeholder.com/100" alt="Preview" id="previewImg" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid white; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
                            <p style="color:#64748b; margin-top:0.5rem;">Image preview will appear here</p>
                        </div>
                        
                        <button class="verify-btn" id="addCandidateBtn">Add Candidate</button>
                    </div>

                    <div class="admin-card">
                        <h3>All Candidates</h3>
                        ${candidatesList}
                    </div>
                </div>
            </div>
        </section>
    `;
}

// Reset all votes
window.resetVotes = function() {
    if (confirm('Are you sure you want to reset ALL votes? This cannot be undone.')) {
        appState.votes = {};
        saveData();
        document.getElementById('mainContent').innerHTML = loadAdminDashboard();
        attachAdminListeners();
        showToast('All votes have been reset', 'info');
    }
};

// Edit position
window.editPosition = function(id) {
    const position = appState.positions.find(p => p.id === id);
    if (!position) return;
    
    const newTitle = prompt('Edit position title:', position.title);
    if (newTitle && newTitle.trim()) {
        position.title = newTitle.trim();
        
        const newDesc = prompt('Edit description:', position.description || '');
        if (newDesc !== null) {
            position.description = newDesc;
        }
        
        saveData();
        document.getElementById('mainContent').innerHTML = loadAdminDashboard();
        attachAdminListeners();
        showToast('Position updated');
    }
};

// Delete position
window.deletePosition = function(id) {
    if (confirm('Delete this position? All associated candidates will also be deleted.')) {
        appState.positions = appState.positions.filter(p => p.id !== id);
        appState.candidates = appState.candidates.filter(c => c.positionId !== id);
        saveData();
        document.getElementById('mainContent').innerHTML = loadAdminDashboard();
        attachAdminListeners();
        showToast('Position deleted');
    }
};

// Edit candidate
window.editCandidate = function(id) {
    const candidate = appState.candidates.find(c => c.id === id);
    if (!candidate) return;
    
    const newName = prompt('Edit candidate name:', candidate.name);
    if (newName && newName.trim()) {
        candidate.name = newName.trim();
        
        const newBio = prompt('Edit bio:', candidate.bio || '');
        if (newBio !== null) {
            candidate.bio = newBio;
        }
        
        const newImg = prompt('Edit image path:', candidate.img || '');
        if (newImg !== null) {
            candidate.img = newImg;
        }
        
        saveData();
        document.getElementById('mainContent').innerHTML = loadAdminDashboard();
        attachAdminListeners();
        showToast('Candidate updated');
    }
};

// Delete candidate
window.deleteCandidate = function(id) {
    if (confirm('Delete this candidate?')) {
        appState.candidates = appState.candidates.filter(c => c.id !== id);
        saveData();
        document.getElementById('mainContent').innerHTML = loadAdminDashboard();
        attachAdminListeners();
        showToast('Candidate deleted');
    }
};

// Update navigation
function updateNavigation() {
    const navMenu = document.getElementById('navMenu');
    
    if (appState.isAdmin) {
        navMenu.innerHTML = `
            <button class="nav-btn active" data-section="admin">Dashboard</button>
            <button class="logout-btn" id="logoutBtn">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5M13.3333 14.1667L17.5 10M17.5 10L13.3333 5.83333M17.5 10H7.5" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                Logout
            </button>
        `;
    } else {
        navMenu.innerHTML = `
            <button class="nav-btn active" data-section="home">Home</button>
            <button class="nav-btn" data-section="vote">Vote</button>
            <button class="logout-btn" id="logoutBtn">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5M13.3333 14.1667L17.5 10M17.5 10L13.3333 5.83333M17.5 10H7.5" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                Logout
            </button>
        `;
    }
    
    attachNavigationListeners();
}

// Attach navigation listeners
function attachNavigationListeners() {
    document.querySelectorAll('[data-section]').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.dataset.section;
            document.querySelectorAll('[data-section]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            if (section === 'home') {
                document.getElementById('mainContent').innerHTML = loadHomeSection();
                attachHomeButtonListener();
            } else if (section === 'vote') {
                document.getElementById('mainContent').innerHTML = loadVotingSection();
                attachVotingListeners();
            } else if (section === 'admin') {
                document.getElementById('mainContent').innerHTML = loadAdminDashboard();
                attachAdminListeners();
            }
        });
    });
}

// Attach home button listener
function attachHomeButtonListener() {
    const homeVoteBtn = document.getElementById('homeVoteBtn');
    if (homeVoteBtn) {
        homeVoteBtn.addEventListener('click', function() {
            if (!appState.currentVoter) {
                document.getElementById('appContainer').style.display = 'none';
                document.getElementById('registrationModal').style.display = 'flex';
            } else {
                document.getElementById('mainContent').innerHTML = loadVotingSection();
                document.querySelector('[data-section="vote"]').classList.add('active');
                document.querySelector('[data-section="home"]').classList.remove('active');
                attachVotingListeners();
            }
        });
    }
}

// Attach voting listeners
function attachVotingListeners() {
    // Candidate selection
    document.querySelectorAll('.candidate-option').forEach(option => {
        option.addEventListener('click', function() {
            const positionId = this.dataset.position;
            const candidateId = this.dataset.candidate;
            
            this.parentElement.querySelectorAll('.candidate-option').forEach(o => {
                o.classList.remove('selected');
            });
            
            this.classList.add('selected');
            
            if (appState.currentVoter) {
                if (!appState.votes[appState.currentVoter.id]) {
                    appState.votes[appState.currentVoter.id] = {};
                }
                appState.votes[appState.currentVoter.id][positionId] = candidateId;
                saveData();
                showToast(`Selected ${this.querySelector('.candidate-option-name').textContent}`, 'success');
            }
        });
    });

    // Review votes button
    const reviewBtn = document.getElementById('reviewVotesBtn');
    if (reviewBtn) {
        reviewBtn.addEventListener('click', function() {
            const votes = appState.votes[appState.currentVoter?.id] || {};
            const reviewList = document.getElementById('reviewList');
            let html = '';
            let hasVotes = false;
            
            appState.positions.forEach(position => {
                const candidateId = votes[position.id];
                if (candidateId) {
                    const candidate = appState.candidates.find(c => c.id === candidateId);
                    if (candidate) {
                        hasVotes = true;
                        html += `
                            <div class="review-item">
                                <span class="review-position">${position.title}:</span>
                                <span class="review-candidate">${candidate.name}</span>
                            </div>
                        `;
                    }
                }
            });
            
            if (!hasVotes) {
                html = '<p style="text-align:center; color:#64748b; padding:2rem;">No votes selected yet</p>';
            }
            
            reviewList.innerHTML = html;
            document.getElementById('reviewModal').style.display = 'flex';
        });
    }

    // Submit votes button
    const submitBtn = document.getElementById('submitVotesBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            document.getElementById('reviewVotesBtn').click();
        });
    }
}

// Attach admin listeners
function attachAdminListeners() {
    // Setup image upload
    setupImageUpload();
    
    // Add position
    const addPositionBtn = document.getElementById('addPositionBtn');
    if (addPositionBtn) {
        addPositionBtn.addEventListener('click', function() {
            const title = document.getElementById('newPositionTitle').value.trim();
            if (!title) {
                showToast('Please enter a title', 'error');
                return;
            }
            
            appState.positions.push({
                id: 'pos' + Date.now(),
                title: title,
                description: document.getElementById('newPositionDesc').value.trim(),
                order: appState.positions.length + 1
            });
            
            saveData();
            
            // Clear inputs
            document.getElementById('newPositionTitle').value = '';
            document.getElementById('newPositionDesc').value = '';
            
            // Reload same tab
            document.getElementById('mainContent').innerHTML = loadAdminDashboard();
            attachAdminListeners();
            
            // Stay on positions tab
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
            document.querySelector('[data-tab="positions"]').classList.add('active');
            document.getElementById('positionsTab').classList.add('active');
            
            showToast('Position added');
        });
    }

    // Add candidate with image upload
    const addCandidateBtn = document.getElementById('addCandidateBtn');
    if (addCandidateBtn) {
        // Remove existing listeners to avoid duplicates
        addCandidateBtn.replaceWith(addCandidateBtn.cloneNode(true));
        const newAddCandidateBtn = document.getElementById('addCandidateBtn');
        
        newAddCandidateBtn.addEventListener('click', function() {
            const positionId = document.getElementById('candidatePositionSelect').value;
            const name = document.getElementById('candidateName').value.trim();
            const bio = document.getElementById('candidateBio').value.trim();
            const imageData = document.getElementById('candidateImage').value;
            
            if (!positionId) {
                showToast('Select a position', 'error');
                return;
            }
            if (!name) {
                showToast('Enter candidate name', 'error');
                return;
            }
            
            // Use default image if none uploaded
            const candidateImage = imageData || 'https://via.placeholder.com/100';
            
            appState.candidates.push({
                id: 'c' + Date.now(),
                positionId: positionId,
                name: name,
                bio: bio,
                img: candidateImage
            });
            
            saveData();
            
            // Clear all inputs
            document.getElementById('candidateName').value = '';
            document.getElementById('candidateBio').value = '';
            document.getElementById('candidateImage').value = '';
            document.getElementById('selectedFileName').textContent = 'No file selected';
            document.getElementById('previewImg').src = 'https://via.placeholder.com/100';
            
            // Reset file input
            const fileInput = document.getElementById('candidateImageUpload');
            if (fileInput) {
                fileInput.value = '';
            }
            
            // Reload same tab
            document.getElementById('mainContent').innerHTML = loadAdminDashboard();
            attachAdminListeners();
            
            // Stay on candidates tab
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
            document.querySelector('[data-tab="candidates"]').classList.add('active');
            document.getElementById('candidatesTab').classList.add('active');
            
            showToast('Candidate added with image');
        });
    }

    // Admin tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(this.dataset.tab + 'Tab').classList.add('active');
        });
    });
}

// Initialize
function init() {
    loadData();
    
    // Role selection
    document.getElementById('showAdminLogin').addEventListener('click', function(e) {
        e.stopPropagation();
        document.getElementById('adminCodeSection').style.display = 'block';
        this.style.display = 'none';
    });

    document.getElementById('verifyAdminBtn').addEventListener('click', function() {
        const code = document.getElementById('adminCode').value;
        if (code === appState.adminCode) {
            appState.isAdmin = true;
            document.getElementById('roleModal').style.display = 'none';
            document.getElementById('appContainer').style.display = 'block';
            document.getElementById('voterInfo').style.display = 'none';
            updateNavigation();
            document.getElementById('mainContent').innerHTML = loadAdminDashboard();
            attachAdminListeners();
            showToast('Admin login successful!');
        } else {
            showToast('Invalid admin code!', 'error');
        }
    });

    document.getElementById('continueAsVoter').addEventListener('click', function() {
        document.getElementById('roleModal').style.display = 'none';
        document.getElementById('registrationModal').style.display = 'flex';
    });

    // Voter registration
    document.getElementById('verifyVoterBtn').addEventListener('click', function() {
        const email = document.getElementById('voterEmail').value.trim();
        const name = document.getElementById('voterName').value.trim() || 'Voter';
        
        if (!email) {
            showToast('Please enter your email', 'error');
            return;
        }
        
        // Simple email validation
        if (!email.includes('@') || !email.includes('.')) {
            showToast('Please enter a valid email', 'error');
            return;
        }
        
        const voterId = 'voter_' + Date.now();
        const voter = { id: voterId, email, name };
        
        appState.voters.push(voter);
        appState.currentVoter = voter;
        appState.votes[voterId] = {};
        saveData();
        
        document.getElementById('registrationModal').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';
        document.getElementById('voterInfo').style.display = 'flex';
        document.getElementById('displayEmail').textContent = email;
        
        updateNavigation();
        document.getElementById('mainContent').innerHTML = loadHomeSection();
        attachHomeButtonListener();
        showToast('Registration successful!');
    });

    // Confirm votes with Email
    document.getElementById('confirmVotesBtn').addEventListener('click', function() {
        const votes = appState.votes[appState.currentVoter?.id] || {};
        
        // Check if all positions have votes
        let allVoted = true;
        appState.positions.forEach(position => {
            if (!votes[position.id]) {
                allVoted = false;
            }
        });
        
        if (!allVoted) {
            showToast('Please vote for all positions', 'error');
            document.getElementById('reviewModal').style.display = 'none';
            return;
        }
        
        const voteSummary = [];
        appState.positions.forEach(position => {
            const candidateId = votes[position.id];
            const candidate = appState.candidates.find(c => c.id === candidateId);
            if (candidate) {
                voteSummary.push({
                    position: position.title,
                    candidate: candidate.name
                });
            }
        });
        
        sendEmailConfirmation(
            appState.currentVoter.email,
            appState.currentVoter.name,
            voteSummary
        );
        
        document.getElementById('reviewModal').style.display = 'none';
        saveData();
        showToast('✅ Vote recorded! Check your email', 'success');
    });

    // Logout
    document.addEventListener('click', function(e) {
        if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
            e.preventDefault();
            
            // Reset state
            appState.isAdmin = false;
            appState.currentVoter = null;
            
            // Hide app, show role modal
            document.getElementById('appContainer').style.display = 'none';
            document.getElementById('roleModal').style.display = 'flex';
            
            // Hide all other modals
            document.getElementById('registrationModal').style.display = 'none';
            document.getElementById('reviewModal').style.display = 'none';
            document.getElementById('emailModal').style.display = 'none';
            
            // Reset admin login section
            document.getElementById('adminCodeSection').style.display = 'none';
            document.getElementById('showAdminLogin').style.display = 'block';
            document.getElementById('adminCode').value = '';
            
            // Show success message
            showToast('Logged out successfully', 'success');
        }
    });

    // Close modals
    document.getElementById('closeReviewModal').addEventListener('click', function() {
        document.getElementById('reviewModal').style.display = 'none';
    });

    document.getElementById('closeEmailModal').addEventListener('click', function() {
        document.getElementById('emailModal').style.display = 'none';
    });

    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('review-modal')) {
            document.getElementById('reviewModal').style.display = 'none';
        }
        if (e.target.classList.contains('email-modal')) {
            document.getElementById('emailModal').style.display = 'none';
        }
    });
}

// Start
init();