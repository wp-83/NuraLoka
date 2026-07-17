<?php

// 인증/계정 화면: Login, Register, DetailAccount, ForgetPassword,
// ForgetPasswordSuccess, ResetPassword, Banned.
return [
    // ── 로그인 ──
    'login' => [
        'meta_title' => '로그인',
        'meta_description' => 'NuraLoka와 함께 인도네시아 도시 간 여행 경로를 따라 최고의 관광지, 먹거리, 휴게 장소 추천을 만나보세요.',
        'welcome_greeting' => '안녕하세요, Nuravers!',
        'welcome_back' => '다시 오신 것을 환영합니다',
        'title' => '로그인',
        'subtitle' => ':app와 함께 인도네시아를 탐험하려면 계정에 로그인하세요!',
        'identity_label' => '이메일 또는 사용자 이름',
        'identity_placeholder' => 'your.email@gmail.com',
        'password_label' => '비밀번호',
        'password_placeholder' => '비밀번호',
        'forgot_password' => '비밀번호를 잊으셨나요?',
        'remember_me' => '30일 동안 로그인 유지',
        'submit' => '로그인',
        'submit_processing' => '데이터 확인 중...',
        'google' => 'Google로 로그인',
        'no_account' => '계정이 없으신가요?',
        'register_now' => '지금 가입하기!',
    ],

    // 로그인 배경 슬라이드(장소명·위치는 고유명사로 유지)
    'login_slides' => [
        ['name' => '보로부두르 사원', 'loc' => '마글랑, 중부자바', 'desc' => '독특한 스투파를 지닌 세계 최대의 불교 사원이자 유네스코 세계유산입니다.'],
        ['name' => '크린치 산', 'loc' => '크린치, 잠비', 'desc' => '수마트라 최고봉으로 웅장한 경관을 자랑하며 자주 안개에 덮여 있습니다.'],
        ['name' => '파페다', 'loc' => '자야푸라, 파푸아', 'desc' => '사고를 재료로 한 걸쭉한 식감의 전통 음식으로, 보통 생선 국물과 함께 제공됩니다.'],
        ['name' => '전통 직조', 'loc' => '시카, 동누사틍가라', 'desc' => '색실을 사용해 전통 베틀로 천을 짜며 지역 고유의 문양을 만들어냅니다.'],
        ['name' => '인도네시아 0km 지점', 'loc' => '사방, 아체', 'desc' => '인도네시아 최서단 경계를 표시하는 0km 지점 기념비입니다.'],
    ],

    // ── 회원가입 ──
    'register' => [
        'layout_title' => '계정 만들기',
        'title' => '계정 만들기',
        'subtitle' => '지금 :app의 일원이 되어 인도네시아를 탐험해 보세요!',
        'username_label' => '사용자 이름',
        'username_placeholder' => 'funnyname123',
        'email_label' => '이메일',
        'email_placeholder' => 'your.email@gmail.com',
        'password_label' => '비밀번호',
        'password_placeholder' => '비밀번호',
        'confirm_label' => '비밀번호 확인',
        'confirm_placeholder' => '비밀번호를 확인하세요',
        'submit' => '계정 만들기',
        'submit_processing' => '계정 등록 중...',
        'google' => 'Google로 가입',
        'have_account' => '이미 계정이 있으신가요?',
        'login_now' => '지금 로그인!',
    ],

    // ── 계정 정보(프로필 완성) ──
    'detail' => [
        'layout_title' => '계정 정보',
        'title' => '계정 정보',
        'subtitle' => ':app의 일원이 되기까지 한 단계 남았습니다!',
        'fullname_label' => '이름',
        'fullname_placeholder' => '홍길동',
        'dob_label' => '생년월일',
        'gender_label' => '성별',
        'gender_placeholder' => '성별을 선택하세요',
        'province_label' => '거주 주(州)',
        'province_placeholder' => '현재 거주 중인 주',
        'data_approval' => '회원가입 및 계정 확인 절차를 위한 개인정보 이용에 동의하며 이를 읽었습니다.',
        'submit' => '데이터 저장 후 로그인',
        'submit_processing' => '데이터 확인 중...',
    ],

    // ── 비밀번호 찾기 ──
    'forgot' => [
        'meta_title' => '비밀번호 재설정',
        'title' => '비밀번호 재설정',
        'desc' => '계정에 등록된 이메일을 입력하세요. 비밀번호를 재설정할 수 있는 링크를 이메일로 보내드립니다.',
        'email_placeholder' => '계정 이메일 주소를 입력하세요...',
        'submit' => '비밀번호 재설정 링크 보내기',
        'submit_processing' => '전송 중...',
        'remember_password' => '비밀번호가 기억나셨나요?',
        'login_now' => '지금 로그인!',
    ],

    // ── 비밀번호 찾기(전송 성공) ──
    'forgot_success' => [
        'title' => '인증 이메일이 성공적으로 전송되었습니다!',
        'desc' => '비밀번호를 재설정하기 전에 이메일을 확인하여 인증해 주세요.',
        'back_to_login' => '로그인 페이지로 돌아가기',
    ],

    // ── 비밀번호 재설정 ──
    'reset' => [
        'meta_title' => '비밀번호 재설정',
        'title' => '비밀번호 재설정',
        'for_account' => ':name 계정',
        'password_label' => '새 비밀번호',
        'password_placeholder' => '새 비밀번호를 입력하세요',
        'confirm_label' => '새 비밀번호 확인',
        'confirm_placeholder' => '새 비밀번호를 다시 입력하세요',
        'submit' => '비밀번호 저장',
        'submit_processing' => '저장 중...',
    ],

    // ── 계정 차단 ──
    'banned' => [
        'title' => '계정이 차단되었습니다',
        'desc' => '죄송합니다. 회원님의 계정이 차단되어 현재 NuraLoka 서비스를 이용할 수 없습니다. 오류라고 생각되시면 관리자에게 문의해 주세요.',
        'back_home' => '홈으로 돌아가기',
    ],

    // 성별(계정 폼에서 사용)
    'gender_male' => '남성',
    'gender_female' => '여성',
    'gender_unspecified' => '밝히지 않음',
];
