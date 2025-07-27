// PayPal 결제 처리 JavaScript

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializePayPalButtons();
    checkAuthStatus();
});

// PayPal 버튼 초기화
function initializePayPalButtons() {
    // 기본 케어 플랜 (₩3,900/월)
    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: '3.90', // USD로 변환 (약 3,900원)
                        currency_code: 'USD'
                    },
                    description: '펫쌤 기본 케어 플랜 (월 구독)',
                    custom_id: 'basic_care_monthly'
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                // 결제 성공 처리
                handlePaymentSuccess(details, 'basic_care_monthly', 3900);
            });
        },
        onError: function(err) {
            console.error('PayPal 결제 오류:', err);
            alert('결제 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }).render('#paypal-button-container-basic');

    // 프리미엄 케어 플랜 (₩9,900/월)
    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: '9.90', // USD로 변환 (약 9,900원)
                        currency_code: 'USD'
                    },
                    description: '펫쌤 프리미엄 케어 플랜 (월 구독)',
                    custom_id: 'premium_care_monthly'
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                // 결제 성공 처리
                handlePaymentSuccess(details, 'premium_care_monthly', 9900);
            });
        },
        onError: function(err) {
            console.error('PayPal 결제 오류:', err);
            alert('결제 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }).render('#paypal-button-container-premium');
}

// 결제 성공 처리
async function handlePaymentSuccess(details, planType, amount) {
    try {
        // 결제 정보를 서버로 전송
        const paymentData = {
            orderId: details.id,
            planType: planType,
            amount: amount,
            payerEmail: details.payer.email_address,
            payerName: details.payer.name.given_name + ' ' + details.payer.name.surname,
            paymentDate: new Date().toISOString(),
            status: 'completed'
        };

        const response = await fetch('/.netlify/functions/api/payment/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        const result = await response.json();

        if (result.success) {
            // 결제 성공 메시지 표시
            showPaymentSuccess(planType, amount);
            
            // 사용자 정보 업데이트 (로그인된 경우)
            updateUserSubscription(planType);
        } else {
            console.error('결제 처리 실패:', result.message);
            alert('결제는 완료되었지만 서비스 등록 중 오류가 발생했습니다. 고객센터에 문의해주세요.');
        }
    } catch (error) {
        console.error('결제 처리 오류:', error);
        alert('결제는 완료되었지만 서비스 등록 중 오류가 발생했습니다. 고객센터에 문의해주세요.');
    }
}

// 결제 성공 메시지 표시
function showPaymentSuccess(planType, amount) {
    const planNames = {
        'basic_care_monthly': '기본 케어 플랜',
        'premium_care_monthly': '프리미엄 케어 플랜'
    };

    const planName = planNames[planType] || '선택한 플랜';
    
    // 성공 메시지 모달 표시
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;

    modal.innerHTML = `
        <div style="
            background: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 400px;
            margin: 20px;
        ">
            <div style="
                width: 80px;
                height: 80px;
                background: #10b981;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
            ">
                <i class="fas fa-check" style="color: white; font-size: 2rem;"></i>
            </div>
            <h2 style="color: #1e3a8a; margin-bottom: 15px;">결제 완료!</h2>
            <p style="color: #666; margin-bottom: 20px;">
                ${planName} 구독이 완료되었습니다.<br>
                금액: ₩${amount.toLocaleString()}/월
            </p>
            <p style="color: #666; font-size: 0.9rem; margin-bottom: 30px;">
                서비스 이용 안내는 이메일로 발송됩니다.
            </p>
            <button onclick="this.parentElement.parentElement.remove(); window.location.href='index.html';" style="
                background: #1e3a8a;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
            ">
                홈으로 돌아가기
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

// 사용자 구독 정보 업데이트
async function updateUserSubscription(planType) {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        try {
            const user = JSON.parse(userInfo);
            const response = await fetch('/.netlify/functions/api/user/subscription', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    planType: planType,
                    status: 'active'
                })
            });

            const result = await response.json();
            if (result.success) {
                // 로컬 스토리지 업데이트
                user.subscription = {
                    planType: planType,
                    status: 'active',
                    startDate: new Date().toISOString()
                };
                localStorage.setItem('userInfo', JSON.stringify(user));
            }
        } catch (error) {
            console.error('구독 정보 업데이트 오류:', error);
        }
    }
}

// 인증 상태 확인
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('userInfo');
    
    if (token && userInfo) {
        // 로그인된 사용자에게 환영 메시지 표시
        const user = JSON.parse(userInfo);
        showWelcomeMessage(user.name);
    }
}

// 환영 메시지 표시
function showWelcomeMessage(userName) {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1e3a8a;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.5s ease;
    `;

    welcomeDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-user-circle" style="font-size: 1.2rem;"></i>
            <span>${userName}님 환영합니다!</span>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                margin-left: 10px;
            ">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // CSS 애니메이션 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(welcomeDiv);

    // 5초 후 자동으로 사라짐
    setTimeout(() => {
        if (welcomeDiv.parentElement) {
            welcomeDiv.remove();
        }
    }, 5000);
}

// 단일 상담 서비스 결제 처리
function handleSingleConsultation(serviceType, amount) {
    const serviceNames = {
        'basic_consult': '수의사 직접 상담',
        'special_consult': '특수동물 전문 상담',
        'deep_consult': '수의사 심층 진단',
        'hospice_care': '호스피스 케어 패키지'
    };

    const serviceName = serviceNames[serviceType] || '상담 서비스';
    
    if (confirm(`${serviceName} (₩${amount.toLocaleString()})을 결제하시겠습니까?`)) {
        // PayPal 결제 창 열기
        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: (amount / 1000).toFixed(2), // USD로 변환
                            currency_code: 'USD'
                        },
                        description: `펫쌤 ${serviceName}`,
                        custom_id: serviceType
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    handlePaymentSuccess(details, serviceType, amount);
                });
            }
        }).render('#paypal-button-container-single');
    }
} 