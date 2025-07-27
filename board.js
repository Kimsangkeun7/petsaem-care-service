// 게시판 JavaScript

// 전역 변수
let currentBoard = '';
let currentPosts = [];
let filteredPosts = [];
let currentPage = 1;
const postsPerPage = 10;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // URL 파라미터에서 게시판 정보 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    currentBoard = urlParams.get('board') || 'rabbit';
    
    initializeBoard();
    loadPosts();
    setupEventListeners();
});

// 게시판 초기화
function initializeBoard() {
    const boardConfig = {
        // 동물별 게시판
        dog: {
            icon: '🐕',
            title: '개 게시판',
            description: '강아지 건강, 훈련, 정보 공유'
        },
        cat: {
            icon: '🐱',
            title: '고양이 게시판',
            description: '고양이 건강, 행동, 정보 공유'
        },
        rabbit: {
            icon: '🐰',
            title: '토끼 케어 게시판',
            description: '토끼 전문 수의사의 사육법, 건강 관리, 영양 상담'
        },
        hamster: {
            icon: '🐹',
            title: '햄스터·기니피그 케어 게시판',
            description: '설치류 전문가의 맞춤 케어와 건강 관리'
        },
        reptile: {
            icon: '🦎',
            title: '파충류 케어 게시판',
            description: '이구아나, 거북이, 뱀 등 파충류 전문 상담'
        },
        bird: {
            icon: '🦜',
            title: '앵무새 케어 게시판',
            description: '앵무새, 카나리아 등 조류 전문 건강 관리'
        },
        fish: {
            icon: '🐠',
            title: '어류 케어 게시판',
            description: '관상어, 수족관 관리 전문 상담'
        },
        other: {
            icon: '🐾',
            title: '기타 동물 게시판',
            description: '페럿, 친칠라 등 기타 반려동물 케어'
        },
        // 주제별 게시판
        plant: {
            icon: '🌱',
            title: '식물 케어 게시판',
            description: '실내식물, 다육식물 전문 진단 및 관리'
        },
        emergency: {
            icon: '🚨',
            title: '응급상황 게시판',
            description: '현직 수의사의 긴급 상담 및 일반 동물 건강 상담'
        },
        memorial: {
            icon: '💔',
            title: '임종·추모 게시판',
            description: '호스피스, 펫로스 상담'
        },
        free: {
            icon: '💬',
            title: '자유 게시판',
            description: '일상 공유, 자유 토론'
        },
        review: {
            icon: '⭐',
            title: '후기 게시판',
            description: '상담 후기, 제품 리뷰'
        }
    };

    const config = boardConfig[currentBoard];
    if (config) {
        document.getElementById('boardIcon').textContent = config.icon;
        document.getElementById('boardTitle').textContent = config.title;
        document.getElementById('boardDescription').textContent = config.description;
        document.title = config.title + ' - 펫쌤';
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 필터 이벤트
    document.getElementById('categoryFilter').addEventListener('change', filterPosts);
    document.getElementById('sortFilter').addEventListener('change', sortPosts);
    
    // 검색 이벤트
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchPosts();
        }
    });
    
    // 글쓰기 폼 제출
    document.getElementById('writeForm').addEventListener('submit', handleWriteSubmit);
    
    // 이미지 업로드
    document.getElementById('postImages').addEventListener('change', handleImageUpload);
    
    // 모달 외부 클릭
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeWriteModal();
            closePostDetail();
        }
    });
}

// 게시글 로드
async function loadPosts() {
    try {
        const response = await fetch(`/.netlify/functions/api/posts/${currentBoard}`);
        const result = await response.json();
        
        if (result.success) {
            currentPosts = result.data;
            filteredPosts = [...currentPosts];
            renderPosts();
        } else {
            console.error('게시글 로드 실패:', result.message);
            // 임시 데이터로 폴백
            loadTempPosts();
        }
    } catch (error) {
        console.error('게시글 로드 오류:', error);
        // 임시 데이터로 폴백
        loadTempPosts();
    }
}

