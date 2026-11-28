/* Four languages: Kazakh (kk), Russian (ru), Chinese (zh), English (en). */
(function (root) {
  'use strict';
  var T = {
    kk: {
      title: 'Судоку', continue: 'Жалғастыру', newGame: 'Жаңа ойын', easy: 'Оңай', medium: 'Орташа', hard: 'Қиын',
      daily: 'Күнделікті тапсырма', dailyDone: 'Бүгін орындалды', online: 'Онлайн жарыс', leaderboard: 'Рейтинг',
      settings: 'Баптаулар', language: 'Тіл', theme: 'Тақырып', light: 'Жарық', dark: 'Қараңғы', auto: 'Авто',
      showErrors: 'Қателерді көрсету', undo: 'Қайтару', erase: 'Өшіру', notes: 'Жазба', hint: 'Кеңес',
      time: 'Уақыт', mistakes: 'Қате', paused: 'Кідіртілді', resume: 'Жалғастыру', win: 'Жарайсың!',
      hintsUsed: 'Кеңестер', score: 'Нәтиже', submit: 'Рейтингке жіберу', yourName: 'Атыңыз', again: 'Тағы ойнау',
      home: 'Басты бет', install: 'Басты экранға қосу', iosInstall: 'Safari-де «Бөлісу» → «Басты экранға қосу» басыңыз',
      createRoom: 'Бөлме құру', joinRoom: 'Бөлмеге кіру', roomCode: 'Бөлме коды', waiting: 'Қарсыласты күтуде…',
      opponentJoined: 'Қарсылас қосылды', start: 'Бастау', copyLink: 'Шақыру сілтемесін көшіру', copied: 'Көшірілді',
      you: 'Сіз', opponent: 'Қарсылас', youWon: 'Сіз жеңдіңіз!', youLost: 'Қарсылас бұрын бітірді',
      oppLeft: 'Қарсылас шығып кетті', notConfigured: 'Онлайн режим әлі бапталмаған (README қараңыз)',
      connecting: 'Қосылуда…', enterCode: 'Кодты енгізіңіз', join: 'Кіру', roomNotFound: 'Бөлме табылмады',
      roomFull: 'Бөлме толы', getReady: 'Дайын болыңыз', waitHost: 'Хост ойынды бастауын күтіңіз…', rematch: 'Қайта ойнау',
      today: 'Бүгін', allTime: 'Барлық уақыт', empty: 'Әзірге нәтиже жоқ', stats: 'Статистика', wins: 'Жеңіс',
      best: 'Үздік уақыт', streak: 'Қатар күн', confirmNew: 'Ағымдағы ойын жоғалады. Жалғастырамыз ба?',
      submitted: 'Жіберілді', submitFail: 'Жіберілмеді', noHintsBattle: 'Жарыста кеңес жоқ', loading: 'Жүктелуде…',
      chooseDiff: 'Қиындық деңгейі', leave: 'Шығу', ok: 'Жарайды', cancel: 'Болдырмау', online2: 'Желіде', myBest: 'Менің үздік нәтижелерім'
    },
    ru: {
      title: 'Судоку', continue: 'Продолжить', newGame: 'Новая игра', easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный',
      daily: 'Задача дня', dailyDone: 'Выполнено сегодня', online: 'Онлайн-дуэль', leaderboard: 'Рейтинг',
      settings: 'Настройки', language: 'Язык', theme: 'Тема', light: 'Светлая', dark: 'Тёмная', auto: 'Авто',
      showErrors: 'Подсвечивать ошибки', undo: 'Отмена', erase: 'Стереть', notes: 'Заметки', hint: 'Подсказка',
      time: 'Время', mistakes: 'Ошибки', paused: 'Пауза', resume: 'Продолжить', win: 'Отлично!',
      hintsUsed: 'Подсказки', score: 'Итог', submit: 'Отправить в рейтинг', yourName: 'Ваше имя', again: 'Играть ещё',
      home: 'Главная', install: 'Добавить на главный экран', iosInstall: 'В Safari: «Поделиться» → «На экран Домой»',
      createRoom: 'Создать комнату', joinRoom: 'Войти в комнату', roomCode: 'Код комнаты', waiting: 'Ждём соперника…',
      opponentJoined: 'Соперник подключился', start: 'Начать', copyLink: 'Копировать ссылку-приглашение', copied: 'Скопировано',
      you: 'Вы', opponent: 'Соперник', youWon: 'Вы победили!', youLost: 'Соперник закончил раньше',
      oppLeft: 'Соперник вышел', notConfigured: 'Онлайн-режим не настроен (см. README)',
      connecting: 'Подключение…', enterCode: 'Введите код', join: 'Войти', roomNotFound: 'Комната не найдена',
      roomFull: 'Комната заполнена', getReady: 'Приготовьтесь', waitHost: 'Ждём, пока хозяин начнёт игру…', rematch: 'Реванш',
      today: 'Сегодня', allTime: 'За всё время', empty: 'Пока нет результатов', stats: 'Статистика', wins: 'Побед',
      best: 'Лучшее время', streak: 'Серия дней', confirmNew: 'Текущая игра будет потеряна. Продолжить?',
      submitted: 'Отправлено', submitFail: 'Не удалось отправить', noHintsBattle: 'В дуэли подсказок нет', loading: 'Загрузка…',
      chooseDiff: 'Сложность', leave: 'Выйти', ok: 'ОК', cancel: 'Отмена', online2: 'Онлайн', myBest: 'Мои лучшие результаты'
    },
    zh: {
      title: '数独', continue: '继续游戏', newGame: '新游戏', easy: '简单', medium: '中等', hard: '困难',
      daily: '每日挑战', dailyDone: '今日已完成', online: '联网对战', leaderboard: '排行榜',
      settings: '设置', language: '语言', theme: '主题', light: '浅色', dark: '深色', auto: '自动',
      showErrors: '错误高亮', undo: '撤销', erase: '擦除', notes: '笔记', hint: '提示',
      time: '用时', mistakes: '错误', paused: '已暂停', resume: '继续', win: '完成！',
      hintsUsed: '提示次数', score: '成绩', submit: '提交到排行榜', yourName: '你的昵称', again: '再来一局',
      home: '主页', install: '添加到主屏幕', iosInstall: '在 Safari 中点「分享」→「添加到主屏幕」',
      createRoom: '创建房间', joinRoom: '加入房间', roomCode: '房间号', waiting: '等待对手加入…',
      opponentJoined: '对手已加入', start: '开始对战', copyLink: '复制邀请链接', copied: '已复制',
      you: '你', opponent: '对手', youWon: '你赢了！', youLost: '对手先完成了',
      oppLeft: '对手已离开', notConfigured: '联网功能尚未配置（见 README）',
      connecting: '连接中…', enterCode: '输入房间号', join: '加入', roomNotFound: '房间不存在',
      roomFull: '房间已满', getReady: '准备', waitHost: '等待房主开始…', rematch: '再战一局',
      today: '今日', allTime: '总榜', empty: '暂无成绩', stats: '统计', wins: '胜场',
      best: '最佳用时', streak: '连续天数', confirmNew: '当前进度将丢失，继续吗？',
      submitted: '已提交', submitFail: '提交失败', noHintsBattle: '对战中不能使用提示', loading: '加载中…',
      chooseDiff: '选择难度', leave: '离开', ok: '确定', cancel: '取消', online2: '在线', myBest: '我的最佳成绩'
    },
    en: {
      title: 'Sudoku', continue: 'Continue', newGame: 'New game', easy: 'Easy', medium: 'Medium', hard: 'Hard',
      daily: 'Daily challenge', dailyDone: 'Done today', online: 'Online battle', leaderboard: 'Leaderboard',
      settings: 'Settings', language: 'Language', theme: 'Theme', light: 'Light', dark: 'Dark', auto: 'Auto',
      showErrors: 'Highlight mistakes', undo: 'Undo', erase: 'Erase', notes: 'Notes', hint: 'Hint',
      time: 'Time', mistakes: 'Mistakes', paused: 'Paused', resume: 'Resume', win: 'Solved!',
      hintsUsed: 'Hints used', score: 'Score', submit: 'Submit to leaderboard', yourName: 'Your name', again: 'Play again',
      home: 'Home', install: 'Add to home screen', iosInstall: 'In Safari tap Share → Add to Home Screen',
      createRoom: 'Create room', joinRoom: 'Join room', roomCode: 'Room code', waiting: 'Waiting for opponent…',
      opponentJoined: 'Opponent joined', start: 'Start', copyLink: 'Copy invite link', copied: 'Copied',
      you: 'You', opponent: 'Opponent', youWon: 'You won!', youLost: 'Opponent finished first',
      oppLeft: 'Opponent left', notConfigured: 'Online mode is not configured (see README)',
      connecting: 'Connecting…', enterCode: 'Enter code', join: 'Join', roomNotFound: 'Room not found',
      roomFull: 'Room is full', getReady: 'Get ready', waitHost: 'Waiting for the host to start…', rematch: 'Rematch',
      today: 'Today', allTime: 'All time', empty: 'No scores yet', stats: 'Stats', wins: 'Wins',
      best: 'Best time', streak: 'Daily streak', confirmNew: 'The current game will be lost. Continue?',
      submitted: 'Submitted', submitFail: 'Submit failed', noHintsBattle: 'No hints in battle', loading: 'Loading…',
      chooseDiff: 'Difficulty', leave: 'Leave', ok: 'OK', cancel: 'Cancel', online2: 'Online', myBest: 'My best times'
    }
  };
  Object.assign(T.kk, { restart: 'Қайта бастау', confirmRestart: 'Ағымдағы прогресс өшіріледі. Қайта бастаймыз ба?', continueGame: 'Жалғастыру', goOn: 'Ары қарай', nickname: 'Лақап ат (міндетті емес)', playerId: 'Ойыншы ID' });
  Object.assign(T.ru, { restart: 'Заново', confirmRestart: 'Прогресс будет сброшен. Начать заново?', continueGame: 'Продолжить игру', goOn: 'Далее', nickname: 'Ник (необязательно)', playerId: 'ID игрока' });
  Object.assign(T.zh, { restart: '重新开始', confirmRestart: '当前进度将清空，重新开始吗？', continueGame: '继续游戏', goOn: '继续', nickname: '昵称（可选）', playerId: '玩家 ID' });
  Object.assign(T.en, { restart: 'Restart', confirmRestart: 'Progress will be reset. Restart?', continueGame: 'Continue game', goOn: 'Resume', nickname: 'Nickname (optional)', playerId: 'Player ID' });
  Object.assign(T.kk, { gameAssist: 'Ойын көмекшісі', highlightSame: 'Бірдей сандарды бөлектеу', autoNotes: 'Жазбаларды автотазалау', showTimer: 'Таймерді көрсету', battleId: 'Жарыс профилі', copy: 'Көшіру', showErrorsD: 'Қате сандар қызылмен', highlightSameD: 'Таңдағанда бірдей сандар бөлектеледі', autoNotesD: 'Жүрістен кейін байланысты жазбаларды өшіру', showTimerD: 'Ойын уақытын көрсету' });
  Object.assign(T.ru, { gameAssist: 'Помощь в игре', highlightSame: 'Подсвечивать одинаковые цифры', autoNotes: 'Автоочистка заметок', showTimer: 'Показывать таймер', battleId: 'Профиль для дуэлей', copy: 'Копировать', showErrorsD: 'Неверные цифры красным', highlightSameD: 'Подсветка таких же цифр при выборе', autoNotesD: 'Убирать связанные заметки после хода', showTimerD: 'Время партии на экране' });
  Object.assign(T.zh, { gameAssist: '游戏辅助', highlightSame: '相同数字高亮', autoNotes: '自动清除草稿', showTimer: '显示计时器', battleId: '对战身份', copy: '复制', showErrorsD: '填错时标红提示', highlightSameD: '选中数字时关联提示', autoNotesD: '落子后清理同区笔记', showTimerD: '对局中展示耗时' });
  Object.assign(T.en, { gameAssist: 'Game assist', highlightSame: 'Highlight same digits', autoNotes: 'Auto-clear notes', showTimer: 'Show timer', battleId: 'Battle identity', copy: 'Copy', showErrorsD: 'Mark wrong digits in red', highlightSameD: 'Highlight matching digits on select', autoNotesD: 'Clear related notes after a move', showTimerD: 'Show elapsed time in game' });
  var LANGS = [['kk', 'Қазақша'], ['ru', 'Русский'], ['zh', '中文'], ['en', 'English']];

  Object.assign(T.kk, { tagEasy: 'Жаңадан бастаушыға', tagMedium: 'Ойға сын', tagHard: 'Шебер деңгейі', bestShort: 'Үздік', dailySub: 'Бүкіл әлемге бір тапсырма', onlineSub: 'Досыңмен жарыс', boardSub: 'Кім жылдам?', goBtn: 'Бастау', streakDays: '{n} күн қатарынан', streakNone: 'Бүгін бастаңыз' });
  Object.assign(T.ru, { tagEasy: 'Для новичков', tagMedium: 'Размять мозг', tagHard: 'Для мастеров', bestShort: 'Рекорд', dailySub: 'Одна задача для всех', onlineSub: 'Дуэль с другом', boardSub: 'Кто быстрее?', goBtn: 'Играть', streakDays: '{n} дн. подряд', streakNone: 'Начните сегодня' });
  Object.assign(T.zh, { tagEasy: '推荐新手', tagMedium: '挑战脑力', tagHard: '烧脑大师', bestShort: '最好', dailySub: '全球同一道题', onlineSub: '和朋友一对一', boardSub: '看看谁最快', goBtn: '开始', streakDays: '连续{n}天', streakNone: '今天开始打卡' });
  Object.assign(T.en, { tagEasy: 'Great for beginners', tagMedium: 'Brain workout', tagHard: 'For masters', bestShort: 'Best', dailySub: 'Same puzzle for everyone', onlineSub: 'Duel a friend', boardSub: 'Who is fastest?', goBtn: 'Play', streakDays: '{n}-day streak', streakNone: 'Start your streak' });



  Object.assign(T.zh, { quickMatch: '⚡ 快速匹配', publicRoom: '公开房间（别人可直接加入）', publicRooms: '公开房间', noPublic: '暂时没有公开房间', searching: '正在匹配对手…', matched: '已匹配到对手' });
  Object.assign(T.en, { quickMatch: '⚡ Quick match', publicRoom: 'Public room (anyone can join)', publicRooms: 'Open rooms', noPublic: 'No open rooms right now', searching: 'Looking for an opponent…', matched: 'Opponent found' });
  Object.assign(T.ru, { quickMatch: '⚡ Быстрый поиск', publicRoom: 'Открытая комната (любой может войти)', publicRooms: 'Открытые комнаты', noPublic: 'Сейчас нет открытых комнат', searching: 'Ищем соперника…', matched: 'Соперник найден' });
  Object.assign(T.kk, { quickMatch: '⚡ Жылдам іздеу', publicRoom: 'Ашық бөлме (кез келген адам кіре алады)', publicRooms: 'Ашық бөлмелер', noPublic: 'Қазір ашық бөлме жоқ', searching: 'Қарсылас іздеудеміз…', matched: 'Қарсылас табылды' });
  var cur = 'en';

  function detect() {
    var saved = null;
    try { saved = localStorage.getItem('sdk_lang'); } catch (e) {}
    if (saved && T[saved]) return saved;
    var nav = ((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase();
    if (nav.indexOf('kk') === 0) return 'kk';
    if (nav.indexOf('ru') === 0) return 'ru';
    if (nav.indexOf('zh') === 0) return 'zh';
    if (nav.indexOf('en') === 0) return 'en';
    return 'kk';
  }
  function set(l) {
    if (!T[l]) l = 'kk';
    cur = l;
    try { localStorage.setItem('sdk_lang', l); } catch (e) {}
    document.documentElement.lang = l;
  }
  function t(k) { return (T[cur] && T[cur][k]) || T.en[k] || k; }
  function apply(rootEl) {
    var nodes = (rootEl || document).querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
    var ph = (rootEl || document).querySelectorAll('[data-i18n-ph]');
    for (var j = 0; j < ph.length; j++) ph[j].setAttribute('placeholder', t(ph[j].getAttribute('data-i18n-ph')));
    document.title = t('title');
  }
  set(detect());
  root.I18N = { t: t, set: set, apply: apply, get: function () { return cur; }, LANGS: LANGS, T: T };
})(window);
