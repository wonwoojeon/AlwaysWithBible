var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;

// Firebase Firestore 및 Auth 초기화
var db, auth;
try {
  if (typeof firebase === 'undefined') {
    throw new Error('Firebase is not defined');
  }
  db = firebase.firestore();
  auth = firebase.auth();
} catch (e) {
  console.error('Firebase initialization failed:', e.message);
}

var App = function() {
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
  
  // 음성 소리 볼륨 상태
  var speechVolumeState = useState(1.0);
  var speechVolume = speechVolumeState[0];
  var setSpeechVolume = speechVolumeState[1];
  
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

  // 공유된 구절 상태
  var sharedVersesState = useState([]);
  var sharedVerses = sharedVersesState[0];
  var setSharedVerses = sharedVersesState[1];

  // Firebase 초기화 확인
  useEffect(function() {
    if (!db || !auth) {
      setError('Firebase 초기화에 실패했습니다. 새로고침 후 다시 시도해주세요.');
      return;
    }
  }, []);

  // 사용자 인증 상태 감지
  useEffect(function() {
    if (!auth) return;
    var unsubscribe = auth.onAuthStateChanged(function(firebaseUser) {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setVerses([]);
      }
    });
    return function() { unsubscribe(); };
  }, []);

  // 글자 크기 변경 시 줄간격 초기값 동기화
  useEffect(function() {
    setLineHeight(fontSize * 1.2);
  }, [fontSize]);

  // BGM 파일 목록 로드
  useEffect(function() {
    fetch('/assets/index.json')
      .then(function(response) {
        if (!response.ok) throw new Error('Failed to load BGM list');
        return response.json();
      })
      .then(function(data) {
        var bgmFiles = data.bgmFiles.map(function(file) {
          return `/assets/${file}`;
        });
        setBgmList(bgmFiles);
        if (bgmFiles.length > 0) {
          var randomIndex = Math.floor(Math.random() * bgmFiles.length);
          setCurrentBgm(bgmFiles[randomIndex]);
        }
      })
      .catch(function(err) {
        console.error('Error loading BGM list:', err.message);
        setError('BGM 목록을 불러오지 못했습니다: ' + err.message);
      });
  }, []);

  // BGM 재생 로직
  useEffect(function() {
    var bgmElement = document.getElementById('bgm');
    if (!bgmElement || !currentBgm) return;

    bgmElement.src = currentBgm;
    if (isBgmOn) {
      bgmElement.play().catch(function(e) {
        console.error('BGM 재생 실패:', e);
        setError('BGM 재생에 실패했습니다: 브라우저 정책에 의해 차단되었거나 파일을 로드할 수 없습니다. (' + e.message + ')');
      });
    } else {
      bgmElement.pause();
    }
  }, [isBgmOn, currentBgm, bgmList]);

  useEffect(function() {
    console.log('Fetching ko_rev.json...');
    fetch('/assets/ko_rev.json')
      .then(function(response) {
        if (!response.ok) throw new Error('Failed to load ko_rev.json: ' + response.status + ' ' + response.statusText + '. Please ensure the file exists in the /assets directory on your server.');
        return response.json();
      })
      .then(function(data) {
        setKoreanData(data);
        console.log('ko_rev.json loaded:', data);
      })
      .catch(function(err) {
        console.error('Error loading ko_rev.json:', err.message);
        setError('한글 성경 데이터를 불러오지 못했습니다: ' + err.message + '. 서버에 /assets/ko_rev.json 파일이 있는지 확인해주세요.');
      });
  }, []);

  // 로그인 상태에 따라 구절 로드 (실시간 업데이트)
  useEffect(function() {
    if (!db || !user) return;
    var userId = user.uid;
    console.log('Subscribing to verses for user:', userId);
    var versesRef = db.collection('users').doc(userId).collection('verses').doc('data');
    var unsubscribe = versesRef.onSnapshot(function(doc) {
      if (doc.exists) {
        var savedVerses = doc.data().verses || [];
        setVerses(savedVerses);
        console.log('Verses loaded from Firestore:', savedVerses);
      } else {
        console.log('No verses found for user, initializing empty array');
        setVerses([]);
      }
    }, function(e) {
      console.error('Failed to load verses from Firestore:', e);
      setError('저장된 구절을 불러오지 못했습니다: ' + e.message);
    });
    return function() { unsubscribe(); };
  }, [user]);

  // 구절 저장 (로그인 상태일 때만)
  useEffect(function() {
    if (!db || !user) return;
    var userId = user.uid;
    console.log('Saving verses for user:', userId, verses);
    var versesRef = db.collection('users').doc(userId).collection('verses').doc('data');
    versesRef.set({ verses: verses }).catch(function(e) {
      console.error('Failed to save verses to Firestore:', e);
      setError('구절을 저장하지 못했습니다: ' + e.message);
    });
  }, [verses, user]);

  // 공유된 구절 로드 (실시간 업데이트)
  useEffect(function() {
    if (!db) return;
    var sharedRef = db.collection('shared_verses');
    var unsubscribe = sharedRef.onSnapshot(function(querySnapshot) {
      var shared = [];
      querySnapshot.forEach(function(doc) {
        shared.push({ id: doc.id, ...doc.data() });
      });
      setSharedVerses(shared);
      console.log('Shared verses loaded:', shared);
    }, function(e) {
      console.error('Failed to load shared verses:', e);
      setError('공유된 구절을 불러오지 못했습니다: ' + e.message);
    });
    return function() { unsubscribe(); };
  }, []);

  useEffect(function() {
    console.log('Starting auto-scroll with speed:', scrollSpeed);
    var scroll = function() {
      setScrollPos(function(prev) {
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
    return function() { clearInterval(interval); };
  }, [scrollSpeed, verses]);

  useEffect(function() {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollPos;
      console.log('Scroll position updated:', scrollPos);
    }
  }, [scrollPos]);

  useEffect(function() {
    var newSpeechRate = 0.5 + (scrollSpeed - 0.1) * (1.5 / 1.9);
    setSpeechRate(Math.min(Math.max(newSpeechRate, 0.5), 2));
    console.log('Speech rate updated:', newSpeechRate);
  }, [scrollSpeed]);

  var animationDuration = verses.length > 0 ? 10 + verses.length * 2 : 10;

  var toggleBgm = function() {
    setIsBgmOn(!isBgmOn);
  };

  var toggleVoice = function() {
    if (isVoiceOn) {
      window.speechSynthesis.cancel();
    }
    setIsVoiceOn(!isVoiceOn);
  };

  var deleteVerse = function(index) {
    console.log('Deleting verse at index:', index);
    var updatedVerses = verses.filter(function(_, i) { return i !== index; });
    setVerses(updatedVerses);
  };

  var signup = function() {
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
    auth.createUserWithEmailAndPassword(signupUsername, signupPassword)
      .then(function(userCredential) {
        setError('회원가입이 완료되었습니다. 로그인해주세요.');
        setSignupUsername('');
        setSignupPassword('');
      })
      .catch(function(error) {
        console.error('Signup error:', error);
        setError('회원가입 실패: ' + error.message);
      });
  };

  var login = function() {
    if (!auth) {
      setError('Firebase 인증 서비스가 초기화되지 않았습니다.');
      return;
    }
    if (!username || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    auth.signInWithEmailAndPassword(username, password)
      .then(function(userCredential) {
        setError('');
        setUsername('');
        setPassword('');
      })
      .catch(function(error) {
        console.error('Login error:', error);
        setError('로그인 실패: ' + error.message);
      });
  };

  var logout = function() {
    if (!auth) {
      setError('Firebase 인증 서비스가 초기화되지 않았습니다.');
      return;
    }
    auth.signOut().then(function() {
      setUser(null);
      setVerses([]);
      setError('');
    }).catch(function(error) {
      console.error('Logout error:', error);
      setError('로그아웃 실패: ' + error.message);
    });
  };

  var shareVerse = function(verse) {
    if (!db) {
      setError('Firebase 데이터베이스 서비스가 초기화되지 않았습니다.');
      return;
    }
    if (!user) {
      setError('로그인 후 구절을 공유할 수 있습니다.');
      return;
    }
    var sharedRef = db.collection('shared_verses').doc();
    sharedRef.set({
      verse: verse,
      sharedBy: user.email,
      sharedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function() {
      setError('구절이 공유되었습니다.');
    }).catch(function(e) {
      console.error('Failed to share verse:', e);
      setError('구절 공유 실패: ' + e.message);
    });
  };

  var addSharedVerse = function(sharedVerse) {
    setVerses(verses.concat([sharedVerse.verse]));
  };

  var searchVerses = async function() {
    setLoading(true);
    setError('');
    console.log('Starting search with input:', input);
    try {
      var queries = input.split(',').map(function(q) { return q.trim(); });
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
          if (!kjvResponse.ok) throw new Error(`KJV API 요청 실패: ${kjvResponse.status} ${kjvResponse.statusText}`);
          var kjvData = await kjvResponse.json();
          console.log('KJV API response:', kjvData);
          if (kjvData.error) throw new Error(kjvData.error);

          if (!kjvData.verses || kjvData.verses.length === 0) {
            throw new Error('해당 구절을 찾을 수 없습니다.');
          }
          var verses = kjvData.verses
            .filter(function(verseData) {
              return endVerse === Infinity || (verseData.verse >= startVerse && verseData.verse <= endVerse);
            })
            .map(function(verseData) {
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
          var bookData = koreanData.find(function(b) { return b.name === bookName; });
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

        results.push({ query: query, kjvText: kjvText, krvText: krvText });
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

  var addVerses = function(verse, index) {
    console.log('Adding verse to scroll list:', verse);
    setVerses(verses.concat([verse]));
    var updatedResults = searchResults.filter(function(_, i) { return i !== index; });
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

  var formatVerseHeader = function(query) {
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

    var korHeader = startVerse && endVerse
      ? `${bookKor} ${chapter}장 ${startVerse}절~${endVerse}절`
      : `${bookKor} ${chapter}장`;
    var engHeader = startVerse && endVerse
      ? `${bookEng} ${chapter}:${startVerse}-${endVerse}`
      : `${bookEng} ${chapter}`;

    return { korHeader, engHeader };
  };

  return (
    <div className="container" style={{ maxWidth: containerWidth + 'px' }}>
      <div className="title-bar">
        <h1 className="title">j2w_2027 Bible Infinite Scroll</h1>
        <button
          onClick={function() { setIsCollapsed(!isCollapsed); }}
          className="toggle-button"
        >
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>
      {!user && (
        <div className="mb-4">
          <h2 className="subtitle">로그인</h2>
          <input
            type="email"
            value={username}
            onChange={function(e) { setUsername(e.target.value); }}
            placeholder="이메일 (예: user@example.com)"
            className="input"
          />
          <input
            type="password"
            value={password}
            onChange={function(e) { setPassword(e.target.value); }}
            placeholder="비밀번호"
            className="input"
          />
          <button onClick={login} className="button">로그인</button>
          <h2 className="subtitle">회원가입</h2>
          <input
            type="email"
            value={signupUsername}
            onChange={function(e) { setSignupUsername(e.target.value); }}
            placeholder="이메일 (예: user@example.com)"
            className="input"
          />
          <input
            type="password"
            value={signupPassword}
            onChange={function(e) { setSignupPassword(e.target.value); }}
            placeholder="비밀번호"
            className="input"
          />
          <button onClick={signup} className="button">회원가입</button>
        </div>
      )}
      {user && (
        <div className="mb-4">
          <p>환영합니다, {user.email}님!</p>
          <button onClick={logout} className="button">로그아웃</button>
        </div>
      )}
      {!isCollapsed && (
        <div>
          <div className="mb-4">
            <input
              type="text"
              value={input}
              onChange={function(e) { setInput(e.target.value); }}
              placeholder="예: 창세기 1:1~5, 시편 23"
              className="input"
            />
            <button
              onClick={searchVerses}
              className="button"
            >
              검색
            </button>
            {verses.length > 0 && (
              <div className="selected-verses">
                <div
                  className="selected-verses-container"
                  style={{ animationDuration: animationDuration + 's' }}
                >
                  {verses.concat(verses).map(function(verse, idx) {
                    return (
                      <div key={idx} className="selected-verse-item">
                        <span>{verse.query}</span>
                        <button
                          onClick={function(e) {
                            e.stopPropagation();
                            deleteVerse(idx % verses.length);
                          }}
                          className="delete-button"
                        >
                          X
                        </button>
                        {user && (
                          <button
                            onClick={function(e) {
                              e.stopPropagation();
                              shareVerse(verse);
                            }}
                            className="share-button"
                          >
                            공유
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="slider-container">
            <label className="slider-label">스크롤 속도: {scrollSpeed.toFixed(1)}</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={scrollSpeed}
              onChange={function(e) { setScrollSpeed(parseFloat(e.target.value)); }}
              className="slider"
            />
            <p>음성 재생 속도: {speechRate.toFixed(1)}</p>
          </div>
          <div className="slider-container">
            <label className="slider-label">글자 크기: {fontSize.toFixed(1)}rem</label>
            <input
              type="range"
              min="0.8"
              max="4"
              step="0.1"
              value={fontSize}
              onChange={function(e) { setFontSize(parseFloat(e.target.value)); }}
              className="slider"
            />
          </div>
          <div className="slider-container">
            <label className="slider-label">줄간격: {lineHeight.toFixed(1)}rem</label>
            <input
              type="range"
              min="1.2"
              max="4.0"
              step="0.1"
              value={lineHeight}
              onChange={function(e) { setLineHeight(parseFloat(e.target.value)); }}
              className="slider"
            />
          </div>
          <div className="slider-container">
            <label className="slider-label">본문 너비: {containerWidth}px</label>
            <input
              type="range"
              min="400"
              max="1300"
              step="10"
              value={containerWidth}
              onChange={function(e) { setContainerWidth(parseInt(e.target.value)); }}
              className="slider"
            />
          </div>
          <div className="slider-container">
            <label className="slider-label">음성 볼륨: {speechVolume.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={speechVolume}
              onChange={function(e) { setSpeechVolume(parseFloat(e.target.value)); }}
              className="slider"
            />
          </div>
          <button
            onClick={toggleBgm}
            className="sound-button"
          >
            {isBgmOn ? '🎵 BGM 끄기' : '🎶 BGM 켜기'}
          </button>
          <button
            onClick={toggleVoice}
            className="sound-button"
          >
            {isVoiceOn ? '🗣️ 음성 끄기' : '🔈 음성 켜기'}
          </button>
        </div>
      )}
      {loading && <p className="loading">검색 중...</p>}
      {error && <div className="error">{error}</div>}
      {searchResults.length > 0 && (
        <div className="mb-4">
          <h2 className="subtitle">검색 결과</h2>
          {searchResults.map(function(result, idx) {
            return (
              <div key={result.query} className="verse">
                <input
                  type="checkbox"
                  onChange={function() { addVerses(result, idx); }}
                />
                <span className="ml-2">{result.query}: {result.kjvText} (KJV)</span>
                <p className="ml-6">{result.krvText} (개역개정)</p>
              </div>
            );
          })}
        </div>
      )}
      {sharedVerses.length > 0 && (
        <div className="mb-4">
          <h2 className="subtitle">공유된 구절</h2>
          {sharedVerses.map(function(sharedVerse) {
            return (
              <div key={sharedVerse.id} className="verse">
                <button
                  onClick={function() { addSharedVerse(sharedVerse); }}
                  className="button"
                >
                  추가
                </button>
                <span className="ml-2">{sharedVerse.verse.query}: {sharedVerse.verse.kjvText} (KJV)</span>
                <p className="ml-6">{sharedVerse.verse.krvText} (개역개정)</p>
                <p className="ml-6">공유자: {sharedVerse.sharedBy}</p>
              </div>
            );
          })}
        </div>
      )}
      <div
        ref={scrollRef}
        className="scroll-area"
        style={{
          height: isCollapsed ? 'calc(100vh - 60px)' : '70vh'
        }}
      >
        {verses.length > 0 ? (
          <div className="scroll-content">
            {[...Array(100)].map(function(_, idx) {
              var verse = verses[idx % verses.length];
              var headers = formatVerseHeader(verse.query);
              return (
                <div key={idx} className="verse">
                  <div className="verse-header">{headers.korHeader}</div>
                  <div className="verse-header">{headers.engHeader}</div>
                  <p style={{ fontSize: fontSize + 'rem', lineHeight: lineHeight + 'rem' }}>{verse.kjvText} (KJV)</p>
                  <p style={{ fontSize: fontSize + 'rem', lineHeight: lineHeight + 'rem' }}>{verse.krvText} (개역개정)</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p>구절을 추가하세요.</p>
        )}
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
console.log('App rendered successfully.');