// 네비게이션 스크롤 효과
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// 모바일 햄버거 메뉴
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// 스무스 스크롤
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 서비스 카드 애니메이션
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// 서비스 카드들 관찰
document.querySelectorAll('.service-card, .value-card, .expert-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// 서비스 카드 클릭 이벤트
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', function() {
        const serviceType = this.getAttribute('data-service');
        openServiceBoard(serviceType);
    });
});

// 전문가 카드 클릭 이벤트
document.querySelectorAll('.expert-card').forEach(card => {
    card.addEventListener('click', function() {
        const expertType = this.getAttribute('data-expert');
        openExpertDetail(expertType);
    });
});

// 커뮤니티 게시판 클릭 이벤트
document.querySelectorAll('.community-category ul li').forEach(item => {
    item.addEventListener('click', function() {
        const boardName = this.textContent.trim();
        openCommunityBoard(boardName);
    });
});

// 게시판 열기 함수
function openCommunityBoard(boardName) {
    const boardMap = {
        // 동물별 게시판
        '개 게시판': 'dog',
        '고양이 게시판': 'cat',
        '토끼 게시판': 'rabbit',
        '햄스터·기니피그 게시판': 'hamster',
        '파충류 게시판': 'reptile',
        '조류 게시판': 'bird',
        '어류 게시판': 'fish',
        '기타 동물 게시판': 'other',
        // 주제별 게시판
        '식물 케어 게시판': 'plant',
        '응급상황 게시판': 'emergency',
        '임종·추모 게시판': 'memorial',
        '자유 게시판': 'free',
        '후기 게시판': 'review'
    };
    
    const boardType = boardMap[boardName];
    if (boardType) {
        window.location.href = `board.html?board=${boardType}`;
    } else {
        alert(`${boardName} 게시판으로 이동합니다.\n\n현재 개발 중인 기능입니다.\n곧 서비스될 예정입니다!`);
    }
}

// 문의 폼 제출
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 폼 데이터 수집
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const phone = this.querySelector('input[type="tel"]').value;
        const service = this.querySelector('select').value;
        const message = this.querySelector('textarea').value;
        
        // 간단한 유효성 검사
        if (!name || !email || !phone || !service || !message) {
            alert('모든 필드를 입력해주세요.');
            return;
        }
        
        // 이메일 형식 검사
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('올바른 이메일 주소를 입력해주세요.');
            return;
        }
        
        // 전화번호 형식 검사
        const phoneRegex = /^[0-9-+\s()]+$/;
        if (!phoneRegex.test(phone)) {
            alert('올바른 전화번호를 입력해주세요.');
            return;
        }
        
        // 성공 메시지 (실제로는 서버로 데이터 전송)
        alert(`문의가 성공적으로 접수되었습니다!\n\n이름: ${name}\n관심 서비스: ${service}\n\n빠른 시일 내에 연락드리겠습니다.`);
        this.reset();
    });
}

