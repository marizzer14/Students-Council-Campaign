z// Global state
let appState = {
    isAdmin: false,
    adminCode: 'ADMIN123',
    positions: [],
    candidates: [],
    votes: {},
    voters: [],
    currentVoter: null
};

// Initialize default data
const defaultData = {
    positions: [
        { id: 'pos1', title: 'President', description: 'Student body president', order: 1 },
        { id: 'pos2', title: 'Vice President', description: 'Assistant to president', order: 2 },
        { id: 'pos3', title: 'Secretary', description: 'Records and communication', order: 3 }
    ],
    candidates: [
        { id: 'c1', positionId: 'pos1', name: 'Greg Legarto', bio: 'Visionary leader', img: 'assets/imgs/Press1' },
        { id: 'c2', positionId: 'pos1', name: 'Mariel Magtibay', bio: 'Student advocate', img: 'assets/imgs/Press2' },
        { id: 'c3', positionId: 'pos2', name: 'John Lenard Ebalan', bio: 'Former class rep', img: 'assets/imgs/VPress1' },
        { id: 'c4', positionId: 'pos2', name: 'Priya Sharma', bio: 'Community organizer', img: 'assets/imgs/VPress2' },
        { id: 'c5', positionId: 'pos3', name: 'sec1', bio: 'Yearbook editor', img: 'assets/imgs/Secretary1' },
        { id: 'c6', positionId: 'pos3', name: 'Elena Petrov', bio: 'Debate club secretary', img: 'assets/imgs/Secretary2' }
    ]
};

// Load or initialize data
function loadData() {
    const saved = localStorage.getItem('campaignData');
    if (saved) {
        appState = JSON.parse(saved);
    } else {
        appState.positions = defaultData.positions;
        appState.candidates = defaultData.candidates;
        appState.votes = {};
        appState.voters = [];
        appState.currentVoter = null;
        saveData();
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('campaignData', JSON.stringify(appState));
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Simulate sending SMS
function sendSMS(mobile, message) {
    console.log(`SMS sent to ${mobile}: ${message}`);
    
    // Show SMS modal
    const smsModal = document.getElementById('smsModal');
    if (!smsModal) return;
    
    const smsMessage = document.getElementById('smsMessage');
    const smsDetails = document.getElementById('smsDetails');
    
    if (smsMessage) smsMessage.textContent = 'Your votes have been recorded successfully!';
    if (smsDetails) {
        smsDetails.innerHTML = `
            <strong>To:</strong> ${mobile}<br>
            <strong>Message:</strong> ${message}<br>
            <strong>Time:</strong> ${new Date().toLocaleString()}
        `;
    }
    
    smsModal.style.display = 'flex';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (smsModal) smsModal.style.display = 'none';
    }, 5000);
}

// Show section
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(sectionId);
    if (section) section.classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const navHome = document.getElementById('navHome');
    const navVote = document.getElementById('navVote');
    const navResults = document.getElementById('navResults');
    const navAdmin = document.getElementById('navAdmin');
    
    if (sectionId === 'homeSection' && navHome) navHome.classList.add('active');
    else if (sectionId === 'voteSection' && navVote) navVote.classList.add('active');
    else if (sectionId === 'resultsSection' && navResults) navResults.classList.add('active');
    else if (sectionId === 'adminSection' && navAdmin) navAdmin.classList.add('active');
    
    // Load section data
    if (sectionId === 'voteSection' && appState.currentVoter) {
        loadVotingSection();
    } else if (sectionId === 'resultsSection') {
        loadResultsSection();
    } else if (sectionId === 'adminSection' && appState.isAdmin) {
        loadAdminPanel();
    } else if (sectionId === 'homeSection') {
        updateHomeStats();
    }
}

// Update home stats
function updateHomeStats() {
    const positionsCount = document.getElementById('homePositionsCount');
    const candidatesCount = document.getElementById('homeCandidatesCount');
    const votesCount = document.getElementById('homeVotesCount');
    const votersCount = document.getElementById('homeVotersCount');
    
    if (positionsCount) positionsCount.textContent = appState.positions.length;
    if (candidatesCount) candidatesCount.textContent = appState.candidates.length;
    if (votesCount) votesCount.textContent = Object.keys(appState.votes).length;
    if (votersCount) votersCount.textContent = appState.voters.length;
}

