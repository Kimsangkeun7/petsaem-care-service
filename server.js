const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

// 미들웨어 설정
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 100 // IP당 최대 요청 수
});
app.use('/api/', limiter);

// 정적 파일 서빙
app.use(express.static(path.join(__dirname)));

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 5 // 최대 5개 파일
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
        }
    }
});

// 메인 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 관리자 페이지
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// 게시판 페이지
app.get('/board', (req, res) => {
    res.sendFile(path.join(__dirname, 'board.html'));
});

// 상담 신청 API
app.post('/api/consult', upload.array('images', 5), (req, res) => {
    try {
        const { name, phone, petType, consultType, description } = req.body;
        const images = req.files || [];

        // 필수 필드 검증
        if (!name || !phone || !description) {
            return res.status(400).json({
                success: false,
                message: '필수 항목을 모두 입력해주세요.'
            });
        }

        // 상담 데이터 생성
        const consultData = {
            id: Date.now().toString(),
            name,
            phone,
            petType: petType || '미지정',
            consultType: consultType || '일반',
            description,
            images: images.map(file => ({
                filename: file.filename,
                originalname: file.originalname,
                path: file.path
            })),
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // 데이터 저장 (임시로 파일에 저장, 나중에 DB로 변경)
        const dataPath = 'data/consults.json';
        if (!fs.existsSync('data')) {
            fs.mkdirSync('data', { recursive: true });
        }

        let consults = [];
        if (fs.existsSync(dataPath)) {
            consults = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }

        consults.push(consultData);
        fs.writeFileSync(dataPath, JSON.stringify(consults, null, 2));

        // 성공 응답
        res.json({
            success: true,
            message: '상담 신청이 완료되었습니다.',
            data: {
                id: consultData.id,
                status: consultData.status
            }
        });

    } catch (error) {
        console.error('상담 신청 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 상담 목록 조회 API (관리자용)
app.get('/api/consults', (req, res) => {
    try {
        const dataPath = 'data/consults.json';
        if (!fs.existsSync(dataPath)) {
            return res.json({
                success: true,
                data: []
            });
        }

        const consults = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        res.json({
            success: true,
            data: consults
        });

    } catch (error) {
        console.error('상담 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 상담 상태 업데이트 API (관리자용)
app.put('/api/consults/:id/status', (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const dataPath = 'data/consults.json';
        if (!fs.existsSync(dataPath)) {
            return res.status(404).json({
                success: false,
                message: '상담 데이터를 찾을 수 없습니다.'
            });
        }

        let consults = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const consultIndex = consults.findIndex(c => c.id === id);

        if (consultIndex === -1) {
            return res.status(404).json({
                success: false,
                message: '상담을 찾을 수 없습니다.'
            });
        }

        consults[consultIndex].status = status;
        consults[consultIndex].updatedAt = new Date().toISOString();

        fs.writeFileSync(dataPath, JSON.stringify(consults, null, 2));

        res.json({
            success: true,
            message: '상담 상태가 업데이트되었습니다.',
            data: consults[consultIndex]
        });

    } catch (error) {
        console.error('상담 상태 업데이트 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 게시판 API
app.get('/api/posts/:board', (req, res) => {
    try {
        const { board } = req.params;
        const dataPath = `data/posts_${board}.json`;
        
        if (!fs.existsSync(dataPath)) {
            return res.json({
                success: true,
                data: []
            });
        }

        const posts = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        res.json({
            success: true,
            data: posts
        });

    } catch (error) {
        console.error('게시글 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

app.post('/api/posts/:board', upload.array('images', 5), (req, res) => {
    try {
        const { board } = req.params;
        const { title, category, content, author } = req.body;
        const images = req.files || [];

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: '제목과 내용을 입력해주세요.'
            });
        }

        const postData = {
            id: Date.now().toString(),
            title,
            category: category || 'general',
            content,
            author: author || '익명',
            images: images.map(file => ({
                filename: file.filename,
                originalname: file.originalname,
                path: file.path
            })),
            views: 0,
            likes: 0,
            comments: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const dataPath = `data/posts_${board}.json`;
        if (!fs.existsSync('data')) {
            fs.mkdirSync('data', { recursive: true });
        }

        let posts = [];
        if (fs.existsSync(dataPath)) {
            posts = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }

        posts.unshift(postData);
        fs.writeFileSync(dataPath, JSON.stringify(posts, null, 2));

        res.json({
            success: true,
            message: '게시글이 등록되었습니다.',
            data: postData
        });

    } catch (error) {
        console.error('게시글 등록 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 업로드된 이미지 서빙
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 404 처리
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '요청한 리소스를 찾을 수 없습니다.'
    });
});

// 에러 핸들러
app.use((error, req, res, next) => {
    console.error('서버 오류:', error);
    res.status(500).json({
        success: false,
        message: '서버 오류가 발생했습니다.'
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`펫쌤 서버가 포트 ${PORT}에서 실행 중입니다! 🐾🌱`);
    console.log(`http://localhost:${PORT}`);
}); 