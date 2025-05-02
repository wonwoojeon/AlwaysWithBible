var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;
var App = function () {
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
  var lineHeightState = useState(1.5);
  var lineHeight = lineHeightState[0];
  var setLineHeight = lineHeightState[1];
  var containerWidthState = useState(672);
  var containerWidth = containerWidthState[0];
  var setContainerWidth = containerWidthState[1];
  var isCollapsedState = useState(false);
  var isCollapsed = isCollapsedState[0];
  var setIsCollapsed = isCollapsedState[1];
  var isSoundOnState = useState(true);
  var isSoundOn = isSoundOnState[0];
  var setIsSoundOn = isSoundOnState[1];
  var scrollRef = useRef(null);
  var scrollPosState = useState(0);
  var scrollPos = scrollPosState[0];
  var setScrollPos = scrollPosState[1];
  var koreanDataState = useState(null);
  var koreanData = koreanDataState[0];
  var setKoreanData = koreanDataState[1];
  useEffect(function () {
    console.log('Fetching ko_rev.json...');
    fetch('/assets/ko_rev.json').then(function (response) {
      if (!response.ok) throw new Error('Failed to load ko_rev.json: ' + response.status + ' ' + response.statusText + '. Please ensure the file exists in the /assets directory on your server.');
      return response.json();
    }).then(function (data) {
      setKoreanData(data);
      console.log('ko_rev.json loaded:', data);
    }).catch(function (err) {
      console.error('Error loading ko_rev.json:', err.message);
      setError('한글 성경 데이터를 불러오지 못했습니다: ' + err.message + '. 서버에 /assets/ko_rev.json 파일이 있는지 확인해주세요.');
    });
  }, []);
  useEffect(function () {
    console.log('Loading verses from localStorage...');
    var saved = localStorage.getItem('verses');
    if (saved) {
      try {
        setVerses(JSON.parse(saved));
        console.log('Verses loaded from localStorage:', saved);
      } catch (e) {
        console.error('Failed to parse verses from localStorage:', e);
        setError('저장된 구절을 불러오지 못했습니다: ' + e.message);
      }
    }
  }, []);
  useEffect(function () {
    console.log('Saving verses to localStorage:', verses);
    try {
      localStorage.setItem('verses', JSON.stringify(verses));
    } catch (e) {
      console.error('Failed to save verses to localStorage:', e);
      setError('구절을 저장하지 못했습니다: ' + e.message);
    }
  }, [verses]);
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
  var toggleSound = function () {
    if (isSoundOn) {
      window.speechSynthesis.cancel();
      document.getElementById('bgm').pause();
    } else {
      document.getElementById('bgm').play();
    }
    setIsSoundOn(!isSoundOn);
  };
  var deleteVerse = function (index) {
    console.log('Deleting verse at index:', index);
    var updatedVerses = verses.filter(function (_, i) {
      return i !== index;
    });
    setVerses(updatedVerses);
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
          if (!kjvResponse.ok) throw new Error('KJV API 요청 실패: ' + kjvResponse.status + ' ' + kjvResponse.statusText);
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
    if (isSoundOn) {
      var utterance = new SpeechSynthesisUtterance(verse.kjvText);
      utterance.lang = 'en-US';
      utterance.rate = speechRate;
      window.speechSynthesis.speak(utterance);
      var krUtterance = new SpeechSynthesisUtterance(verse.krvText);
      krUtterance.lang = 'ko-KR';
      krUtterance.rate = speechRate;
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
  }, "Bible Infinite Scroll"), /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      setIsCollapsed(!isCollapsed);
    },
    className: "toggle-button"
  }, isCollapsed ? '▼' : '▲')), !isCollapsed && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mb-4"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
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
    className: "slider-label"
  }, "\uC2A4\uD06C\uB864 \uC18D\uB3C4: ", scrollSpeed.toFixed(1)), /*#__PURE__*/React.createElement("input", {
    type: "range",
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
    className: "slider-label"
  }, "\uAE00\uC790 \uD06C\uAE30: ", fontSize.toFixed(1), "rem"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0.8",
    max: "2",
    step: "0.1",
    value: fontSize,
    onChange: function (e) {
      setFontSize(parseFloat(e.target.value));
    },
    className: "slider"
  })), /*#__PURE__*/React.createElement("div", {
    className: "slider-container"
  }, /*#__PURE__*/React.createElement("label", {
    className: "slider-label"
  }, "\uC904\uAC04\uACA9: ", lineHeight.toFixed(1), "rem"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "1.2",
    max: "2.0",
    step: "0.1",
    value: lineHeight,
    onChange: function (e) {
      setLineHeight(parseFloat(e.target.value));
    },
    className: "slider"
  })), /*#__PURE__*/React.createElement("div", {
    className: "slider-container"
  }, /*#__PURE__*/React.createElement("label", {
    className: "slider-label"
  }, "\uBCF8\uBB38 \uB108\uBE44: ", containerWidth, "px"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "400",
    max: "1300",
    step: "10",
    value: containerWidth,
    onChange: function (e) {
      setContainerWidth(parseInt(e.target.value));
    },
    className: "slider"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: toggleSound,
    className: "sound-button"
  }, isSoundOn ? '🔊 소리 끄기' : '🔇 소리 켜기')), loading && /*#__PURE__*/React.createElement("p", {
    className: "loading"
  }, "\uAC80\uC0C9 \uC911..."), error && /*#__PURE__*/React.createElement("div", {
    class: "error"
  }, error), searchResults.length > 0 && /*#__PURE__*/React.createElement("div", {
    class: "mb-4"
  }, /*#__PURE__*/React.createElement("h2", {
    class: "subtitle"
  }, "\uAC80\uC0C9 \uACB0\uACFC"), searchResults.map(function (result, idx) {
    return /*#__PURE__*/React.createElement("div", {
      key: result.query,
      class: "verse"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      onChange: function () {
        addVerses(result, idx);
      }
    }), /*#__PURE__*/React.createElement("span", {
      class: "ml-2"
    }, result.query, ": ", result.kjvText, " (KJV)"), /*#__PURE__*/React.createElement("p", {
      class: "ml-6"
    }, result.krvText, " (\uAC1C\uC5ED\uAC1C\uC815)"));
  })), /*#__PURE__*/React.createElement("div", {
    ref: scrollRef,
    class: "scroll-area",
    style: {
      height: isCollapsed ? 'calc(100vh - 60px)' : '70vh'
    }
  }, verses.length > 0 ? /*#__PURE__*/React.createElement("div", {
    class: "scroll-content"
  }, [...Array(100)].map(function (_, idx) {
    var verse = verses[idx % verses.length];
    var headers = formatVerseHeader(verse.query);
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      class: "verse"
    }, /*#__PURE__*/React.createElement("div", {
      class: "verse-header"
    }, headers.korHeader), /*#__PURE__*/React.createElement("div", {
      class: "verse-header"
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