// Load voting section with all positions
function loadVotingSection() {
    const container = document.getElementById('positionsVotingContainer');
    const verifiedMobile = document.getElementById('verifiedMobile');
    const voterGreeting = document.getElementById('voterGreeting');
    
    if (!container) return;
    
    if (verifiedMobile && appState.currentVoter) {
        verifiedMobile.textContent = appState.currentVoter.mobile;
    }
    
    if (voterGreeting && appState.currentVoter) {
        const name = appState.currentVoter.name || 'Voter';
        voterGreeting.textContent = `Welcome, ${name}! Please select your candidates for each position.`;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Sort positions by order
    const sortedPositions = [...appState.positions].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Create voting cards for each position
    sortedPositions.forEach(position => {
        const positionCandidates = appState.candidates.filter(c => c.positionId === position.id);
        
        if (positionCandidates.length === 0) return;
        
        const card = document.createElement('div');
        card.className = 'position-voting-card';
        card.setAttribute('data-position-id', position.id);
        
        // Create header
        const header = document.createElement('div');
        header.className = 'position-header';
        header.innerHTML = `
            <h3>${position.title}</h3>
            <p>${position.description || 'Select one candidate'}</p>
        `;
        
        // Create candidates grid
        const candidatesGrid = document.createElement('div');
        candidatesGrid.className = 'candidates-voting-grid';
        
        // Add candidates
        positionCandidates.forEach(candidate => {
            const candidateOption = document.createElement('div');
            candidateOption.className = 'candidate-option';
            candidateOption.setAttribute('data-candidate-id', candidate.id);
            candidateOption.setAttribute('data-position-id', position.id);
            
            candidateOption.innerHTML = `
                <img src="${candidate.img}" alt="${candidate.name}" class="candidate-option-image" onerror="this.src='https://via.placeholder.com/100'">
                <div class="candidate-option-name">${candidate.name}</div>
                <div class="candidate-option-bio">${candidate.bio || ''}</div>
            `;
            
            // Check if already voted for this position
            const voterId = appState.currentVoter ? appState.currentVoter.id : null;
            if (voterId && appState.votes[voterId] && appState.votes[voterId][position.id]) {
                if (appState.votes[voterId][position.id] === candidate.id) {
                    candidateOption.classList.add('selected');
                }
            }
            
            // Add click handler
            candidateOption.addEventListener('click', function() {
                // Remove selected class from all candidates in this position
                document.querySelectorAll(`.candidate-option[data-position-id="${position.id}"]`).forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add selected class to this candidate
                this.classList.add('selected');
                
                // Store selection temporarily
                if (!appState.currentVoter) return;
                
                if (!appState.votes[appState.currentVoter.id]) {
                    appState.votes[appState.currentVoter.id] = {};
                }
                
                appState.votes[appState.currentVoter.id][position.id] = candidate.id;
            });
            
            candidatesGrid.appendChild(candidateOption);
        });
        
        card.appendChild(header);
        card.appendChild(candidatesGrid);
        container.appendChild(card);
    });
}

// Load results section
function loadResultsSection() {
    const container = document.getElementById('resultsContainer');
    if (!container) return;
    
    container.innerHTML = '<p>Loading results...</p>';
    
    // Calculate results
    const results = {};
    
    // Initialize results for each position
    appState.positions.forEach(position => {
        results[position.id] = {
            title: position.title,
            candidates: {}
        };
        
        // Initialize each candidate with 0 votes
        appState.candidates.filter(c => c.positionId === position.id).forEach(candidate => {
            results[position.id].candidates[candidate.id] = {
                name: candidate.name,
                votes: 0
            };
        });
    });
    
    // Count votes
    Object.values(appState.votes).forEach(voterVotes => {
        Object.entries(voterVotes).forEach(([positionId, candidateId]) => {
            if (results[positionId] && results[positionId].candidates[candidateId]) {
                results[positionId].candidates[candidateId].votes++;
            }
        });
    });
    
    // Display results
    let html = '';
    
    Object.values(results).forEach(position => {
        html += `
            <div class="result-card">
                <h3>${position.title}</h3>
                <div class="result-list">
        `;
        
        // Sort candidates by votes (descending)
        const sortedCandidates = Object.entries(position.candidates)
            .sort((a, b) => b[1].votes - a[1].votes);
        
        const totalVotes = sortedCandidates.reduce((sum, [_, data]) => sum + data.votes, 0);
        
        sortedCandidates.forEach(([candidateId, data]) => {
            const percentage = totalVotes > 0 ? Math.round((data.votes / totalVotes) * 100) : 0;
            
            html += `
                <div class="result-item">
                    <div class="result-name">${data.name}</div>
                    <div class="result-bar-container">
                        <div class="result-bar" style="width: ${percentage}%"></div>
                    </div>
                    <div class="result-votes">${data.votes} votes (${percentage}%)</div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    if (Object.keys(results).length === 0) {
        html = '<p class="no-results">No votes have been cast yet.</p>';
    }
    
    container.innerHTML = html;
}

// Load admin panel
function loadAdminPanel() {
    if (!appState.isAdmin) return;
    
    loadPositionsList();
    loadCandidatesSelect();
    loadCandidatesAdminList();
    loadVotersList();
}

// Load positions list for admin
function loadPositionsList() {
    const container = document.getElementById('positionsList');
    if (!container) return;
    
    if (appState.positions.length === 0) {
        container.innerHTML = '<p class="empty-message">No positions added yet.</p>';
        return;
    }
    
    let html = '';
    appState.positions.forEach((position, index) => {
        const candidateCount = appState.candidates.filter(c => c.positionId === position.id).length;
        
        html += `
            <div class="position-item">
                <div class="position-info">
                    <strong>${position.title}</strong>
                    <span class="position-desc">${position.description || ''}</span>
                    <span class="candidate-count">${candidateCount} candidates</span>
                </div>
                <div class="position-actions">
                    <button class="small-btn delete-position" data-id="${position.id}">Delete</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Add delete handlers
    document.querySelectorAll('.delete-position').forEach(btn => {
        btn.addEventListener('click', function() {
            const positionId = this.dataset.id;
            appState.positions = appState.positions.filter(p => p.id !== positionId);
            appState.candidates = appState.candidates.filter(c => c.positionId !== positionId);
            saveData();
            loadAdminPanel();
            updateHomeStats();
            showToast('Position deleted successfully');
        });
    });
}

// Load candidates select dropdown
function loadCandidatesSelect() {
    const select = document.getElementById('candidatePositionSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select a position</option>';
    
    appState.positions.forEach(position => {
        select.innerHTML += `<option value="${position.id}">${position.title}</option>`;
    });
}

// Load candidates admin list
function loadCandidatesAdminList() {
    const container = document.getElementById('candidatesAdminList');
    if (!container) return;
    
    if (appState.candidates.length === 0) {
        container.innerHTML = '<p class="empty-message">No candidates added yet.</p>';
        return;
    }
    
    // Group by position
    const candidatesByPosition = {};
    appState.candidates.forEach(candidate => {
        if (!candidatesByPosition[candidate.positionId]) {
            candidatesByPosition[candidate.positionId] = [];
        }
        candidatesByPosition[candidate.positionId].push(candidate);
    });
    
    let html = '';
    
    appState.positions.forEach(position => {
        const positionCandidates = candidatesByPosition[position.id] || [];
        
        html += `
            <div class="position-group">
                <h4>${position.title}</h4>
        `;
        
        positionCandidates.forEach(candidate => {
            html += `
                <div class="candidate-item">
                    <div class="candidate-info">
                        <strong>${candidate.name}</strong>
                        <span class="candidate-bio">${candidate.bio || ''}</span>
                    </div>
                    <div class="candidate-actions">
                        <button class="small-btn delete-candidate" data-id="${candidate.id}">Delete</button>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    });
    
    container.innerHTML = html;
    
    // Add delete handlers
    document.querySelectorAll('.delete-candidate').forEach(btn => {
        btn.addEventListener('click', function() {
            const candidateId = this.dataset.id;
            appState.candidates = appState.candidates.filter(c => c.id !== candidateId);
            saveData();
            loadAdminPanel();
            updateHomeStats();
            showToast('Candidate deleted successfully');
        });
    });
}

// Load voters list
function loadVotersList() {
    const container = document.getElementById('votersList');
    const badge = document.getElementById('totalVotersBadge');
    
    if (!container) return;
    
    if (badge) {
        badge.textContent = appState.voters.length;
    }
    
    if (appState.voters.length === 0) {
        container.innerHTML = '<p class="empty-message">No verified voters yet.</p>';
        return;
    }
    
    let html = '';
    appState.voters.forEach(voter => {
        const hasVoted = appState.votes[voter.id] && Object.keys(appState.votes[voter.id]).length > 0;
        
        html += `
            <div class="voter-record">
                <div class="voter-info">
                    <span class="voter-name">${voter.name || 'Anonymous'}</span>
                    <span class="voter-contact">${voter.mobile} | ${voter.email}</span>
                </div>
                <div class="voter-status ${hasVoted ? 'voted' : 'pending'}">
                    ${hasVoted ? '✓ Voted' : '⏳ Pending'}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Initialize all event listeners
function initializeEventListeners() {
    console.log('Initializing event listeners...');
    
    // Get all elements
    const loginModal = document.getElementById('loginModal');
    const registrationModal = document.getElementById('registrationModal');
    const appContainer = document.getElementById('appContainer');
    const showAdminCode = document.getElementById('showAdminCode');
    const adminCodeSection = document.getElementById('adminCodeSection');
    const verifyAdminCode = document.getElementById('verifyAdminCode');
    const enterAsVoter = document.getElementById('enterAsVoter');
    const adminCode = document.getElementById('adminCode');
    
    // Registration elements
    const verifyVoterBtn = document.getElementById('verifyVoterBtn');
    const voterMobile = document.getElementById('voterMobile');
    const voterEmail = document.getElementById('voterEmail');
    const voterName = document.getElementById('voterName');
    
    // Navigation
    const navHome = document.getElementById('navHome');
    const navVote = document.getElementById('navVote');
    const navResults = document.getElementById('navResults');
    const navAdmin = document.getElementById('navAdmin');
    const logoutBtn = document.getElementById('logoutBtn');
    const homeVoteBtn = document.getElementById('homeVoteBtn');
    
    // Voting elements
    const votingForm = document.getElementById('votingForm');
    const reviewVotesBtn = document.getElementById('reviewVotesBtn');
    const submitVotesBtn = document.getElementById('submitVotesBtn');
    const reviewModal = document.getElementById('reviewModal');
    const closeReviewModal = document.getElementById('closeReviewModal');
    const confirmVotesBtn = document.getElementById('confirmVotesBtn');
    const closeSmsModal = document.getElementById('closeSmsModal');
    
    // Admin elements
    const adminTabs = document.querySelectorAll('.admin-tab');
    const addPositionBtn = document.getElementById('addPositionBtn');
    const addCandidateBtn = document.getElementById('addCandidateBtn');
    const updateAdminCodeBtn = document.getElementById('updateAdminCode');
    const resetAllDataBtn = document.getElementById('resetAllData');
    const sendBulkSms = document.getElementById('sendBulkSms');

    // Show admin code input when clicking "Login as Admin" button
    if (showAdminCode) {
        console.log('Admin button found');
        showAdminCode.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Admin button clicked');
            if (adminCodeSection) {
                adminCodeSection.style.display = 'block';
            }
        });
    } else {
        console.error('Admin button not found');
    }

    // Verify admin code
    if (verifyAdminCode) {
        verifyAdminCode.addEventListener('click', function() {
            const code = adminCode ? adminCode.value : '';
            if (code === appState.adminCode) {
                appState.isAdmin = true;
                appState.currentVoter = null;
                loginModal.style.display = 'none';
                appContainer.style.display = 'block';
                if (navAdmin) navAdmin.style.display = 'block';
                
                // Hide voter info
                const voterInfo = document.querySelector('.voter-info');
                if (voterInfo) voterInfo.style.display = 'none';
                
                showToast('Admin login successful!', 'success');
                loadAdminPanel();
                showSection('homeSection');
            } else {
                showToast('Invalid admin code!', 'error');
            }
        });
    }

    // Enter as voter - show registration modal
    if (enterAsVoter) {
        enterAsVoter.addEventListener('click', function() {
            loginModal.style.display = 'none';
            if (registrationModal) {
                registrationModal.style.display = 'flex';
            }
        });
    }

    // Verify voter and proceed to voting
    if (verifyVoterBtn) {
        verifyVoterBtn.addEventListener('click', function() {
            const mobile = voterMobile ? voterMobile.value.trim() : '';
            const email = voterEmail ? voterEmail.value.trim() : '';
            const name = voterName ? voterName.value.trim() : 'Anonymous Voter';
            
            if (!mobile || !email) {
                showToast('Please enter both mobile number and email', 'error');
                return;
            }
            
            if (!mobile.match(/^\+?[\d\s-]{10,}$/)) {
                showToast('Please enter a valid mobile number', 'error');
                return;
            }
            
            if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            
            // Create voter record
            const voterId = 'voter_' + Date.now();
            const voter = {
                id: voterId,
                mobile: mobile,
                email: email,
                name: name,
                registeredAt: new Date().toISOString()
            };
            
            appState.voters.push(voter);
            appState.currentVoter = voter;
            appState.votes[voterId] = {};
            saveData();
            
            // Hide registration modal and show main app
            registrationModal.style.display = 'none';
            appContainer.style.display = 'block';
            
            // Hide admin nav
            if (navAdmin) navAdmin.style.display = 'none';
            
            // Show voter info
            const voterInfo = document.querySelector('.voter-info');
            const displayMobile = document.getElementById('displayMobile');
            if (voterInfo) voterInfo.style.display = 'flex';
            if (displayMobile) displayMobile.textContent = mobile;
            
            showToast('Registration successful! You can now vote.', 'success');
            showSection('voteSection');
        });
    }

    // Navigation
    if (navHome) {
        navHome.addEventListener('click', () => showSection('homeSection'));
    }
    
    if (navVote) {
        navVote.addEventListener('click', () => {
            if (!appState.currentVoter && !appState.isAdmin) {
                showToast('Please login as voter first', 'error');
                return;
            }
            showSection('voteSection');
        });
    }
    
    if (navResults) {
        navResults.addEventListener('click', () => showSection('resultsSection'));
    }
    
    if (navAdmin) {
        navAdmin.addEventListener('click', () => {
            if (!appState.isAdmin) {
                showToast('Admin access only', 'error');
                return;
            }
            showSection('adminSection');
        });
    }
    
    if (homeVoteBtn) {
        homeVoteBtn.addEventListener('click', () => {
            if (!appState.currentVoter && !appState.isAdmin) {
                // Go back to login
                appContainer.style.display = 'none';
                loginModal.style.display = 'flex';
                return;
            }
            showSection('voteSection');
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            appState.isAdmin = false;
            appState.currentVoter = null;
            appContainer.style.display = 'none';
            loginModal.style.display = 'flex';
            
            // Hide admin code section
            if (adminCodeSection) adminCodeSection.style.display = 'none';
            if (adminCode) adminCode.value = '';
            
            // Reset registration modal
            if (registrationModal) registrationModal.style.display = 'none';
            if (voterMobile) voterMobile.value = '';
            if (voterEmail) voterEmail.value = '';
            if (voterName) voterName.value = '';
            
            showToast('Logged out successfully', 'success');
        });
    }

    // Admin tabs
    if (adminTabs.length > 0) {
        adminTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                adminTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
                const tabId = this.dataset.tab + 'Tab';
                const tabElement = document.getElementById(tabId);
                if (tabElement) tabElement.classList.add('active');
            });
        });
    }

    // Add position
    if (addPositionBtn) {
        addPositionBtn.addEventListener('click', function() {
            const title = document.getElementById('newPositionTitle');
            const desc = document.getElementById('newPositionDesc');
            const order = document.getElementById('newPositionOrder');
            
            if (!title || !title.value.trim()) {
                showToast('Please enter a position title', 'error');
                return;
            }
            
            const newPosition = {
                id: 'pos_' + Date.now(),
                title: title.value.trim(),
                description: desc ? desc.value.trim() : '',
                order: order ? parseInt(order.value) || 1 : 1
            };
            
            appState.positions.push(newPosition);
            saveData();
            
            // Clear inputs
            title.value = '';
            if (desc) desc.value = '';
            
            loadAdminPanel();
            updateHomeStats();
            showToast('Position added successfully');
        });
    }

    // Add candidate
    if (addCandidateBtn) {
        addCandidateBtn.addEventListener('click', function() {
            const positionSelect = document.getElementById('candidatePositionSelect');
            const nameInput = document.getElementById('candidateName');
            const bioInput = document.getElementById('candidateBio');
            const imageInput = document.getElementById('candidateImage');
            
            if (!positionSelect || !positionSelect.value) {
                showToast('Please select a position', 'error');
                return;
            }
            
            if (!nameInput || !nameInput.value.trim()) {
                showToast('Please enter candidate name', 'error');
                return;
            }
            
            const newCandidate = {
                id: 'c_' + Date.now(),
                positionId: positionSelect.value,
                name: nameInput.value.trim(),
                bio: bioInput ? bioInput.value.trim() : '',
                img: imageInput ? imageInput.value.trim() : 'assets/imgs/default'
            };
            
            appState.candidates.push(newCandidate);
            saveData();
            
            // Clear inputs
            if (nameInput) nameInput.value = '';
            if (bioInput) bioInput.value = '';
            if (imageInput) imageInput.value = '';
            
            loadAdminPanel();
            updateHomeStats();
            showToast('Candidate added successfully');
        });
    }

    // Update admin code
    if (updateAdminCodeBtn) {
        updateAdminCodeBtn.addEventListener('click', function() {
            const newCode = document.getElementById('newAdminCode');
            if (newCode && newCode.value.trim()) {
                appState.adminCode = newCode.value.trim();
                saveData();
                showToast('Admin code updated successfully');
            }
        });
    }

    // Reset all data
    if (resetAllDataBtn) {
        resetAllDataBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                appState.positions = defaultData.positions;
                appState.candidates = defaultData.candidates;
                appState.votes = {};
                appState.voters = [];
                appState.adminCode = 'ADMIN123';
                appState.currentVoter = null;
                saveData();
                loadAdminPanel();
                updateHomeStats();
                showToast('All data has been reset');
            }
        });
    }

    // Review votes button
    if (reviewVotesBtn) {
        reviewVotesBtn.addEventListener('click', function() {
            if (!appState.currentVoter) {
                showToast('Please login first', 'error');
                return;
            }
            
            const voterVotes = appState.votes[appState.currentVoter.id] || {};
            const reviewList = document.getElementById('reviewList');
            
            if (!reviewList) return;
            
            let reviewHtml = '';
            let hasVotes = false;
            
            appState.positions.forEach(position => {
                const candidateId = voterVotes[position.id];
                if (candidateId) {
                    const candidate = appState.candidates.find(c => c.id === candidateId);
                    if (candidate) {
                        hasVotes = true;
                        reviewHtml += `
                            <div class="review-item">
                                <span class="review-position">${position.title}:</span>
                                <span class="review-candidate">${candidate.name}</span>
                            </div>
                        `;
                    }
                }
            });
            
            if (!hasVotes) {
                reviewHtml = '<p class="no-votes">You haven\'t selected any candidates yet.</p>';
            }
            
            reviewList.innerHTML = reviewHtml;
            
            if (reviewModal) {
                reviewModal.style.display = 'flex';
            }
        });
    }

    // Close review modal
    if (closeReviewModal) {
        closeReviewModal.addEventListener('click', function() {
            if (reviewModal) reviewModal.style.display = 'none';
        });
    }

    // Confirm votes
    if (confirmVotesBtn) {
        confirmVotesBtn.addEventListener('click', function() {
            if (!appState.currentVoter) return;
            
            // Close review modal
            if (reviewModal) reviewModal.style.display = 'none';
            
            // Send SMS confirmation
            const message = `Thank you for voting in the Student Council Election! Your votes have been recorded. - StudentCouncilCampaign.online`;
            sendSMS(appState.currentVoter.mobile, message);
            
            saveData();
            updateHomeStats();
            showToast('Your votes have been submitted successfully!');
        });
    }

    // Close SMS modal
    if (closeSmsModal) {
        closeSmsModal.addEventListener('click', function() {
            const smsModal = document.getElementById('smsModal');
            if (smsModal) smsModal.style.display = 'none';
        });
    }

    // Voting form submit
    if (votingForm) {
        votingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!appState.currentVoter) {
                showToast('Please login first', 'error');
                return;
            }
            
            // Trigger review
            if (reviewVotesBtn) {
                reviewVotesBtn.click();
            }
        });
    }

    // Bulk SMS
    if (sendBulkSms) {
        sendBulkSms.addEventListener('click', function() {
            const messageInput = document.getElementById('bulkSmsMessage');
            const message = messageInput ? messageInput.value.trim() : '';
            
            if (!message) {
                showToast('Please enter a message', 'error');
                return;
            }
            
            if (appState.voters.length === 0) {
                showToast('No voters to send SMS to', 'error');
                return;
            }
            
            // Simulate sending bulk SMS
            appState.voters.forEach(voter => {
                console.log(`SMS sent to ${voter.mobile}: ${message}`);
            });
            
            showToast(`SMS sent to ${appState.voters.length} voters`, 'success');
            if (messageInput) messageInput.value = '';
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    loadData();
    initializeEventListeners();
    updateHomeStats();
});