// 임시 게시글 데이터 (서버 연결 실패시)
function loadTempPosts() {
    const boardPosts = {
        dog: [
            {
                id: 1,
                title: '강아지 훈련 방법 알려주세요! 🐕',
                content: '6개월 된 강아지를 키우고 있는데, 기본적인 훈련을 어떻게 해야 할지 모르겠어요. 앉아, 기다려 같은 명령어 훈련법을 알려주세요.',
                category: 'training',
                author: '강아지맘',
                createdAt: '2024-01-15T10:30:00',
                views: 45,
                likes: 12,
                comments: 8,
                images: []
            }
        ],
        cat: [
            {
                id: 1,
                title: '고양이가 밤에 너무 시끄러워요 😿',
                content: '고양이가 밤에 계속 울어대서 잠을 잘 수 없어요. 어떻게 하면 고양이가 밤에 조용히 지낼 수 있을까요?',
                category: 'behavior',
                author: '고양이집사',
                createdAt: '2024-01-15T10:30:00',
                views: 38,
                likes: 15,
                comments: 12,
                images: []
            }
        ],
        rabbit: [
            {
                id: 1,
                title: '토끼가 밥을 안 먹어요 😢',
                content: '어제부터 토끼가 사료를 거의 먹지 않습니다. 평소에는 잘 먹던 아이인데 갑자기 식욕이 떨어진 것 같아요. 어떤 이유일까요?',
                category: 'health',
                author: '토끼맘',
                createdAt: '2024-01-15T10:30:00',
                views: 45,
                likes: 12,
                comments: 8,
                images: []
            }
        ],
        plant: [
            {
                id: 1,
                title: '몬스테라 잎이 노랗게 변해요 🌿',
                content: '몬스테라를 키우고 있는데 잎이 노랗게 변하고 있어요. 물을 너무 많이 준 걸까요? 관리법을 알려주세요.',
                category: 'health',
                author: '식물초보',
                createdAt: '2024-01-15T10:30:00',
                views: 52,
                likes: 18,
                comments: 15,
                images: []
            }
        ],
        emergency: [
            {
                id: 1,
                title: '강아지가 독초를 먹었어요! 🚨',
                content: '강아지가 산책 중에 풀을 먹었는데 독초일 수도 있다고 해서 걱정이에요. 어떻게 해야 할까요?',
                category: 'emergency',
                author: '긴급상황',
                createdAt: '2024-01-15T10:30:00',
                views: 120,
                likes: 25,
                comments: 30,
                images: []
            }
        ]
    };
    
    currentPosts = boardPosts[currentBoard] || [
        {
            id: 1,
            title: '새로운 게시판입니다!',
            content: '이 게시판의 첫 번째 게시글입니다. 자유롭게 글을 작성해보세요!',
            category: 'general',
            author: '관리자',
            createdAt: new Date().toISOString(),
            views: 1,
            likes: 0,
            comments: 0,
            images: []
        }
    ];
    
    filteredPosts = [...currentPosts];
    renderPosts();
}

// 게시글 렌더링
function renderPosts() {
    const container = document.getElementById('postsContainer');
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const pagePosts = filteredPosts.slice(startIndex, endIndex);
    
    container.innerHTML = '';
    
    if (pagePosts.length === 0) {
        container.innerHTML = `
            <div style="padding: 3rem; text-align: center; color: #6b7280;">
                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>게시글이 없습니다.</p>
            </div>
        `;
        return;
    }
    
    pagePosts.forEach(post => {
        const postElement = createPostElement(post);
        container.appendChild(postElement);
    });
    
    renderPagination();
}

// 게시글 요소 생성
function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'post-item';
    div.onclick = () => openPostDetail(post);
    
    const categoryText = getCategoryText(post.category);
    const createdAt = new Date(post.createdAt).toLocaleDateString('ko-KR');
    
    div.innerHTML = `
        <div class="post-header">
            <div>
                <div class="post-title">${post.title}</div>
                <div class="post-meta">
                    <span>작성자: ${post.author}</span>
                    <span>작성일: ${createdAt}</span>
                </div>
            </div>
            <span class="post-category">${categoryText}</span>
        </div>
        <div class="post-content">${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</div>
        <div class="post-footer">
            <div class="post-stats">
                <span><i class="fas fa-eye"></i> ${post.views}</span>
                <span><i class="fas fa-heart"></i> ${post.likes}</span>
                <span><i class="fas fa-comment"></i> ${post.comments}</span>
            </div>
            <div class="post-actions">
                <button onclick="event.stopPropagation(); likePost(${post.id})">
                    <i class="fas fa-heart"></i> 좋아요
                </button>
                <button onclick="event.stopPropagation(); sharePost(${post.id})">
                    <i class="fas fa-share"></i> 공유
                </button>
            </div>
        </div>
    `;
    
    return div;
}

// 카테고리 텍스트 변환
function getCategoryText(category) {
    const categoryMap = {
        'health': '건강 관리',
        'nutrition': '영양 상담',
        'behavior': '행동 교정',
        'environment': '환경 관리',
        'emergency': '응급 상황',
        'training': '훈련',
        'general': '일반'
    };
    return categoryMap[category] || category;
}

// 페이지네이션 렌더링
function renderPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // 이전 버튼
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.onclick = () => changePage(currentPage - 1);
        pagination.appendChild(prevBtn);
    }
    
    // 페이지 번호
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === currentPage ? 'active' : '';
        pageBtn.onclick = () => changePage(i);
        pagination.appendChild(pageBtn);
    }
    
    // 다음 버튼
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.onclick = () => changePage(currentPage + 1);
        pagination.appendChild(nextBtn);
    }
}

// 페이지 변경
function changePage(page) {
    currentPage = page;
    renderPosts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 게시글 필터링
function filterPosts() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    filteredPosts = currentPosts.filter(post => {
        if (categoryFilter && post.category !== categoryFilter) {
            return false;
        }
        return true;
    });
    
    currentPage = 1;
    renderPosts();
}

