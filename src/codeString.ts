// This file contains the complete, self-contained Python Streamlit source code of the simulation.
// It is used in the React UI to let users preview, copy, and download the exact python app.py file.

export const streamlitCodeString = `# -*- coding: utf-8 -*-
"""
=================================================================================
견우와 직녀 은하수 시뮬레이터 (Gyeonwoo & Jignyeo Celestial Simulator)
=================================================================================
- 제작 프레임워크: Python (Streamlit)
- 핵심 설계 요소:
  1. 원클릭 완전 자동화 타임라인 시나리오 (버튼 난립 및 화면 깜빡임 해결)
  2. 천공 평평화 착시(Flattened Sky Dome Illusion)와 지구 공전의 완벽한 3D 가시화
  3. 까마귀와 까치의 오작교(Ojakgyo Bridge) 및 소원 배달통 하강 애니메이션 탑재
  4. Web Speech API 기반 한국어 나레이션 & 캐릭터 보이스 실시간 자동 싱크
  5. st.session_state 및 브라우저 sessionStorage 이중 연동을 통한 소원 보관함 영속 보존
=================================================================================
"""

import streamlit as st
import streamlit.components.v1 as components
import json

# 1. 페이지 및 탭 타이틀 초기 설정
st.set_page_config(
    page_title="견우와 직녀 은하수 시뮬레이터",
    page_icon="✨",
    layout="centered"
)

# 2. 파이썬 단에서 소원 데이터 보존을 위한 세션 상태(st.session_state) 초기화
if "wishes" not in st.session_state:
    st.session_state.wishes = []

# 3. 글로벌 밤하늘 CSS 스타일 정의 (가독성 높은 폰트 및 모던 우주 감성 적용)
st.markdown("""
<style>
    /* 우주 암흑 테마 적용 */
    .stApp {
        background-color: #02020a;
        color: #ffffff;
    }
    
    /* 텍스트 폰트 가독성 보강 */
    h1, h2, h3, p, span, div {
        font-family: 'Pretendard', -apple-system, sans-serif !important;
    }
    
    /* 아코디언 박스 디자인 커스텀 */
    div.stAlert {
        background-color: rgba(255, 255, 255, 0.04) !important;
        color: #ffffff !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 12px;
    }
</style>
""", unsafe_allow_html=True)

# 4. 앱 헤더 및 정보 보드
st.title("✨ 견우와 직녀 은하수 시뮬레이터")
st.markdown("<p style='color:#b0b0cf; font-size:14px; margin-top:-10px;'>지구의 공전에 따른 밤하늘 별자리 위치 변화와 천공 평평화 착시 과학 시뮬레이터</p>", unsafe_allow_html=True)
st.markdown("---")

# 교육용 천문학 아코디언 정보 탑재
with st.expander("📖 천공 평평화 착시 및 캐릭터 고증 정보"):
    st.markdown("""
    ### 1. 지구 공전과 천공 평평화 착시 (Flattened Sky Dome Illusion)
    * **지구의 공전**에 의해 밤하늘에 보이는 별자리의 고도가 계속해서 이동합니다.
    * **봄과 가을 (낮은 고도)**: 두 별이 밤하늘 지평선 부근에 낮게 걸쳐 뜹니다. 인간의 시각 인지 왜곡인 '천공 평평화 착시'로 인해 머리 위에 떴을 때보다 **물리적 거리는 똑같으나 심리적으로 수배는 멀고 성간 공간이 넓어 보이는 착시**를 유도합니다.
    * **여름철 칠월칠석 (높은 고도)**: 두 별이 밤하늘 정중앙인 **중천(하늘 정수리 꼭대기)**으로 높이 솟아오릅니다. 이때는 구면 인지 왜곡이 사라져 시각적으로 **두 별의 거리가 대폭 좁아지고 은하수가 밝게 밀집**해 보이게 됩니다.

    ### 2. 전통 역사 고증 복식
    * **견우 (알타이르)**: 고구려 덕흥리 벽화 소를 모는 청년 상징에 기반하여, 늠름하고 활동성 뛰어난 **고구려 바지저고리** 복식으로 형상화하였습니다.
    * **직녀 (베가)**: 하늘 강가에서 매일 베를 짜던 귀한 신분의 모습을 담아, 세밀한 전통 선을 간직한 고아한 **고구려 귀족 주름치마** 복식을 갖췄습니다.
    """)

# 5. 완전 자동화 타임라인 및 고해상도 그래픽 엔진 (HTML5, CSS3, JavaScript 임베디드)
timeline_html_code = \"\"\"
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: transparent;
            color: #ffffff;
            font-family: 'Pretendard', -apple-system, sans-serif;
            overflow: hidden;
            user-select: none;
        }

        /* 메인 우주 상자 */
        .universe-container {
            width: 100%;
            height: 440px;
            background: linear-gradient(180deg, #010105 0%, #06061a 100%);
            border-radius: 16px;
            position: relative;
            overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.1);
            box-shadow: inset 0 0 50px rgba(0,0,0,0.9);
            transition: background 2s ease-in-out;
        }

        /* 반짝이는 배경 별무리 */
        .stars-bg {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            pointer-events: none;
            opacity: 0.55;
        }

        /* 은하수 수직 강물 */
        .milky-way {
            position: absolute;
            left: 50%;
            top: -20%;
            width: 150px;
            height: 140%;
            transform: translateX(-50%) rotate(12deg);
            background: radial-gradient(ellipse at center, rgba(162, 195, 255, 0.2) 0%, rgba(130, 80, 255, 0.05) 50%, rgba(0,0,0,0) 80%);
            filter: blur(12px);
            z-index: 1;
            transition: all 2s ease-in-out;
        }

        /* 캐릭터 기본 절대좌표 정의 및 스무스 전이 */
        .star-character {
            position: absolute;
            z-index: 10;
            text-align: center;
            transition: all 2s cubic-bezier(0.25, 1, 0.5, 1);
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }

        .star-character.visible {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }

        .star-title {
            font-size: 11px;
            font-weight: bold;
            font-family: monospace;
            padding: 1px 6px;
            border-radius: 4px;
            margin-bottom: 4px;
            white-space: nowrap;
        }

        .avatar-emoji {
            font-size: 34px;
            margin: 2px 0;
            display: block;
            animation: floatEmoji 2.5s infinite alternate ease-in-out;
        }

        .clothing-badge {
            font-size: 9px;
            padding: 2px 6px;
            border-radius: 4px;
            background: rgba(0,0,0,0.75);
            border: 1px solid rgba(255,255,255,0.15);
            white-space: nowrap;
        }

        /* 오작교 다리 */
        .ojakgyo {
            position: absolute;
            left: 28%;
            right: 28%;
            top: 105px;
            height: 10px;
            border-bottom: 3px dashed rgba(255, 255, 255, 0);
            text-align: center;
            z-index: 5;
            transition: all 1.5s ease-in-out;
            opacity: 0;
        }

        .ojakgyo.active {
            opacity: 1;
            border-bottom: 3px dashed rgba(255, 255, 255, 0.4);
        }

        /* 지구 공전 궤도선 효과 */
        .orbit-line {
            position: absolute;
            left: 50%;
            bottom: -150px;
            width: 500px;
            height: 250px;
            border: 1.5px dashed rgba(34, 197, 94, 0.15);
            border-radius: 50%;
            transform: translateX(-50%);
            z-index: 2;
            pointer-events: none;
        }

        /* 지구 관찰자 위치 */
        .earth-observer {
            position: absolute;
            left: 50%;
            bottom: 12px;
            transform: translateX(-50%);
            text-align: center;
            z-index: 20;
            cursor: pointer;
        }

        .earth-ball {
            font-size: 42px;
            line-height: 1;
            filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.3));
            transition: transform 1s ease-in-out;
        }

        .earth-ball.spinning {
            animation: spinEarth 5s infinite linear;
        }

        .earth-label {
            font-size: 10px;
            color: #a3ffb1;
            background: rgba(0,0,0,0.85);
            padding: 3px 10px;
            border-radius: 6px;
            border: 1.5px solid #22c55e;
            margin-top: 4px;
            white-space: nowrap;
            font-weight: bold;
            box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
        }

        /* 안내 전광판 콘솔 */
        .narrative-console {
            position: absolute;
            left: 15px;
            right: 15px;
            top: 15px;
            background: rgba(8, 8, 24, 0.85);
            border: 1px solid rgba(99, 102, 241, 0.25);
            border-radius: 10px;
            padding: 10px 14px;
            z-index: 25;
            font-size: 12px;
            line-height: 1.45;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            transition: opacity 0.5s ease;
        }

        /* 소원 배달 봉투 */
        .wish-envelope {
            position: absolute;
            left: 50%;
            bottom: 85px;
            transform: translateX(-50%) scale(0);
            z-index: 30;
            text-align: center;
            opacity: 0;
            pointer-events: none;
        }

        .wish-envelope.delivered {
            animation: dropEnvelope 1.8s cubic-bezier(0.19, 1, 0.22, 1) forwards;
            pointer-events: auto;
        }

        /* 소원 작성 모달 카드 (완전 자동 팝업 연출) */
        .wish-form-card {
            position: absolute;
            left: 5%;
            right: 5%;
            bottom: -220px;
            background: linear-gradient(135deg, rgba(15, 10, 32, 0.98) 0%, rgba(5, 5, 15, 0.98) 100%);
            border: 1.5px solid #ffd700;
            border-radius: 12px;
            padding: 14px;
            z-index: 100;
            box-shadow: 0 -5px 25px rgba(255, 215, 0, 0.2);
            transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .wish-form-card.slide-in {
            bottom: 12px;
        }

        .wish-input {
            width: 93%;
            background: rgba(0, 0, 0, 0.6);
            border: 1.5px solid rgba(255, 215, 0, 0.3);
            border-radius: 8px;
            padding: 8px 10px;
            color: #ffffff;
            font-size: 11.5px;
            margin-top: 6px;
            outline: none;
            transition: all 0.3s;
        }

        .wish-input:focus {
            border-color: #ffd700;
            box-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
        }

        .btn-submit {
            background: linear-gradient(90deg, #ffd700 0%, #ffa500 100%);
            color: #000000;
            border: none;
            border-radius: 8px;
            padding: 8px 14px;
            font-size: 11.5px;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
            margin-top: 8px;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-submit:hover {
            transform: translateY(-1px);
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }

        /* 다시 관측하기 버튼 */
        .btn-reset {
            background: rgba(255,255,255,0.08);
            color: #ffffff;
            border: 1.5px solid rgba(255,255,255,0.15);
            border-radius: 8px;
            padding: 4px 10px;
            font-size: 10px;
            cursor: pointer;
            float: right;
            transition: all 0.3s;
        }

        .btn-reset:hover {
            background: rgba(255,255,255,0.18);
            border-color: #ffd700;
        }

        /* 애니메이션 키프레임 */
        @keyframes floatEmoji {
            0% { transform: translateY(0px) rotate(0deg); }
            100% { transform: translateY(-4px) rotate(2deg); }
        }

        @keyframes spinEarth {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes dropEnvelope {
            0% { bottom: 350px; transform: translateX(-50%) scale(0.3); opacity: 0; }
            70% { bottom: 75px; transform: translateX(-50%) scale(1.25); opacity: 1; }
            100% { bottom: 85px; transform: translateX(-50%) scale(1); opacity: 1; }
        }

        @keyframes pulseStar {
            0% { transform: scale(0.85); opacity: 0.6; }
            100% { transform: scale(1.15); opacity: 1; }
        }

        /* 자막 자막바 */
        .sub-dialogue-badge {
            background: rgba(0,0,0,0.8);
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 11px;
            margin-top: 4px;
            color: #ffd700;
            display: inline-block;
        }
    </style>
</head>
<body>

<div class="universe-container" id="universe">
    <!-- 잔잔한 별무리 -->
    <div class="stars-bg">
        <span style="position: absolute; top: 15%; left: 20%; color: #fff; font-size: 7px;">★</span>
        <span style="position: absolute; top: 35%; right: 15%; color: #fff; font-size: 5px;">★</span>
        <span style="position: absolute; top: 55%; left: 75%; color: #fff; font-size: 8px;">★</span>
        <span style="position: absolute; top: 75%; left: 12%; color: #fff; font-size: 6px;">★</span>
        <span style="position: absolute; top: 60%; right: 40%; color: #fff; font-size: 5px;">★</span>
    </div>

    <!-- 은하수 강 -->
    <div class="milky-way" id="milkyWay"></div>

    <!-- 오작교 다리 -->
    <div class="ojakgyo" id="ojakgyoBridge">
        <span style="display:inline-block; animation: floatEmoji 0.4s infinite alternate;">🐦</span>
        <span style="display:inline-block; animation: floatEmoji 0.3s infinite alternate; animation-delay:0.1s;">🐦‍⬛</span>
        <span style="display:inline-block; animation: floatEmoji 0.5s infinite alternate; animation-delay:0.2s;">🐦</span>
    </div>

    <!-- 견우성 (알타이르) -->
    <div class="star-character" id="altair">
        <div class="star-title" style="color: #ffd700; text-shadow: 0 0 8px #ffd700;">⭐ 알타이르</div>
        <span class="avatar-emoji">🧔</span>
        <div class="clothing-badge" style="color: #a5c5ff; border-color: rgba(165,197,255,0.3);">견우 (Altair)</div>
    </div>

    <!-- 직녀성 (베가) -->
    <div class="star-character" id="vega">
        <div class="star-title" style="color: #a3e2ff; text-shadow: 0 0 8px #a3e2ff;">베가 ⭐</div>
        <span class="avatar-emoji">👸</span>
        <div class="clothing-badge" style="color: #ffaef8; border-color: rgba(255,174,248,0.3);">직녀 (Vega)</div>
    </div>

    <!-- 소원 배달 봉투 -->
    <div class="wish-envelope" id="wishEnvelope">
        <div style="font-size:10px; color:gold; background:rgba(0,0,0,0.85); border:1.5px solid gold; border-radius:4px; padding:2px 6px; white-space:nowrap; margin-bottom:2px;">
            ✉️ 소원봉투 안착
        </div>
        <span style="font-size: 38px;">💌</span>
    </div>

    <!-- 지구 관찰자 -->
    <div class="earth-observer" id="earthObserver" onclick="startTimeline()">
        <span style="font-size:22px; display:block; animation: floatEmoji 2s infinite alternate ease-in-out;">🧑‍🚀</span>
        <div class="earth-ball" id="earthBall">🌍</div>
        <div class="earth-label" id="earthLabel">지구의 나 (관찰자) 🌍</div>
    </div>

    <!-- 안내 전광판 콘솔 -->
    <div class="narrative-console" id="console">
        <div style="font-weight: bold; color: #ffd700; margin-bottom: 2px;">🌌 관측 대기 콘솔</div>
        <span id="narrativeText">가운데 지구(🌍) 캐릭터를 클릭하여 지구의 공전을 가동하고 천문 설화 애니메이션을 자동 재생시키세요.</span>
    </div>

    <!-- 소원 편지 입력란 모달 카드 (자동 슬라이드인) -->
    <div class="wish-form-card" id="wishFormCard">
        <div style="font-size:12px; font-weight:bold; color:#ffd700; display:flex; justify-content:space-between; align-items:center;">
            <span>✍️ 은하수에 새길 소원 작성 편지지</span>
            <span style="font-size:9px; color:#aaa;">오작교 결성 축복</span>
        </div>
        <input type="text" id="wishInput" class="wish-input" placeholder="정성스레 기원할 소원을 여기에 적어주세요...">
        <div id="errorText" style="color:#ff6b6b; font-size:10px; margin-top:4px; display:none;"></div>
        <button class="btn-submit" onclick="submitWish()">하늘 높이 소원 별 쏘아 올리기 🚀</button>
    </div>
</div>

<script>
    let currentStep = "ready";
    let timelineTimer = null;

    const narrativeData = {
        "spring_autumn": "지구가 공전함에 따라 봄과 가을 계절이 되어 견우와 직녀성이 밤하늘 지평선 부근(낮은 고도)에 뜹니다. 이때 머리 위에 떴을 때보다 훨씬 지평선이 넓게 찌그러져 보이는 '천공 평평화 착시'가 작동하여, 두 연인 별자리의 시각적 거리감이 가혹할 정도로 아주 멀어져 보입니다.",
        "chilseok": "지구가 계속해서 공전하여 칠월칠석 여름철 밤이 찾아옵니다. 두 별자리는 밤하늘 한가운데 꼭대기(중천)로 높이 치솟아 뜹니다. 지평선 돔 왜곡 착시가 완전히 사라져 두 별은 대폭 가깝게 눈앞에 밀집해 보이고 은하수가 극도로 푸르르고 찬란하게 살아납니다.",
        "bridge": "두 연인의 기막힌 사랑에 탄복한 지상의 까치와 까마귀들이 밤하늘 중천으로 솟구쳐 날개를 포개고 단 하루만 열리는 '오작교 다리'를 개설했습니다! 마침내 견우와 직녀가 은하수 한가운데에서 뜨겁게 만나 사랑의 눈물을 쏟아냅니다.",
        "wish": "감격스러운 만남을 이룬 두 연인이 지상의 관찰자(나)를 바라보며 축복의 은하수 소원 봉투를 보내옵니다. 까마귀가 정성스레 물고 내려온 봉투가 지구 머리맡에 닿았으니, 나의 간절한 소원을 기원하는 글을 작성해 보세요."
    };

    const dialogueData = {
        "spring_autumn": "견우: '아득한 지평선 끝 그대가 너무도 멀구나...' | 직녀: '강물이 가라앉아 이 강폭이 수만 리가 된 것 같습니다...'",
        "chilseok": "견우: '오! 고구려 바지저고리를 여미고 머리 위 중천을 보니 그대가 지척이오!' | 직녀: '맞습니다. 주름치마를 단장하고 올려다본 정수리 위에 당신이 오롯이 빛납니다!'",
        "bridge": "견우: '새들아 고맙다! 직녀여, 그대의 따스한 손을 마침내 잡는구려!' | 직녀: '견우님! 오작교 다리가 놓여 가슴 터질듯한 기쁨의 눈물이 흐릅니다!'"
    };

    function speakKorean(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ko-KR';
            utterance.rate = 0.95;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    }

    function startTimeline() {
        if (currentStep !== "ready") return;
        
        document.getElementById("earthBall").classList.add("spinning");
        document.getElementById("earthLabel").innerText = "지구가 공전 중... 🛸";
        
        timelineTimer = setTimeout(() => {
            transitionToSpringAutumn();
        }, 1200);
    }

    function transitionToSpringAutumn() {
        currentStep = "spring_autumn";
        document.getElementById("universe").style.background = "linear-gradient(180deg, #010103 0%, #0d0414 100%)";
        document.getElementById("milkyWay").style.opacity = "0.12";

        const altair = document.getElementById("altair");
        altair.style.left = "10%";
        altair.style.top = "280px";
        altair.classList.add("visible");

        const vega = document.getElementById("vega");
        vega.style.right = "10%";
        vega.style.top = "280px";
        vega.classList.add("visible");

        document.getElementById("console").innerHTML = '<div style="font-weight: bold; color: #ff9999; margin-bottom: 2px;">🌌 1단계: 봄/가을 (낮은 고도와 평평화 착시)</div><div>' + narrativeData.spring_autumn + '</div><div class="sub-dialogue-badge">' + dialogueData.spring_autumn + '</div>';
        speakKorean(narrativeData.spring_autumn + " " + dialogueData.spring_autumn);

        timelineTimer = setTimeout(() => {
            transitionToChilseok();
        }, 6500);
    }

    function transitionToChilseok() {
        currentStep = "chilseok";
        document.getElementById("universe").style.background = "linear-gradient(180deg, #040112 0%, #15093e 100%)";
        document.getElementById("milkyWay").style.opacity = "0.95";

        const altair = document.getElementById("altair");
        altair.style.left = "31%";
        altair.style.top = "75px";

        const vega = document.getElementById("vega");
        vega.style.right = "31%";
        vega.style.top = "75px";

        document.getElementById("console").innerHTML = '<div style="font-weight: bold; color: #a3e2ff; margin-bottom: 2px;">🌌 2단계: 여름 칠월칠석 (머리 위 중천 고도 이동)</div><div>' + narrativeData.chilseok + '</div><div class="sub-dialogue-badge">' + dialogueData.chilseok + '</div>';
        speakKorean(narrativeData.chilseok + " " + dialogueData.chilseok);

        timelineTimer = setTimeout(() => {
            transitionToBridge();
        }, 6500);
    }

    // 3단계 오작교 다리 건설 및 두 캐릭터 상봉
    function transitionToBridge() {
        currentStep = "bridge";
        document.getElementById("universe").style.background = "linear-gradient(180deg, #070422 0%, #1a0b52 100%)";
        document.getElementById("ojakgyoBridge").classList.add("active");

        const altair = document.getElementById("altair");
        altair.style.left = "41%";
        altair.style.top = "75px";

        const vega = document.getElementById("vega");
        vega.style.right = "41%";
        vega.style.top = "75px";

        document.getElementById("console").innerHTML = '<div style="font-weight: bold; color: #a3ffb1; margin-bottom: 2px;">🌉 3단계: 까마귀와 까치의 오작교 재회</div><div>' + narrativeData.bridge + '</div><div class="sub-dialogue-badge">' + dialogueData.bridge + '</div>';
        speakKorean(narrativeData.bridge + " " + dialogueData.bridge);

        timelineTimer = setTimeout(() => {
            transitionToWish();
        }, 6500);
    }

    function transitionToWish() {
        currentStep = "wish";
        document.getElementById("wishEnvelope").classList.add("delivered");

        document.getElementById("console").innerHTML = '<div style="font-weight: bold; color: #ffd700; margin-bottom: 2px;">✉️ 4단계: 축복의 은하수 소원 편지 배달</div><div>' + narrativeData.wish + '</div>';
        speakKorean(narrativeData.wish);

        setTimeout(() => {
            document.getElementById("wishFormCard").classList.add("slide-in");
            document.getElementById("wishInput").focus();
        }, 1500);
    }

    function submitWish() {
        const wishText = document.getElementById("wishInput").value.trim();
        if (!wishText) {
            const err = document.getElementById("errorText");
            err.innerText = "⚠️ 소원 내용이 비어있습니다. 한 글자라도 정성껏 기원해 적어주세요!";
            err.style.display = "block";
            speakKorean("소원 편지지가 비어있습니다. 소원을 채워 적어주세요.");
            return;
        }

        document.getElementById("errorText").style.display = "none";
        
        let existingWishes = [];
        try {
            const raw = sessionStorage.getItem("gyeonwoo_wishes");
            if (raw) existingWishes = JSON.parse(raw);
        } catch(e) {}

        const now = new Date();
        const timeStr = now.getFullYear() + "-" + 
                        String(now.getMonth() + 1).padStart(2, '0') + "-" + 
                        String(now.getDate()).padStart(2, '0') + " " + 
                        String(now.getHours()).padStart(2, '0') + ":" + 
                        String(now.getMinutes()).padStart(2, '0');

        const newWish = {
            id: existingWishes.length + 1,
            content: wishText,
            time: timeStr
        };
        existingWishes.push(newWish);
        sessionStorage.setItem("gyeonwoo_wishes", JSON.stringify(existingWishes));

        const env = document.getElementById("wishEnvelope");
        env.style.transition = "all 1s cubic-bezier(0.19, 1, 0.22, 1)";
        env.style.bottom = "380px";
        env.style.transform = "translateX(-50%) scale(0.1)";
        env.style.opacity = "0";

        document.getElementById("wishFormCard").classList.remove("slide-in");

        document.getElementById("console").innerHTML = '<div style="font-weight: bold; color: #ffd700; margin-bottom: 2px;">🌟 최종 완료: 은하수 소원 별 등극!</div><div>당신의 소망이 은하수 하늘 높이 전송되어 영원히 꺼지지 않는 소원 별로 환하게 수놓아졌습니다!</div><button class="btn-reset" onclick="resetSimulator()">시뮬레이터 초기화 🔄</button>';
        speakKorean("당신의 소중한 기도가 은하수 하늘 높이 전송되어 찬란히 빛나는 소원 별이 되었습니다.");

        if (window.parent) {
            window.parent.postMessage({
                isStreamlitMessage: true,
                type: "streamlit:setComponentValue",
                value: JSON.stringify(existingWishes)
            }, "*");
        }

        for(let i=0; i<6; i++) {
            const star = document.createElement("div");
            star.innerText = "✨";
            star.style.position = "absolute";
            star.style.left = (Math.random() * 70 + 15) + "%";
            star.style.top = (Math.random() * 150 + 100) + "px";
            star.style.fontSize = "22px";
            star.style.textShadow = "0 0 10px gold";
            star.style.zIndex = "15";
            star.style.animation = "pulseStar 1s infinite alternate ease-in-out";
            document.getElementById("universe").appendChild(star);
        }
    }

    function resetSimulator() {
        if (timelineTimer) clearTimeout(timelineTimer);
        currentStep = "ready";
        
        document.getElementById("universe").style.background = "linear-gradient(180deg, #010105 0%, #06061a 100%)";
        document.getElementById("milkyWay").style.opacity = "0.3";
        
        const altair = document.getElementById("altair");
        altair.style.left = "15%";
        altair.style.top = "160px";
        altair.classList.remove("visible");

        const vega = document.getElementById("vega");
        vega.style.right = "15%";
        vega.style.top = "160px";
        vega.classList.remove("visible");

        document.getElementById("ojakgyoBridge").classList.remove("active");
        
        const env = document.getElementById("wishEnvelope");
        env.className = "wish-envelope";
        env.style = "";
        
        document.getElementById("wishFormCard").classList.remove("slide-in");
        document.getElementById("wishInput").value = "";
        
        document.getElementById("earthBall").classList.remove("spinning");
        document.getElementById("earthLabel").innerText = "지구의 나 (관찰자) 🌍";

        document.getElementById("console").innerHTML = '<div style="font-weight: bold; color: #ffd700; margin-bottom: 2px;">🌌 관측 대기 콘솔</div><span>가운데 지구(🌍) 캐릭터를 클릭하여 지구의 공전을 가동하고 천문 설화 애니메이션을 자동 재생시키세요.</span>';
        speakKorean("지구에서 다시 한 번 하늘을 관측해 보세요.");
    }
</script>

</body>
</html>
\"\"\"

# components.html로 임베디드 렌더링
components_output = components.html(timeline_html_code, height=450)

if components_output:
    try:
        loaded_wishes = json.loads(components_output)
        if isinstance(loaded_wishes, list) and len(loaded_wishes) > len(st.session_state.wishes):
            st.session_state.wishes = loaded_wishes
            st.rerun()
    except Exception:
        pass

# 6. 소원 별 보관함
st.markdown("---")
st.header("🗃️ 나의 은하수 소원 별 보관함")
st.write("사용자가 은하수로 보낸 기도의 기록들이 영속 저장됩니다. 소원 별 단추를 클릭해 과거 소망을 따스한 한국어 보이스로 되새겨 보세요.")

if not st.session_state.wishes:
    st.markdown("<p style='color:#7a7a8a; font-style:italic;'>현재 등록된 은하수 소원 별이 비어있습니다. 지구를 클릭해 자동 타임라인을 끝까지 감상하고 나만의 소원 별을 수놓아 보세요!</p>", unsafe_allow_html=True)
else:
    star_cols = st.columns(4)
    for idx, wish in enumerate(st.session_state.wishes):
        col_idx = idx % 4
        with star_cols[col_idx]:
            button_title = f"✨ 소원 별 {wish['id']}번"
            if st.button(button_title, key=f"py_timeline_star_{wish['id']}"):
                st.session_state.selected_wish = wish
                
    if st.session_state.selected_wish:
        sel = st.session_state.selected_wish
        st.info(f\"\"\"
        ### 🌟 소원 별 {sel['id']}번 상세 열람
        * **소원 기원 일시:** \`{sel['time']}\`
        * **기원된 소망 내용:**  
        **「 {sel['content']} 」**
        \"\"\")
        
        remind_speech = f"소원 별 {sel['id']}번 소망 내용입니다. {sel['content']}"
        speak_korean(remind_speech)
        
        if st.button("닫기 ✖️"):
            st.session_state.selected_wish = None
            st.rerun()

st.markdown("---")
st.markdown("<p style='text-align: center; color: #5a5a6a; font-size: 11px;'>Gyeonwoo & Jignyeo Apparent Sky Illusion MVP - Developed by Senior Fullstack Architect</p>", unsafe_allow_html=True)
`;