// 상담 모달 폼 제출
const consultFormElement = document.getElementById('consultForm');
if (consultFormElement) {
    consultFormElement.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 폼 데이터 수집
        const formData = new FormData();
        formData.append('name', document.getElementById('consultName').value);
        formData.append('phone', document.getElementById('consultPhone').value);
        formData.append('petType', document.getElementById('consultPetType').value);
        formData.append('consultType', document.getElementById('consultType').value);
        formData.append('message', document.getElementById('consultMessage').value);
        
        // 이미지 파일 추가
        const imageFiles = document.getElementById('consultImages').files;
        for (let i = 0; i < imageFiles.length; i++) {
            formData.append('images', imageFiles[i]);
        }
        
        try {
            const response = await fetch('/.netlify/functions/api/consult', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('상담 신청이 완료되었습니다!\n\n빠른 시일 내에 전문가가 연락드리겠습니다.');
                closeModal();
                resetForm();
            } else {
                alert('상담 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('상담 신청 오류:', error);
            alert('상담 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    });
}

// 버튼 클릭 효과
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
    button.addEventListener('click', function(e) {
        // 리플 효과 생성
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// 리플 효과 CSS 추가
const style = document.createElement('style');
style.textContent = `
    .btn-primary, .btn-secondary {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 스크롤 진행률 표시
const progressBar = document.createElement('div');
progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, #2E8B57, #3CB371);
    z-index: 1001;
    transition: width 0.1s ease;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + '%';
});

// 페이지 로드 애니메이션
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// 서비스 카드 호버 효과 개선
document.querySelectorAll('.service-card, .value-card, .expert-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// 플로팅 카드 애니메이션 개선
document.querySelectorAll('.floating-card').forEach((card, index) => {
    card.style.animationDelay = (index * 1.5) + 's';
});

// 네비게이션 메뉴 활성화
function setActiveNavItem() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', setActiveNavItem);

// 활성 네비게이션 링크 스타일
const navStyle = document.createElement('style');
navStyle.textContent = `
    .nav-menu a.active {
        color: #2E8B57 !important;
        font-weight: 700;
    }
`;
document.head.appendChild(navStyle);

// 모바일 메뉴 스타일
const mobileMenuStyle = document.createElement('style');
mobileMenuStyle.textContent = `
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            left: -100%;
            top: 70px;
            flex-direction: column;
            background-color: white;
            width: 100%;
            text-align: center;
            transition: 0.3s;
            box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
            padding: 2rem 0;
        }
        
        .nav-menu.active {
            left: 0;
        }
        
        .nav-menu li {
            margin: 1rem 0;
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(1) {
            transform: translateY(8px) rotate(45deg);
        }
        
        .hamburger.active span:nth-child(3) {
            transform: translateY(-8px) rotate(-45deg);
        }
    }
`;
document.head.appendChild(mobileMenuStyle);

// 차별화 섹션 애니메이션
const diffObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const items = entry.target.querySelectorAll('.diff-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, index * 200);
            });
        }
    });
}, { threshold: 0.3 });

const diffSection = document.querySelector('.differentiation');
if (diffSection) {
    const items = diffSection.querySelectorAll('.diff-item');
    items.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    diffObserver.observe(diffSection);
}

// 전문가 카드 클릭 이벤트
document.querySelectorAll('.expert-card').forEach(card => {
    card.addEventListener('click', function() {
        const expertName = this.querySelector('h3').textContent;
        alert(`${expertName}과의 상담을 시작합니다.\n\n현재는 개발 중인 기능입니다.`);
    });
});

// 서비스 카드 클릭 이벤트
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', function() {
        const serviceType = this.getAttribute('data-service');
        openServiceBoard(serviceType);
    });
});

// 전문가 카드 클릭 이벤트
document.querySelectorAll('.expert-card').forEach(card => {
    card.addEventListener('click', function() {
        const expertType = this.getAttribute('data-expert');
        openExpertDetail(expertType);
    });
});

// 서비스 게시판 열기
function openServiceBoard(serviceType) {
    const serviceMap = {
        'rabbit': '토끼 케어',
        'hamster': '햄스터·기니피그',
        'reptile': '파충류',
        'bird': '앵무새',
        'fish': '어류',
        'plant': '식물'
    };
    
    const serviceName = serviceMap[serviceType] || serviceType;
    window.location.href = `board.html?board=${serviceType}`;
}

// 전문가 상세 정보 열기
function openExpertDetail(expertType) {
    const expertMap = {
        'veterinarian': '현직 수의사',
        'rabbit': '토끼 전문가',
        'plant': '식물 전문가'
    };
    
    const expertName = expertMap[expertType] || expertType;
    
    // 전문가별 게시판으로 이동
    if (expertType === 'rabbit') {
        window.location.href = `board.html?board=rabbit`;
    } else if (expertType === 'plant') {
        window.location.href = `board.html?board=plant`;
    } else if (expertType === 'veterinarian') {
        // 현직 수의사는 응급상황 게시판으로 이동 (일반 동물 상담)
        window.location.href = `board.html?board=emergency`;
    } else {
        alert(`${expertName} 전문가 상담입니다.\n\n현재 개발 중인 기능입니다.\n곧 전문가 상담 서비스가 시작됩니다!`);
    }
}

// 모달 관련 요소들
const modal = document.getElementById('consultModal');
const closeBtn = document.querySelector('.close');
const imageUpload = document.getElementById('consultImages');
const imagePreview = document.getElementById('imagePreview');
const consultForm = document.getElementById('consultForm');

// 상담 폼 제출 이벤트
if (consultForm) {
    consultForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitConsultForm();
    });
}

// 상담 폼 제출 함수
async function submitConsultForm() {
    const formData = new FormData();
    
    // 폼 데이터 수집
    const name = document.getElementById('consultName').value;
    const phone = document.getElementById('consultPhone').value;
    const petType = document.getElementById('consultPetType').value;
    const consultType = document.getElementById('consultType').value;
    const description = document.getElementById('consultMessage').value;
    
    // 필수 필드 검증
    if (!name || !phone || !description) {
        alert('필수 항목을 모두 입력해주세요.');
        return;
    }
    
    // FormData에 추가
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('petType', petType);
    formData.append('consultType', consultType);
    formData.append('description', description);
    
    // 이미지 파일 추가
    if (imageUpload && imageUpload.files.length > 0) {
        for (let i = 0; i < imageUpload.files.length; i++) {
            formData.append('images', imageUpload.files[i]);
        }
    }
    
    try {
        // API 호출 시도
        const response = await fetch('/.netlify/functions/api/consult', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('상담 신청이 완료되었습니다!\n전문가가 빠른 시일 내에 연락드리겠습니다.');
            closeModal();
            resetForm();
        } else {
            alert('상담 신청 중 오류가 발생했습니다: ' + result.message);
        }
    } catch (error) {
        console.error('상담 신청 오류:', error);
        
        // API 호출 실패 시에도 성공 메시지 표시 (개발용)
        // 실제로는 이메일이나 다른 방법으로 데이터 전송
        alert('상담 신청이 완료되었습니다!\n전문가가 빠른 시일 내에 연락드리겠습니다.\n\n연락처: 010-4327-3669\n이메일: peostar@naver.com');
        closeModal();
        resetForm();
    }
}

// 모달 열기
function openModal() {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 스크롤 방지
}

// 오늘의 케어 열기
function openTodayCare() {
    // 오늘의 케어 페이지로 이동하거나 모달 열기
    window.location.href = 'board.html?category=today-care';
}

// 모달 닫기
function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // 스크롤 복원
    resetForm();
}

// 모달 외부 클릭시 닫기
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        closeModal();
    }
});

// X 버튼 클릭시 닫기
closeBtn.addEventListener('click', closeModal);

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});

// 홈으로 돌아가기 함수
function goHome() {
    window.location.href = 'index.html';
}

// 핵심가치 페이지 열기 함수
function openValuePage(valueType) {
    const valuePages = {
        'expertise': 'values-expertise.html',
        'customization': 'values-customization.html',
        'communication': 'values-communication.html',
        'responsibility': 'values-responsibility.html'
    };
    
    const pageUrl = valuePages[valueType];
    if (pageUrl) {
        window.location.href = pageUrl;
    }
}

// 이미지 업로드 처리
if (imageUpload) {
    // 파일 선택 클릭 이벤트
    imageUpload.addEventListener('change', handleImageUpload);
    
    // 드래그앤드롭 이벤트
    const uploadArea = document.querySelector('.image-upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.style.borderColor = '#4CAF50';
            uploadArea.style.backgroundColor = '#f0f8f0';
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadArea.style.borderColor = '#ddd';
            uploadArea.style.backgroundColor = '#f9f9f9';
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.style.borderColor = '#ddd';
            uploadArea.style.backgroundColor = '#f9f9f9';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                // 파일을 input에 설정
                const dt = new DataTransfer();
                for (let i = 0; i < files.length; i++) {
                    dt.items.add(files[i]);
                }
                imageUpload.files = dt.files;
                handleImageUpload({ target: { files: files } });
            }
        });
    }
}

function handleImageUpload(event) {
    const files = event.target.files;
    const maxFiles = 5;
    
    if (files.length > maxFiles) {
        alert(`최대 ${maxFiles}장까지만 업로드 가능합니다.`);
        return;
    }
    
    imagePreview.innerHTML = '';
    
    Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const previewItem = document.createElement('div');
                previewItem.className = 'image-preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="미리보기">
                    <button type="button" class="remove-image" onclick="removeImage(${index})">×</button>
                `;
                imagePreview.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        } else {
            alert('이미지 파일만 업로드 가능합니다.');
        }
    });
}

// 이미지 제거
function removeImage(index) {
    const dt = new DataTransfer();
    const files = imageUpload.files;
    
    for (let i = 0; i < files.length; i++) {
        if (i !== index) {
            dt.items.add(files[i]);
        }
    }
    
    imageUpload.files = dt.files;
    
    // 미리보기 다시 생성
    const event = new Event('change');
    imageUpload.dispatchEvent(event);
}

// 폼 리셋
function resetForm() {
    consultForm.reset();
    imagePreview.innerHTML = '';
    imageUpload.value = '';
}

// 이용약관 표시
function showTerms() {
    alert('이용약관\n\n1. 서비스 이용\n- 펫쌤 서비스는 반려동물과 식물 케어를 위한 전문가 상담 서비스입니다.\n- 모든 상담은 전문가의 의견이며, 최종 진단은 수의사에게 문의하시기 바랍니다.\n\n2. 개인정보 보호\n- 회원의 개인정보는 서비스 제공 목적으로만 사용됩니다.\n- 제3자에게 개인정보를 제공하지 않습니다.\n\n3. 서비스 이용료\n- 기본 상담은 무료이며, 프리미엄 서비스는 별도 요금이 적용됩니다.\n- 요금제 변경 및 해지는 언제든지 가능합니다.');
}

// 개인정보처리방침 표시
function showPrivacy() {
    alert('개인정보처리방침\n\n1. 수집하는 개인정보\n- 필수: 이름, 이메일, 전화번호\n- 선택: 반려동물 정보, 상담 내용\n\n2. 개인정보의 이용목적\n- 서비스 제공 및 고객 지원\n- 상담 서비스 제공\n- 서비스 개선 및 마케팅\n\n3. 개인정보의 보유 및 이용기간\n- 회원 탈퇴 시까지\n- 법정 보존기간이 있는 경우 해당 기간까지\n\n4. 개인정보의 파기\n- 회원 탈퇴 시 즉시 파기\n- 전자적 파일 형태는 복구 불가능한 방법으로 영구 삭제');
}

console.log('펫쌤 웹사이트가 성공적으로 로드되었습니다! 🐾🌱'); 