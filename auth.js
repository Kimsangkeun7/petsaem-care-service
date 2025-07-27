// 인증 관련 JavaScript

// 전역 변수
let currentTab = 'login';

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkAuthStatus();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 로그인 폼 제출
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // 회원가입 폼 제출
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
}

// 탭 전환
function switchTab(tab) {
    currentTab = tab;
    
    // 탭 버튼 상태 변경
    document.querySelectorAll('.auth-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 폼 표시 변경
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    if (tab === 'login') {
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.getElementById('signupForm').classList.add('active');
    }
    
    // 메시지 초기화
    clearMessages();
}

// 로그인 처리
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showMessage('login', 'error', '이메일과 비밀번호를 입력해주세요.');
        return;
    }
    
    showLoading('login', true);
    
    try {
        const response = await fetch('/.netlify/functions/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 로그인 성공
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('userInfo', JSON.stringify(result.user));
            
            showMessage('login', 'success', '로그인되었습니다. 잠시 후 홈페이지로 이동합니다.');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showMessage('login', 'error', result.message || '로그인에 실패했습니다.');
        }
    } catch (error) {
        console.error('로그인 오류:', error);
        showMessage('login', 'error', '로그인 중 오류가 발생했습니다.');
    } finally {
        showLoading('login', false);
    }
}

// 회원가입 처리
async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    
    if (!name || !email || !phone) {
        showMessage('signup', 'error', '모든 필드를 입력해주세요.');
        return;
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('signup', 'error', '올바른 이메일 형식을 입력해주세요.');
        return;
    }
    
    // 전화번호 형식 검증
    const phoneRegex = /^01[0-9]-[0-9]{4}-[0-9]{4}$/;
    if (!phoneRegex.test(phone)) {
        showMessage('signup', 'error', '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)');
        return;
    }
    
    showLoading('signup', true);
    
    try {
        const response = await fetch('/.netlify/functions/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('signup', 'success', '회원가입이 완료되었습니다. 로그인해주세요.');
            
            // 로그인 탭으로 전환
            setTimeout(() => {
                switchTab('login');
                document.getElementById('loginEmail').value = email;
            }, 2000);
        } else {
            showMessage('signup', 'error', result.message || '회원가입에 실패했습니다.');
        }
    } catch (error) {
        console.error('회원가입 오류:', error);
        showMessage('signup', 'error', '회원가입 중 오류가 발생했습니다.');
    } finally {
        showLoading('signup', false);
    }
}

// 소셜 로그인
function socialLogin(provider) {
    // 실제 구현에서는 각 소셜 로그인 SDK를 사용
    alert(`${provider} 로그인은 현재 개발 중입니다.`);
}

// 인증 상태 확인
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
        // 이미 로그인된 상태라면 홈페이지로 리다이렉트
        window.location.href = 'index.html';
    }
}

// 로딩 상태 표시/숨김
function showLoading(formType, show) {
    const loadingElement = document.getElementById(`${formType}Loading`);
    if (show) {
        loadingElement.classList.add('show');
    } else {
        loadingElement.classList.remove('show');
    }
}

// 메시지 표시
function showMessage(formType, type, message) {
    const messageElement = document.getElementById(`${formType}Message`);
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.style.display = 'block';
    
    // 5초 후 메시지 숨김
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}

// 메시지 초기화
function clearMessages() {
    document.querySelectorAll('.message').forEach(msg => {
        msg.style.display = 'none';
    });
}

// 이용약관 표시
function showTerms() {
    alert('이용약관\n\n1. 서비스 이용\n- 펫쌤 서비스는 반려동물과 식물 케어를 위한 전문가 상담 서비스입니다.\n- 모든 상담은 전문가의 의견이며, 최종 진단은 수의사에게 문의하시기 바랍니다.\n\n2. 개인정보 보호\n- 회원의 개인정보는 서비스 제공 목적으로만 사용됩니다.\n- 제3자에게 개인정보를 제공하지 않습니다.\n\n3. 서비스 이용료\n- 기본 상담은 무료이며, 프리미엄 서비스는 별도 요금이 적용됩니다.\n- 요금제 변경 및 해지는 언제든지 가능합니다.');
}

// 개인정보처리방침 표시
function showPrivacy() {
    alert('개인정보처리방침\n\n1. 수집하는 개인정보\n- 필수: 이름, 이메일, 전화번호\n- 선택: 반려동물 정보, 상담 내용\n\n2. 개인정보의 이용목적\n- 서비스 제공 및 고객 지원\n- 상담 서비스 제공\n- 서비스 개선 및 마케팅\n\n3. 개인정보의 보유 및 이용기간\n- 회원 탈퇴 시까지\n- 법정 보존기간이 있는 경우 해당 기간까지\n\n4. 개인정보의 파기\n- 회원 탈퇴 시 즉시 파기\n- 전자적 파일 형태는 복구 불가능한 방법으로 영구 삭제');
}

// 전화번호 자동 포맷팅
document.getElementById('signupPhone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/[^0-9]/g, '');
    
    if (value.length >= 3 && value.length <= 7) {
        value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2');
    } else if (value.length >= 8) {
        value = value.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1-$2-$3');
    }
    
    e.target.value = value;
}); 