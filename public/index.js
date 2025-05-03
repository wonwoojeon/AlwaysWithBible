var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;

// Firebase 초기화 변수
let db, auth;

// Firebase 초기화 함수
function initializeFirebase() {
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK가 로드되지 않았습니다. 재시도 중...');
    return false;
  }
  const firebaseConfig = {
    apiKey: "AIzaSyCZToyuFYN9i-Y25KIVbUJ1vYIGje44f6o",
    authDomain: "j2wbibleinfinitescroll.firebaseapp.com",
    projectId: "j2wbibleinfinitescroll",
    storageBucket: "j2wbibleinfinitescroll.firebasestorage.app",
    messagingSenderId: "1083438447830",
    appId: "1:1083438447830:web:2d9b2d2fecf2e3f440dd77"
  };
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    console.log('Firebase initialized successfully in index.js');
    return true;
  } catch (e) {
    console.error('Firebase initialization failed:', e.message);
    return false;
  }
}

// Firebase 초기화 시도 (재시도 로직 포함)
let firebaseInitAttempts = 0;
const maxFirebaseInitAttempts = 5;
function tryInitializeFirebase() {
  if (firebaseInitAttempts >= maxFirebaseInitAttempts) {
    console.error('Firebase 초기화 최대 시도 횟수를 초과했습니다. 네트워크를 확인하거나 새로고침을 시도해주세요.');
    return;
  }
  if (initializeFirebase()) {
    return;
  }
  firebaseInitAttempts++;
  setTimeout(tryInitializeFirebase, 1000); // 1초 후 재시도
}
tryInitializeFirebase();
var App = function () {
  // 기존 상태
  var versesState = useState([]);
  var verses = versesState[0];
  var setVerses = versesState[1];
  var inputState = useState('');
  var input = inputState[0];
  var setInput = inputState[1];
  var searchResultsState = useState([]);
  var searchResults = searchResultsState[0];
  var setSearchResults = searchResultsState[1];
  var errorState = useState('');
  var error = errorState[0];
  var setError = errorState[1];
  var loadingState = useState(false);
  var loading = loadingState[0];
  var setLoading = loadingState[1];
  var scrollSpeedState = useState(0.5);
  var scrollSpeed = scrollSpeedState[0];
  var setScrollSpeed = scrollSpeedState[1];
  var speechRateState = useState(1);
  var speechRate = speechRateState[0];
  var setSpeechRate = speechRateState[1];
  var fontSizeState = useState(1);
  var fontSize = fontSizeState[0];
  var setFontSize = fontSizeState[1];
  var lineHeightState = useState(fontSize * 1.2);
  var lineHeight = lineHeightState[0];
  var setLineHeight = lineHeightState[1];
  var containerWidthState = useState(672);
  var containerWidth = containerWidthState[0];
  var setContainerWidth = containerWidthState[1];
  var isCollapsedState = useState(false);
  var isCollapsed = isCollapsedState[0];
  var setIsCollapsed = isCollapsedState[1];
  var scrollRef = useRef(null);
  var scrollPosState = useState(0);
  var scrollPos = scrollPosState[0];
  var setScrollPos = scrollPosState[1];
  var koreanDataState = useState(null);
  var koreanData = koreanDataState[0];
  var setKoreanData = koreanDataState[1];

  // BGM 관련 상태
  var bgmListState = useState([]);
  var bgmList = bgmListState[0];
  var setBgmList = bgmListState[1];
  var currentBgmState = useState(null);
  var currentBgm = currentBgmState[0];
  var setCurrentBgm = currentBgmState[1];

  // BGM과 음성 소리 분리
  var isBgmOnState = useState(false);
  var isBgmOn = isBgmOnState[0];
  var setIsBgmOn = isBgmOnState[1];
  var isVoiceOnState = useState(true);
  var isVoiceOn = isVoiceOnState[0];
  var setIsVoiceOn = isVoiceOnState[1];

  // 음성 및 BGM 볼륨 상태
  var speechVolumeState = useState(1.0);
  var speechVolume = speechVolumeState[0];
  var setSpeechVolume = speechVolumeState[1];
  var bgmVolumeState = useState(1.0);
  var bgmVolume = bgmVolumeState[0];
  var setBgmVolume = bgmVolumeState[1];

  // 로그인 및 회원가입 상태
  var userState = useState(null);
  var user = userState[0];
  var setUser = userState[1];
  var usernameState = useState('');
  var username = usernameState[0];
  var setUsername = usernameState[1];
  var passwordState = useState('');
  var password = passwordState[0];
  var setPassword = passwordState[1];
  var signupUsernameState = useState('');
  var signupUsername = signupUsernameState[0];
  var setSignupUsername = signupUsernameState[1];
  var signupPasswordState = useState('');
  var signupPassword = signupPasswordState[0];
  var setSignupPassword = signupPasswordState[1];
  // 팝업 상태
  var showAuthPopupState = useState(false);
  var showAuthPopup = showAuthPopupState[0];
  var setShowAuthPopup = showAuthPopupState[1];
  var authTabState = useState('login'); // 'login' 또는 'signup'
  var authTab = authTabState[0];
  var setAuthTab = authTabState[1];

  // Firebase 초기화 확인
  useEffect(function () {
    if (!db || !auth) {
      setError('Firebase 초기화에 실패했습니다. 새로고침 후 다시 시도해주세요.');
      return;
    }
  }, []);

  // 사용자 인증 상태 감지
  useEffect(function () {
    if (!auth) return;
    var unsubscribe = auth.onAuthStateChanged(function (firebaseUser) {
      setUser(firebaseUser);
    });
    return function () {
      unsubscribe();
    };
  }, []);

  // 글자 크기 변경 시 줄간격 초기값 동기화
  useEffect(function () {
    setLineHeight(fontSize * 1.2);
  }, [fontSize]);

  // BGM 파일 목록 로드
  useEffect(function () {
    fetch('/assets/index.json').then(function (response) {
      if (!response.ok) {
        throw new Error('Failed to load BGM list: ' + response.status + ' ' + response.statusText);
      }
      return response.json();
    }).then(function (data) {
      var bgmFiles = data.bgmFiles.map(function (file) {
        return `/assets/${file}`;
      });
      setBgmList(bgmFiles);
      if (bgmFiles.length > 0) {
        var randomIndex = Math.floor(Math.random() * bgmFiles.length);
        setCurrentBgm(bgmFiles[randomIndex]);
      }
    }).catch(function (err) {
      console.error('Error loading BGM list:', err.message);
      setError('BGM 목록을 불러오지 못했습니다: ' + err.message);
    });
  }, []);

  // BGM 재생 로직 (볼륨 반영 추가)
  useEffect(function () {
    var bgmElement = document.getElementById('bgm');
    if (!bgmElement || !currentBgm) return;
    bgmElement.src = currentBgm;
    bgmElement.volume = bgmVolume; // BGM 볼륨 적용
    if (isBgmOn) {
      bgmElement.play().catch(function (e) {
        console.error('BGM 재생 실패:', e);
        setError('BGM 재생에 실패했습니다: 브라우저 정책에 의해 차단되었거나 파일을 로드할 수 없습니다. (' + e.message + ')');
      });
    } else {
      bgmElement.pause();
    }
  }, [isBgmOn, currentBgm, bgmList, bgmVolume]);

  // 한글 성경 데이터 로드
  useEffect(function () {
    console.log('Fetching ko_rev.json...');
    fetch('/assets/ko_rev.json').then(function (response) {
      if (!response.ok) {
        throw new Error('Failed to load ko_rev.json: ' + response.status + ' ' + response.statusText);
      }
      return response.json();
    }).then(function (data) {
      setKoreanData(data);
      console.log('ko_rev.json loaded:', data);
    }).catch(function (err) {
      console.error('Error loading ko_rev.json:', err.message);
      setError('한글 성경 데이터를 불러오지 못했습니다: ' + err.message + '. 서버에 /assets/ko_rev.json 파일이 있는지 확인해주세요.');
    });
  }, []);

  // 로그인 상태에 따라 구절 로드 (실시간 업데이트)
  useEffect(function () {
    if (!db || !user) {
      setVerses([]); // user가 없으면 초기화
      return;
    }
    var userId = user.uid;
    console.log('Subscribing to verses for user:', userId);
    var versesRef = db.collection('users').doc(userId).collection('verses').doc('data');
    var unsubscribe = versesRef.onSnapshot(function (doc) {
      if (doc.exists) {
        var savedVerses = doc.data().verses || [];
        setVerses(savedVerses);
        console.log('Verses loaded from Firestore:', savedVerses);
      } else {
        console.log('No verses found for user, initializing empty array');
        setVerses([]);
        versesRef.set({
          verses: []
        }); // 문서가 없으면 초기화
      }
    }, function (e) {
      console.error('Failed to load verses from Firestore:', e);
      setError('저장된 구절을 불러오지 못했습니다: ' + e.message);
    });
    return function () {
      unsubscribe();
    };
  }, [user]);

  // 사용자 설정 로드 (로그인 시 Firestore에서 설정 가져오기)
  useEffect(function () {
    if (!db || !user) return;
    var userId = user.uid;
    console.log('Loading settings for user:', userId);
    var settingsRef = db.collection('users').doc(userId).collection('settings').doc('data');
    var unsubscribe = settingsRef.onSnapshot(function (doc) {
      if (doc.exists) {
        var settings = doc.data();
        setScrollSpeed(settings.scrollSpeed || 0.5);
        setFontSize(settings.fontSize || 1);
        setLineHeight(settings.lineHeight || 1.2);
        setContainerWidth(settings.containerWidth || 672);
        setSpeechVolume(settings.speechVolume || 1.0);
        setBgmVolume(settings.bgmVolume || 1.0);
        console.log('Settings loaded from Firestore:', settings);
      } else {
        console.log('No settings found for user, initializing with defaults');
        settingsRef.set({
          scrollSpeed: 0.5,
          fontSize: 1,
          lineHeight: 1.2,
          containerWidth: 672,
          speechVolume: 1.0,
          bgmVolume: 1.0
        });
      }
    }, function (e) {
      console.error('Failed to load settings from Firestore:', e);
      setError('설정을 불러오지 못했습니다: ' + e.message);
    });
    return function () {
      unsubscribe();
    };
  }, [user]);

  // 구절 저장 (로그인 상태일 때만)
  useEffect(function () {
    if (!db || !user) return;
    var userId = user.uid;
    console.log('Saving verses for user:', userId, verses);
    var versesRef = db.collection('users').doc(userId).collection('verses').doc('data');
    versesRef.set({
      verses: verses
    }, {
      merge: true
    }).catch(function (e) {
      console.error('Failed to save verses to Firestore:', e);
      setError('구절을 저장하지 못했습니다: ' + e.message);
    });
  }, [verses, user]);

  // 사용자 설정 저장 (Firestore에 설정 저장)
  useEffect(function () {
    if (!db || !user) return;
    var userId = user.uid;
    console.log('Saving settings for user:', userId);
    var settingsRef = db.collection('users').doc(userId).collection('settings').doc('data');
    settingsRef.set({
      scrollSpeed: scrollSpeed,
      fontSize: fontSize,
      lineHeight: lineHeight,
      containerWidth: containerWidth,
      speechVolume: speechVolume,
      bgmVolume: bgmVolume
    }, {
      merge: true
    }).catch(function (e) {
      console.error('Failed to save settings to Firestore:', e);
      setError('설정을 저장하지 못했습니다: ' + e.message);
    });
  }, [scrollSpeed, fontSize, lineHeight, containerWidth, speechVolume, bgmVolume, user]);

  // 자동 스크롤 로직
  useEffect(function () {
    console.log('Starting auto-scroll with speed:', scrollSpeed);
    var scroll = function () {
      setScrollPos(function (prev) {
        if (!scrollRef.current || verses.length === 0) return prev;
        var maxHeight = scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
        if (maxHeight <= 0) return prev;
        var newPos = prev + scrollSpeed;
        if (newPos >= maxHeight) {
          newPos = newPos % maxHeight;
        }
        return newPos;
      });
    };
    var interval = setInterval(scroll, 16);
    return function () {
      clearInterval(interval);
    };
  }, [scrollSpeed, verses]);
  useEffect(function () {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollPos;
      console.log('Scroll position updated:', scrollPos);
    }
  }, [scrollPos]);
  useEffect(function () {
    var newSpeechRate = 0.5 + (scrollSpeed - 0.1) * (1.5 / 1.9);
    setSpeechRate(Math.min(Math.max(newSpeechRate, 0.5), 2));
    console.log('Speech rate updated:', newSpeechRate);
  }, [scrollSpeed]);
  var animationDuration = verses.length > 0 ? 10 + verses.length * 2 : 10;
  var toggleBgm = function () {
    setIsBgmOn(!isBgmOn);
  };
  var toggleVoice = function () {
    if (isVoiceOn) {
      window.speechSynthesis.cancel();
    }
    setIsVoiceOn(!isVoiceOn);
  };
  var deleteVerse = function (index) {
    console.log('Deleting verse at index:', index);
    var updatedVerses = verses.filter(function (_, i) {
      return i !== index;
    });
    setVerses(updatedVerses);
  };
  var signup = function () {
    if (!auth) {
      setError('Firebase 인증 서비스가 초기화되지 않았습니다.');
      return;
    }
    if (!signupUsername || !signupPassword) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    if (signupPassword.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }
    auth.createUserWithEmailAndPassword(signupUsername, signupPassword).then(function (userCredential) {
      setError('회원가입이 완료되었습니다. 로그인해주세요.');
      setSignupUsername('');
      setSignupPassword('');
      setShowAuthPopup(false);
    }).catch(function (error) {
      console.error('Signup error:', error);
      setError('회원가입 실패: ' + error.message);
    });
  };
  var login = function () {
    if (!auth) {
      setError('Firebase 인증 서비스가 초기화되지 않았습니다.');
      return;
    }
    if (!username || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    auth.signInWithEmailAndPassword(username, password).then(function (userCredential) {
      setError('');
      setUsername('');
      setPassword('');
      setShowAuthPopup(false);
    }).catch(function (error) {
      console.error('Login error:', error);
      setError('로그인 실패: ' + error.message);
    });
  };
  var logout = function () {
    if (!auth) {
      setError('Firebase 인증 서비스가 초기화되지 않았습니다.');
      return;
    }
    auth.signOut().then(function () {
      setUser(null);
      setError('');
    }).catch(function (error) {
      console.error('Logout error:', error);
      setError('로그아웃 실패: ' + error.message);
    });
  };
  var searchVerses = async function () {
    setLoading(true);
    setError('');
    console.log('Starting search with input:', input);
    try {
      var queries = input.split(',').map(function (q) {
        return q.trim();
      });
      var results = [];
      var bookMap = {
        '창세기': 'Genesis',
        '출애굽기': 'Exodus',
        '레위기': 'Leviticus',
        '민수기': 'Numbers',
        '신명기': 'Deuteronomy',
        '여호수아': 'Joshua',
        '사사기': 'Judges',
        '룻기': 'Ruth',
        '사무엘상': '1 Samuel',
        '사무엘하': '2 Samuel',
        '열왕기상': '1 Kings',
        '열왕기하': '2 Kings',
        '역대상': '1 Chronicles',
        '역대하': '2 Chronicles',
        '에스라': 'Ezra',
        '느헤미야': 'Nehemiah',
        '에스더': 'Esther',
        '욥기': 'Job',
        '시편': 'Psalms',
        '잠언': 'Proverbs',
        '전도서': 'Ecclesiastes',
        '아가': 'Song of Solomon',
        '이사야': 'Isaiah',
        '예레미야': 'Jeremiah',
        '예레미야애가': 'Lamentations',
        '에스겔': 'Ezekiel',
        '다니엘': 'Daniel',
        '호세아': 'Hosea',
        '요엘': 'Joel',
        '아모스': 'Amos',
        '오바댜': 'Obadiah',
        '요나': 'Jonah',
        '미가': 'Micah',
        '나훔': 'Nahum',
        '하박국': 'Habakkuk',
        '스바냐': 'Zephaniah',
        '학개': 'Haggai',
        '스가랴': 'Zechariah',
        '말라기': 'Malachi',
        '마태복음': 'Matthew',
        '마가복음': 'Mark',
        '누가복음': 'Luke',
        '요한복음': 'John',
        '사도행전': 'Acts',
        '로마서': 'Romans',
        '고린도전서': '1 Corinthians',
        '고린도후서': '2 Corinthians',
        '갈라디아서': 'Galatians',
        '에베소서': 'Ephesians',
        '빌립보서': 'Philippians',
        '골로새서': 'Colossians',
        '데살로니가전서': '1 Thessalonians',
        '데살로니가후서': '2 Thessalonians',
        '디모데전서': '1 Timothy',
        '디모데후서': '2 Timothy',
        '디도서': 'Titus',
        '빌레몬서': 'Philemon',
        '히브리서': 'Hebrews',
        '야고보서': 'James',
        '베드로전서': '1 Peter',
        '베드로후서': '2 Peter',
        '요한1서': '1 John',
        '요한2서': '2 John',
        '요한3서': '3 John',
        '유다서': 'Jude',
        '요한계시록': 'Revelation'
      };
      var bookMapReverse = {};
      for (var key in bookMap) {
        bookMapReverse[bookMap[key]] = key;
      }
      for (var i = 0; i < queries.length; i++) {
        var query = queries[i];
        console.log('Processing query:', query);
        var bookMatchResult = query.match(/^(\D+)/);
        var bookMatch = bookMatchResult && bookMatchResult[1] ? bookMatchResult[1].trim() : null;
        var book = bookMap[bookMatch] || bookMatch;
        var verseMatchResult = query.match(/(\d+(?::\d+(?:~\d+)?)?)/);
        var verseMatch = verseMatchResult && verseMatchResult[0] ? verseMatchResult[0].replace('~', '-') : null;
        if (!book || !verseMatch) {
          throw new Error('잘못된 구절 형식입니다. 예: 창세기 1:1~5 또는 창세기 1');
        }
        var chapterVerse = verseMatch.split(':');
        var chapter = chapterVerse[0];
        var startVerse, endVerse;
        if (chapterVerse.length > 1) {
          var verseRange = chapterVerse[1].split('-');
          startVerse = parseInt(verseRange[0]);
          endVerse = verseRange[1] ? parseInt(verseRange[1]) : startVerse;
        } else {
          startVerse = 1;
          endVerse = Infinity;
        }
        var formattedQuery = book + '+' + chapter;
        console.log('Formatted query for API:', formattedQuery);
        var kjvText = '영어 구절을 불러오지 못했습니다.';
        try {
          console.log('Fetching KJV data for:', formattedQuery);
          var url = 'https://bible-api.com/' + encodeURIComponent(formattedQuery) + '?translation=kjv';
          console.log('KJV API URL:', url);
          var kjvResponse = await fetch(url);
          if (!kjvResponse.ok) {
            throw new Error(`KJV API 요청 실패: ${kjvResponse.status} ${kjvResponse.statusText}`);
          }
          var kjvData = await kjvResponse.json();
          console.log('KJV API response:', kjvData);
          if (kjvData.error) throw new Error(kjvData.error);
          if (!kjvData.verses || kjvData.verses.length === 0) {
            throw new Error('해당 구절을 찾을 수 없습니다.');
          }
          var verses = kjvData.verses.filter(function (verseData) {
            return endVerse === Infinity || verseData.verse >= startVerse && verseData.verse <= endVerse;
          }).map(function (verseData) {
            return verseData.verse + ': ' + verseData.text.trim();
          });
          if (verses.length === 0) {
            throw new Error('해당 절 범위를 찾을 수 없습니다.');
          }
          kjvText = verses.join(' ');
          console.log('KJV data fetched:', kjvText);
        } catch (kjvError) {
          console.warn('영어 구절 데이터를 가져오지 못했습니다:', kjvError.message);
          kjvText = '영어 구절을 불러오지 못했습니다: ' + kjvError.message;
        }
        var krvText = '한글 구절을 불러오지 못했습니다.';
        try {
          if (!koreanData) throw new Error('한글 성경 데이터가 로드되지 않았습니다.');
          var bookName = bookMapReverse[book] || book;
          console.log('Looking for book:', bookName);
          var bookData = koreanData.find(function (b) {
            return b.name === bookName;
          });
          if (bookData) {
            console.log('Book found:', bookData.name);
            var chapterData = bookData.chapters[parseInt(chapter) - 1];
            if (chapterData) {
              console.log('Chapter found:', chapter);
              var verses = [];
              for (var v = startVerse; v <= (endVerse === Infinity ? chapterData.length : endVerse); v++) {
                var verseText = chapterData[v - 1];
                if (verseText) {
                  verses.push(v + ': ' + verseText);
                }
              }
              if (verses.length > 0) {
                krvText = verses.join(' ');
                console.log('Korean data fetched:', krvText);
              } else {
                throw new Error('해당 구절을 찾을 수 없습니다.');
              }
            } else {
              throw new Error('해당 장을 찾을 수 없습니다.');
            }
          } else {
            throw new Error('해당 책을 찾을 수 없습니다: ' + bookName);
          }
        } catch (krvError) {
          console.warn('한글 구절 데이터를 가져오지 못했습니다:', krvError.message);
          krvText = '한글 구절을 불러오지 못했습니다: ' + krvError.message;
        }
        results.push({
          query: query,
          kjvText: kjvText,
          krvText: krvText
        });
      }
      setSearchResults(results);
      console.log('Search results:', results);
    } catch (error) {
      console.error('Error fetching verses:', error.message);
      setError('구절을 불러오지 못했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  var addVerses = function (verse, index) {
    console.log('Adding verse to scroll list:', verse);
    setVerses(verses.concat([verse]));
    var updatedResults = searchResults.filter(function (_, i) {
      return i !== index;
    });
    setSearchResults(updatedResults);
    if (isVoiceOn) {
      var utterance = new SpeechSynthesisUtterance(verse.kjvText);
      utterance.lang = 'en-US';
      utterance.rate = speechRate;
      utterance.volume = speechVolume;
      window.speechSynthesis.speak(utterance);
      var krUtterance = new SpeechSynthesisUtterance(verse.krvText);
      krUtterance.lang = 'ko-KR';
      krUtterance.rate = speechRate;
      krUtterance.volume = speechVolume;
      window.speechSynthesis.speak(krUtterance);
    }
  };
  var formatVerseHeader = function (query) {
    var bookMatchResult = query.match(/^(\D+)/);
    var bookMatch = bookMatchResult && bookMatchResult[1] ? bookMatchResult[1].trim() : null;
    var verseMatchResult = query.match(/(\d+(?::\d+(?:~\d+)?)?)/);
    var verseMatch = verseMatchResult && verseMatchResult[0] ? verseMatchResult[0].replace('~', '-') : null;
    var chapterVerse = verseMatch.split(':');
    var chapter = chapterVerse[0];
    var startVerse, endVerse;
    if (chapterVerse.length > 1) {
      var verseRange = chapterVerse[1].split('-');
      startVerse = parseInt(verseRange[0]);
      endVerse = verseRange[1] ? parseInt(verseRange[1]) : startVerse;
    } else {
      startVerse = null;
      endVerse = null;
    }
    var bookMap = {
      '창세기': 'Genesis',
      '출애굽기': 'Exodus',
      '레위기': 'Leviticus',
      '민수기': 'Numbers',
      '신명기': 'Deuteronomy',
      '여호수아': 'Joshua',
      '사사기': 'Judges',
      '룻기': 'Ruth',
      '사무엘상': '1 Samuel',
      '사무엘하': '2 Samuel',
      '열왕기상': '1 Kings',
      '열왕기하': '2 Kings',
      '역대상': '1 Chronicles',
      '역대하': '2 Chronicles',
      '에스라': 'Ezra',
      '느헤미야': 'Nehemiah',
      '에스더': 'Esther',
      '욥기': 'Job',
      '시편': 'Psalms',
      '잠언': 'Proverbs',
      '전도서': 'Ecclesiastes',
      '아가': 'Song of Solomon',
      '이사야': 'Isaiah',
      '예레미야': 'Jeremiah',
      '예레미야애가': 'Lamentations',
      '에스겔': 'Ezekiel',
      '다니엘': 'Daniel',
      '호세아': 'Hosea',
      '요엘': 'Joel',
      '아모스': 'Amos',
      '오바댜': 'Obadiah',
      '요나': 'Jonah',
      '미가': 'Micah',
      '나훔': 'Nahum',
      '하박국': 'Habakkuk',
      '스바냐': 'Zephaniah',
      '학개': 'Haggai',
      '스가랴': 'Zechariah',
      '말라기': 'Malachi',
      '마태복음': 'Matthew',
      '마가복음': 'Mark',
      '누가복음': 'Luke',
      '요한복음': 'John',
      '사도행전': 'Acts',
      '로마서': 'Romans',
      '고린도전서': '1 Corinthians',
      '고린도후서': '2 Corinthians',
      '갈라디아서': 'Galatians',
      '에베소서': 'Ephesians',
      '빌립보서': 'Philippians',
      '골로새서': 'Colossians',
      '데살로니가전서': '1 Thessalonians',
      '데살로니가후서': '2 Thessalonians',
      '디모데전서': '1 Timothy',
      '디모데후서': '2 Timothy',
      '디도서': 'Titus',
      '빌레몬서': 'Philemon',
      '히브리서': 'Hebrews',
      '야고보서': 'James',
      '베드로전서': '1 Peter',
      '베드로후서': '2 Peter',
      '요한1서': '1 John',
      '요한2서': '2 John',
      '요한3서': '3 John',
      '유다서': 'Jude',
      '요한계시록': 'Revelation'
    };
    var bookMapReverse = {};
    for (var key in bookMap) {
      bookMapReverse[bookMap[key]] = key;
    }
    var bookEng = bookMap[bookMatch] || bookMatch;
    var bookKor = bookMapReverse[bookEng] || bookMatch;
    var korHeader = startVerse && endVerse ? `${bookKor} ${chapter}장 ${startVerse}절~${endVerse}절` : `${bookKor} ${chapter}장`;
    var engHeader = startVerse && endVerse ? `${bookEng} ${chapter}:${startVerse}-${endVerse}` : `${bookEng} ${chapter}`;
    return {
      korHeader,
      engHeader
    };
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      maxWidth: containerWidth + 'px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "title-bar"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "title"
  }, "j2w_2027 Bible Infinite Scroll"), /*#__PURE__*/React.createElement("div", {
    className: "button-group"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      setShowAuthPopup(true);
    },
    className: "user-icon"
  }, "\uD83D\uDE0A"), /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      setIsCollapsed(!isCollapsed);
    },
    className: "toggle-button"
  }, isCollapsed ? '▼' : '▲'))), showAuthPopup && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "auth-popup-overlay",
    onClick: function () {
      setShowAuthPopup(false);
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "auth-popup"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      setShowAuthPopup(false);
    },
    className: "auth-popup-close"
  }, "\xD7"), user ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "\uD658\uC601\uD569\uB2C8\uB2E4, ", user.email, "\uB2D8!"), /*#__PURE__*/React.createElement("button", {
    onClick: logout,
    className: "button"
  }, "\uB85C\uADF8\uC544\uC6C3")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "auth-tabs"
  }, /*#__PURE__*/React.createElement("button", {
    className: `auth-tab ${authTab === 'login' ? 'active' : ''}`,
    onClick: function () {
      setAuthTab('login');
      setError('');
    }
  }, "\uB85C\uADF8\uC778"), /*#__PURE__*/React.createElement("button", {
    className: `auth-tab ${authTab === 'signup' ? 'active' : ''}`,
    onClick: function () {
      setAuthTab('signup');
      setError('');
    }
  }, "\uD68C\uC6D0\uAC00\uC785")), authTab === 'login' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: "login-email"
  }, "이메일"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    id: "login-email",
    name: "login-email",
    value: username,
    onChange: function (e) {
      setUsername(e.target.value);
    },
    placeholder: "\uC774\uBA54\uC77C (\uC608: user@example.com)",
    className: "input"
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "login-password"
  }, "비밀번호"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    id: "login-password",
    name: "login-password",
    value: password,
    onChange: function (e) {
      setPassword(e.target.value);
    },
    placeholder: "\uBE44\uBC00\uBC88\uD638",
    className: "input"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: login,
    className: "button"
  }, "\uB85C\uADF8\uC778")), authTab === 'signup' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: "signup-email"
  }, "이메일"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    id: "signup-email",
    name: "signup-email",
    value: signupUsername,
    onChange: function (e) {
      setSignupUsername(e.target.value);
    },
    placeholder: "\uC774\uBA54\uC77C (\uC608: user@example.com)",
    className: "input"
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "signup-password"
  }, "비밀번호"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    id: "signup-password",
    name: "signup-password",
    value: signupPassword,
    onChange: function (e) {
      setSignupPassword(e.target.value);
    },
    placeholder: "\uBE44\uBC00\uBC88\uD638 (8\uC790 \uC774\uC0C1)",
    className: "input"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: signup,
    className: "button"
  }, "\uD68C\uC6D0\uAC00\uC785"))))), !isCollapsed && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mb-4"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "verse-input"
  }, "구절 검색"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    id: "verse-input",
    name: "verse-input",
    value: input,
    onChange: function (e) {
      setInput(e.target.value);
    },
    placeholder: "\uC608: \uCC3D\uC138\uAE30 1:1~5, \uC2DC\uD3B8 23",
    className: "input"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: searchVerses,
    className: "button"
  }, "\uAC80\uC0C9"), verses.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "selected-verses"
  }, /*#__PURE__*/React.createElement("div", {
    className: "selected-verses-container",
    style: {
      animationDuration: animationDuration + 's'
    }
  }, verses.concat(verses).map(function (verse, idx) {
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      className: "selected-verse-item"
    }, /*#__PURE__*/React.createElement("span", null, verse.query), /*#__PURE__*/React.createElement("button", {
      onClick: function (e) {
        e.stopPropagation();
        deleteVerse(idx % verses.length);
      },
      className: "delete-button"
    }, "X"));
  })))), /*#__PURE__*/React.createElement("div", {
    className: "slider-container"
  }, /*#__PURE__*/React.createElement("label", {
    className: "slider-label",
    htmlFor: "scroll-speed"
  }, "\uC2A4\uD06C\uB864 \uC18D\uB3C4: ", scrollSpeed.toFixed(1)), /*#__PURE__*/React.createElement("input", {
    type: "range",
    id: "scroll-speed",
    name: "scroll-speed",
    min: "0.1",
    max: "2",
    step: "0.1",
    value: scrollSpeed,
    onChange: function (e) {
      setScrollSpeed(parseFloat(e.target.value));
    },
    className: "slider"
  }), /*#__PURE__*/React.createElement("p", null, "\uC74C\uC131 \uC7AC\uC0DD \uC18D\uB3C4: ", speechRate.toFixed(1))), /*#__PURE__*/React.createElement("div", {
    className: "slider-container"
  }, /*#__PURE__*/React.createElement("label", {
    className: "slider-label",
    htmlFor: "font-size"
  }, "\uAE00\uC790 \uD06C\uAE30: ", fontSize.toFixed(1), "rem"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    id: "font-size",
    name: "font-size",
    min: "0.8",
    max: "4",
    step: "0.1",
    value: fontSize,
    onChange: function (e) {
      setFontSize(parseFloat(e.target.value));
    },
    className: "slider"
  })), /*#__PURE__*/React.createElement("div", {
    className: "slider-container"
  }, /*#__PURE__*/React.createElement("label", {
    className: "slider-label",
    htmlFor: "line-height"
  }, "\uC904\uAC04\uACA9: ", lineHeight.toFixed(1), "rem"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    id: "line-height",
    name: "line-height",
    min: "1.2",
    max: "4.0",
    step: "0.1",
    value: lineHeight,
    onChange: function (e) {
      setLineHeight(parseFloat(e.target.value));
    },
    className: "slider"
  })), /*#__PURE__*/React.createElement("div", {
    className: "slider-container"
  }, /*#__PURE__*/React.createElement("label", {
    className: "slider-label",
    htmlFor: "container-width"
  }, "\uBCF8\uBB38 \uB108\uBE44: ", containerWidth, "px"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    id: "container-width",
    name: "container-width",
    min: "400",
    max: "1300",
    step: "10",
    value: containerWidth,
    onChange: function (e) {
      setContainerWidth(parseInt(e.target.value));
    },
    className: "slider"
  })), /*#__PURE__*/React.createElement("div", {
    className: "slider-container"
  }, /*#__PURE__*/React.createElement("label", {
    className: "slider-label",
    htmlFor: "speech-volume"
  }, "\uC74C\uC131 \uBCFC\uB968: ", speechVolume.toFixed(1)), /*#__PURE__*/React.createElement("input", {
    type: "range",
    id: "speech-volume",
    name: "speech-volume",
    min: "0",
    max: "1",
    step: "0.1",
    value: speechVolume,
    onChange: function (e) {
      setSpeechVolume(parseFloat(e.target.value));
    },
    className: "slider"
  })), /*#__PURE__*/React.createElement("div", {
    className: "slider-container"
  }, /*#__PURE__*/React.createElement("label", {
    className: "slider-label",
    htmlFor: "bgm-volume"
  }, "\uBBA4\uC9C1 \uBCFC\uB968: ", bgmVolume.toFixed(1)), /*#__PURE__*/React.createElement("input", {
    type: "range",
    id: "bgm-volume",
    name: "bgm-volume",
    min: "0",
    max: "1",
    step: "0.1",
    value: bgmVolume,
    onChange: function (e) {
      setBgmVolume(parseFloat(e.target.value));
    },
    className: "slider"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: toggleBgm,
    className: "sound-button"
  }, isBgmOn ? '🎵 BGM 끄기' : '🎶 BGM 켜기'), /*#__PURE__*/React.createElement("button", {
    onClick: toggleVoice,
    className: "sound-button"
  }, isVoiceOn ? '🗣️ 음성 끄기' : '🔈 음성 켜기')), loading && /*#__PURE__*/React.createElement("p", {
    className: "loading"
  }, "\uAC80\uC0C9 \uC911..."), error && /*#__PURE__*/React.createElement("div", {
    className: "error"
  }, error), searchResults.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "mb-4"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "subtitle"
  }, "\uAC80\uC0C9 \uACB0\uACFC"), searchResults.map(function (result, idx) {
    return /*#__PURE__*/React.createElement("div", {
      key: result.query,
      className: "verse"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      id: `verse-checkbox-${idx}`,
      name: `verse-checkbox-${idx}`,
      onChange: function () {
        addVerses(result, idx);
      }
    }), /*#__PURE__*/React.createElement("label", {
      htmlFor: `verse-checkbox-${idx}`,
      className: "ml-2"
    }, result.query, ": ", result.kjvText, " (KJV)"), /*#__PURE__*/React.createElement("p", {
      className: "ml-6"
    }, result.krvText, " (\uAC1C\uC5ED\uAC1C\uC815)"));
  })), /*#__PURE__*/React.createElement("div", {
    ref: scrollRef,
    className: "scroll-area",
    style: {
      height: isCollapsed ? 'calc(100vh - 60px)' : '70vh'
    }
  }, verses.length > 0 ? /*#__PURE__*/React.createElement("div", {
    className: "scroll-content"
  }, [...Array(100)].map(function (_, idx) {
    var verse = verses[idx % verses.length];
    var headers = formatVerseHeader(verse.query);
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      className: "verse"
    }, /*#__PURE__*/React.createElement("div", {
      className: "verse-header"
    }, headers.korHeader), /*#__PURE__*/React.createElement("div", {
      className: "verse-header"
    }, headers.engHeader), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: fontSize + 'rem',
        lineHeight: lineHeight + 'rem'
      }
    }, verse.kjvText, " (KJV)"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: fontSize + 'rem',
        lineHeight: lineHeight + 'rem'
      }
    }, verse.krvText, " (\uAC1C\uC5ED\uAC1C\uC815)"));
  })) : /*#__PURE__*/React.createElement("p", null, "\uAD6C\uC808\uC744 \uCD94\uAC00\uD558\uC138\uC694.")));
};
ReactDOM.render(/*#__PURE__*/React.createElement(App, null), document.getElementById('root'));
console.log('App rendered successfully.');
