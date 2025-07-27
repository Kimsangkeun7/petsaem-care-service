// 관리자 페이지 JavaScript

// 전역 변수
let allConsults = [];
let filteredConsults = [];
let allUsers = [];
let allPayments = [];

// DOM 요소들
const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
const sections = document.querySelectorAll('main > section');
const consultDetailModal = document.getElementById('consultDetailModal');
const consultDetailContent = document.getElementById('consultDetailContent');
const closeModalBtn = document.querySelector('.close');

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadConsults();
    loadUsers();
    loadPayments();
    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 사이드바 네비게이션
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            showSection(targetId);
            updateActiveNav(this);
        });
    });

    // 모달 닫기
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', function(e) {
        if (e.target === consultDetailModal) {
            closeModal();
        }
    });

    // 필터 이벤트
    document.getElementById('statusFilter').addEventListener('change', filterConsults);
    document.getElementById('typeFilter').addEventListener('change', filterConsults);
    
    // 회원 관리 필터
    document.getElementById('userStatusFilter').addEventListener('change', filterUsers);
    document.getElementById('userPlanFilter').addEventListener('change', filterUsers);
    
    // 결제 관리 필터
    document.getElementById('paymentStatusFilter').addEventListener('change', filterPayments);
    document.getElementById('paymentPlanFilter').addEventListener('change', filterPayments);

    // 로그아웃 버튼
    document.querySelector('.logout-btn').addEventListener('click', function() {
        if (confirm('로그아웃하시겠습니까?')) {
            window.location.href = '/';
        }
    });
}