// 게시글 정렬
function sortPosts() {
    const sortFilter = document.getElementById('sortFilter').value;
    
    filteredPosts.sort((a, b) => {
        switch (sortFilter) {
            case 'latest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'popular':
                return b.likes - a.likes;
            case 'views':
                return b.views - a.views;
            default:
                return 0;
        }
    });
    
    currentPage = 1;
    renderPosts();
}

// 게시글 검색
function searchPosts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    filteredPosts = currentPosts.filter(post => {
        return post.title.toLowerCase().includes(searchTerm) ||
               post.content.toLowerCase().includes(searchTerm) ||
               post.author.toLowerCase().includes(searchTerm);
    });
    
    currentPage = 1;
    renderPosts();
}

// 글쓰기 모달 열기
function openWriteModal() {
    document.getElementById('writeModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 글쓰기 모달 닫기
function closeWriteModal() {
    document.getElementById('writeModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('writeForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
}

// 글쓰기 폼 제출
async function handleWriteSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    formData.append('author', '사용자'); // 임시
    
    try {
        const response = await fetch(`/.netlify/functions/api/posts/${currentBoard}`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 새 게시글을 목록에 추가
            currentPosts.unshift(result.data);
            filteredPosts = [...currentPosts];
            currentPage = 1;
            renderPosts();
            
            closeWriteModal();
            alert('게시글이 등록되었습니다!');
        } else {
            alert('게시글 등록 실패: ' + result.message);
        }
    } catch (error) {
        console.error('게시글 등록 오류:', error);
        alert('서버 연결 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
    }
}

// 이미지 업로드 처리
function handleImageUpload(event) {
    const files = event.target.files;
    const preview = document.getElementById('imagePreview');
    
    preview.innerHTML = '';
    
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
                preview.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        }
    });
}

// 이미지 제거
function removeImage(index) {
    const input = document.getElementById('postImages');
    const dt = new DataTransfer();
    const files = input.files;
    
    for (let i = 0; i < files.length; i++) {
        if (i !== index) {
            dt.items.add(files[i]);
        }
    }
    
    input.files = dt.files;
    handleImageUpload({ target: { files: input.files } });
}

// 게시글 상세보기
function openPostDetail(post) {
    const modal = document.getElementById('postDetailModal');
    const title = document.getElementById('detailTitle');
    const content = document.getElementById('detailContent');
    
    title.textContent = post.title;
    
    const createdAt = new Date(post.createdAt).toLocaleString('ko-KR');
    const categoryText = getCategoryText(post.category);
    
    content.innerHTML = `
        <div class="post-detail">
            <div class="post-detail-header">
                <h1 class="post-detail-title">${post.title}</h1>
                <div class="post-detail-meta">
                    <span>작성자: ${post.author}</span>
                    <span>작성일: ${createdAt}</span>
                    <span>카테고리: ${categoryText}</span>
                    <span>조회수: ${post.views}</span>
                </div>
            </div>
            <div class="post-detail-content">
                ${post.content.replace(/\n/g, '<br>')}
            </div>
            ${post.images && post.images.length > 0 ? `
                <div class="post-detail-images">
                    ${post.images.map(img => `
                        <div class="post-detail-image">
                            <img src="${img}" alt="게시글 이미지">
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            <div class="post-actions">
                <button onclick="likePost(${post.id})">
                    <i class="fas fa-heart"></i> 좋아요 (${post.likes})
                </button>
                <button onclick="sharePost(${post.id})">
                    <i class="fas fa-share"></i> 공유
                </button>
                <button onclick="editPost(${post.id})">
                    <i class="fas fa-edit"></i> 수정
                </button>
                <button onclick="deletePost(${post.id})">
                    <i class="fas fa-trash"></i> 삭제
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 게시글 상세 닫기
function closePostDetail() {
    document.getElementById('postDetailModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 뒤로가기
function goBack() {
    window.history.back();
}

// 홈으로 돌아가기 함수
function goHome() {
    window.location.href = 'index.html';
}

// 좋아요
function likePost(postId) {
    const post = currentPosts.find(p => p.id === postId);
    if (post) {
        post.likes++;
        renderPosts();
    }
}

// 공유
function sharePost(postId) {
    const post = currentPosts.find(p => p.id === postId);
    if (post) {
        const url = window.location.href;
        const text = `${post.title}\n\n${url}`;
        
        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: post.content.substring(0, 100),
                url: url
            });
        } else {
            navigator.clipboard.writeText(text).then(() => {
                alert('링크가 클립보드에 복사되었습니다!');
            });
        }
    }
}

// 게시글 수정
function editPost(postId) {
    alert('게시글 수정 기능은 개발 중입니다.');
}

// 게시글 삭제
function deletePost(postId) {
    if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
        currentPosts = currentPosts.filter(p => p.id !== postId);
        filteredPosts = [...currentPosts];
        renderPosts();
        closePostDetail();
        alert('게시글이 삭제되었습니다.');
    }
}

console.log('펫쌤 게시판이 로드되었습니다! 🐾🌱'); 