// 섹션 표시
function showSection(sectionId) {
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

// 활성 네비게이션 업데이트
function updateActiveNav(activeLink) {
    sidebarLinks.forEach(link => {
        link.parentElement.classList.remove('active');
    });
    activeLink.parentElement.classList.add('active');
}

// 상담 데이터 로드
async function loadConsults() {
    try {
        const response = await fetch('/.netlify/functions/api/consults');
        const result = await response.json();
        
        if (result.success) {
            allConsults = result.data;
            filteredConsults = [...allConsults];
            updateDashboard();
            updateConsultsTable();
        } else {
            console.error('상담 데이터 로드 실패:', result.message);
        }
    } catch (error) {
        console.error('상담 데이터 로드 오류:', error);
    }
}

// 대시보드 업데이트
function updateDashboard() {
    const totalConsults = allConsults.length;
    const pendingConsults = allConsults.filter(c => c.status === 'pending').length;
    const completedConsults = allConsults.filter(c => c.status === 'completed').length;
    const totalUsers = allUsers.length;

    document.getElementById('totalConsults').textContent = totalConsults;
    document.getElementById('pendingConsults').textContent = pendingConsults;
    document.getElementById('completedConsults').textContent = completedConsults;
    document.getElementById('totalUsers').textContent = totalUsers;

    // 최근 상담 테이블 업데이트
    updateRecentConsultsTable();
}

// 최근 상담 테이블 업데이트
function updateRecentConsultsTable() {
    const recentConsults = allConsults
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    const tbody = document.getElementById('recentConsultsTable');
    tbody.innerHTML = '';

    recentConsults.forEach(consult => {
        const row = createConsultRow(consult);
        tbody.appendChild(row);
    });
}

// 상담 테이블 업데이트
function updateConsultsTable() {
    const tbody = document.getElementById('consultsTable');
    tbody.innerHTML = '';

    filteredConsults.forEach(consult => {
        const row = createConsultRow(consult);
        tbody.appendChild(row);
    });
}

// 상담 행 생성
function createConsultRow(consult) {
    const row = document.createElement('tr');
    
    const createdAt = new Date(consult.createdAt).toLocaleDateString('ko-KR');
    const statusClass = `status-${consult.status}`;
    const statusText = getStatusText(consult.status);
    
    row.innerHTML = `
        <td>${createdAt}</td>
        <td>${consult.name}</td>
        <td>${consult.phone}</td>
        <td>${consult.petType}</td>
        <td>${consult.consultType}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>
            <button class="action-btn btn-view" onclick="viewConsult('${consult.id}')">상세보기</button>
            <button class="action-btn btn-edit" onclick="editConsultStatus('${consult.id}')">상태변경</button>
        </td>
    `;
    
    return row;
}

// 상태 텍스트 변환
function getStatusText(status) {
    const statusMap = {
        'pending': '대기 중',
        'in-progress': '진행 중',
        'completed': '완료',
        'cancelled': '취소'
    };
    return statusMap[status] || status;
}

// 상담 필터링
function filterConsults() {
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;

    filteredConsults = allConsults.filter(consult => {
        const statusMatch = !statusFilter || consult.status === statusFilter;
        const typeMatch = !typeFilter || consult.consultType === typeFilter;
        return statusMatch && typeMatch;
    });

    updateConsultsTable();
}

// 상담 상세보기
async function viewConsult(consultId) {
    const consult = allConsults.find(c => c.id === consultId);
    if (!consult) {
        alert('상담 정보를 찾을 수 없습니다.');
        return;
    }

    const createdAt = new Date(consult.createdAt).toLocaleString('ko-KR');
    const statusText = getStatusText(consult.status);

    consultDetailContent.innerHTML = `
        <div class="consult-detail">
            <div class="detail-section">
                <h3>기본 정보</h3>
                <div class="detail-item">
                    <label>신청일</label>
                    <p>${createdAt}</p>
                </div>
                <div class="detail-item">
                    <label>이름</label>
                    <p>${consult.name}</p>
                </div>
                <div class="detail-item">
                    <label>연락처</label>
                    <p>${consult.phone}</p>
                </div>
                <div class="detail-item">
                    <label>반려동물/식물</label>
                    <p>${consult.petType}</p>
                </div>
                <div class="detail-item">
                    <label>상담 유형</label>
                    <p>${consult.consultType}</p>
                </div>
                <div class="detail-item">
                    <label>상태</label>
                    <p><span class="status-badge status-${consult.status}">${statusText}</span></p>
                </div>
            </div>
            <div class="detail-section">
                <h3>상담 내용</h3>
                <div class="detail-item">
                    <label>상담 내용</label>
                    <p>${consult.description}</p>
                </div>
                ${consult.images && consult.images.length > 0 ? `
                    <div class="detail-item">
                        <label>첨부 이미지</label>
                        <div class="consult-images">
                            ${consult.images.map(img => `
                                <div class="consult-image">
                                    <img src="/uploads/${img.filename}" alt="상담 이미지" onclick="openImageModal('/uploads/${img.filename}')">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
        <div class="modal-actions">
            <button class="action-btn btn-edit" onclick="editConsultStatus('${consult.id}')">상태 변경</button>
            <button class="action-btn btn-view" onclick="closeModal()">닫기</button>
        </div>
    `;

    consultDetailModal.style.display = 'block';
}

// 상담 상태 변경
async function editConsultStatus(consultId) {
    const consult = allConsults.find(c => c.id === consultId);
    if (!consult) {
        alert('상담 정보를 찾을 수 없습니다.');
        return;
    }

    const newStatus = prompt(
        '상태를 변경하세요:\n' +
        '1. pending (대기 중)\n' +
        '2. in-progress (진행 중)\n' +
        '3. completed (완료)\n' +
        '4. cancelled (취소)\n\n' +
        '현재 상태: ' + getStatusText(consult.status),
        consult.status
    );

    if (!newStatus || !['pending', 'in-progress', 'completed', 'cancelled'].includes(newStatus)) {
        alert('올바른 상태를 입력해주세요.');
        return;
    }

    try {
        const response = await fetch(`/.netlify/functions/api/consults/${consultId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        const result = await response.json();

        if (result.success) {
            alert('상태가 성공적으로 변경되었습니다.');
            loadConsults(); // 데이터 다시 로드
            closeModal();
        } else {
            alert('상태 변경 실패: ' + result.message);
        }
    } catch (error) {
        console.error('상태 변경 오류:', error);
        alert('상태 변경 중 오류가 발생했습니다.');
    }
}

// 모달 닫기
function closeModal() {
    consultDetailModal.style.display = 'none';
}

// 이미지 모달 열기 (간단한 구현)
function openImageModal(imageSrc) {
    window.open(imageSrc, '_blank');
}

console.log('펫쌤 관리자 페이지가 로드되었습니다! 🐾🌱');

// 회원 데이터 로드
async function loadUsers() {
    try {
        const response = await fetch('/.netlify/functions/api/users');
        const result = await response.json();
        
        if (result.success) {
            allUsers = result.data;
            updateUsersTable();
        } else {
            console.error('회원 데이터 로드 실패:', result.message);
        }
    } catch (error) {
        console.error('회원 데이터 로드 오류:', error);
    }
}

// 결제 데이터 로드
async function loadPayments() {
    try {
        const response = await fetch('/.netlify/functions/api/payments');
        const result = await response.json();
        
        if (result.success) {
            allPayments = result.data;
            updatePaymentsTable();
            updatePaymentStats();
        } else {
            console.error('결제 데이터 로드 실패:', result.message);
        }
    } catch (error) {
        console.error('결제 데이터 로드 오류:', error);
    }
}

// 회원 테이블 업데이트
function updateUsersTable() {
    const tbody = document.getElementById('usersTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    allUsers.forEach(user => {
        const row = createUserRow(user);
        tbody.appendChild(row);
    });
}

// 회원 행 생성
function createUserRow(user) {
    const row = document.createElement('tr');
    
    const createdAt = new Date(user.createdAt).toLocaleDateString('ko-KR');
    const statusClass = `status-${user.status}`;
    const planText = getPlanText(user.subscription?.planType);
    
    row.innerHTML = `
        <td>${createdAt}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.phone}</td>
        <td>${planText}</td>
        <td><span class="status-badge ${statusClass}">${user.status}</span></td>
        <td>
            <button class="action-btn btn-view" onclick="viewUser('${user.id}')">상세보기</button>
            <button class="action-btn btn-edit" onclick="editUserStatus('${user.id}')">상태변경</button>
        </td>
    `;
    
    return row;
}

// 요금제 텍스트 변환
function getPlanText(planType) {
    const planMap = {
        'free': '무료',
        'basic': '기본 케어',
        'premium': '프리미엄 케어',
        'basic_care_monthly': '기본 케어',
        'premium_care_monthly': '프리미엄 케어'
    };
    return planMap[planType] || '무료';
}

// 결제 테이블 업데이트
function updatePaymentsTable() {
    const tbody = document.getElementById('paymentsTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    allPayments.forEach(payment => {
        const row = createPaymentRow(payment);
        tbody.appendChild(row);
    });
}

// 결제 행 생성
function createPaymentRow(payment) {
    const row = document.createElement('tr');
    
    const paymentDate = new Date(payment.paymentDate).toLocaleDateString('ko-KR');
    const statusClass = `status-${payment.status}`;
    const planText = getPlanText(payment.planType);
    const amount = payment.amount.toLocaleString();
    
    row.innerHTML = `
        <td>${paymentDate}</td>
        <td>${payment.orderId}</td>
        <td>${payment.payerName}</td>
        <td>${planText}</td>
        <td>₩${amount}</td>
        <td><span class="status-badge ${statusClass}">${payment.status}</span></td>
        <td>
            <button class="action-btn btn-view" onclick="viewPayment('${payment.id}')">상세보기</button>
        </td>
    `;
    
    return row;
}

// 결제 통계 업데이트
function updatePaymentStats() {
    const totalRevenue = allPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
    
    const currentMonth = new Date().getMonth();
    const monthlyRevenue = allPayments
        .filter(p => p.status === 'completed' && new Date(p.paymentDate).getMonth() === currentMonth)
        .reduce((sum, p) => sum + p.amount, 0);
    
    const subscribedUsers = allUsers
        .filter(u => u.subscription && u.subscription.planType !== 'free')
        .length;
    
    document.getElementById('totalRevenue').textContent = `₩${totalRevenue.toLocaleString()}`;
    document.getElementById('monthlyRevenue').textContent = `₩${monthlyRevenue.toLocaleString()}`;
    document.getElementById('subscribedUsers').textContent = subscribedUsers;
}

// 회원 필터링
function filterUsers() {
    const statusFilter = document.getElementById('userStatusFilter').value;
    const planFilter = document.getElementById('userPlanFilter').value;
    
    let filtered = allUsers;
    
    if (statusFilter) {
        filtered = filtered.filter(user => user.status === statusFilter);
    }
    
    if (planFilter) {
        filtered = filtered.filter(user => user.subscription?.planType === planFilter);
    }
    
    const tbody = document.getElementById('usersTable');
    tbody.innerHTML = '';
    
    filtered.forEach(user => {
        const row = createUserRow(user);
        tbody.appendChild(row);
    });
}

// 결제 필터링
function filterPayments() {
    const statusFilter = document.getElementById('paymentStatusFilter').value;
    const planFilter = document.getElementById('paymentPlanFilter').value;
    
    let filtered = allPayments;
    
    if (statusFilter) {
        filtered = filtered.filter(payment => payment.status === statusFilter);
    }
    
    if (planFilter) {
        filtered = filtered.filter(payment => payment.planType === planFilter);
    }
    
    const tbody = document.getElementById('paymentsTable');
    tbody.innerHTML = '';
    
    filtered.forEach(payment => {
        const row = createPaymentRow(payment);
        tbody.appendChild(row);
    });
}

// 회원 상세보기
function viewUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    alert(`회원 상세 정보\n\n이름: ${user.name}\n이메일: ${user.email}\n전화번호: ${user.phone}\n가입일: ${new Date(user.createdAt).toLocaleDateString('ko-KR')}\n상태: ${user.status}\n요금제: ${getPlanText(user.subscription?.planType)}`);
}

// 회원 상태 변경
async function editUserStatus(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    const newStatus = prompt('새로운 상태를 입력하세요 (active/inactive/suspended):', user.status);
    if (!newStatus) return;
    
    try {
        const response = await fetch(`/.netlify/functions/api/users/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        const result = await response.json();
        if (result.success) {
            user.status = newStatus;
            updateUsersTable();
            alert('회원 상태가 변경되었습니다.');
        } else {
            alert('상태 변경에 실패했습니다.');
        }
    } catch (error) {
        console.error('회원 상태 변경 오류:', error);
        alert('상태 변경 중 오류가 발생했습니다.');
    }
}

// 결제 상세보기
function viewPayment(paymentId) {
    const payment = allPayments.find(p => p.id === paymentId);
    if (!payment) return;
    
    alert(`결제 상세 정보\n\n주문번호: ${payment.orderId}\n고객명: ${payment.payerName}\n이메일: ${payment.payerEmail}\n요금제: ${getPlanText(payment.planType)}\n금액: ₩${payment.amount.toLocaleString()}\n결제일: ${new Date(payment.paymentDate).toLocaleDateString('ko-KR')}\n상태: ${payment.status}`);
}

// 홈으로 돌아가기 함수
function goHome() {
    window.location.href = 'index.html';
} 