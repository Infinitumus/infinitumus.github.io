var currentTrack = null;
var currentIndex = null;
var audioContext;
var soundSources = []; // Массив для хранения источников звука
var isPlaying = false;
var startTimes = []; // Массив для хранения времени начала воспроизведения каждого трека
var gainNode;

var audioTracks = [
    { id: 'mySound1', url: './audio/pyala.mp3' },
    { id: 'mySound2', url: './audio/night.mp3' },
    { id: 'mySound3', url: './audio/hero.mp3' }
];

function getRandomTrackId() {
    // Возвращает случайный индекс из массива soundSources
    return Math.floor(Math.random() * soundSources.length);
}

var userAgent1 = navigator.userAgent || navigator.vendor || window.opera;

function initSoundManager() {
    return new Promise((resolve) => {
        soundManager.onready(() => {
            soundManager.defaultOptions = {
                autoLoad: true,
                stream: true
            };

            soundManager.createSound({
                id: 'mySound3',
                url: './audio/hero.mp3',
                onfinish: resolve // вызывается, когда звук загружен и готов к использованию
            });
            soundManager.createSound({
                            id: 'mySound2',
                            url: './audio/night.mp3',
                            onfinish: resolve // вызывается, когда звук загружен и готов к использованию
                        });
            soundManager.createSound({
                            id: 'mySound1',
                            url: './audio/pyala.mp3',
                            onfinish: resolve // вызывается, когда звук загружен и готов к использованию
                        });
        });
    });
}

function initAudio() {
    return new Promise((resolve, reject) => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
             // Создаем gainNode для управления громкостью
                    gainNode = audioContext.createGain();
                    gainNode.gain.value = 1;
                    // Подключаем gainNode к audioContext.destination
                    gainNode.connect(audioContext.destination);
        }

        var loadedCount = 0; // Счетчик загруженных треков

        audioTracks.forEach((track, index) => {
            var request = new XMLHttpRequest();
            request.open('GET', track.url, true);
            request.responseType = 'arraybuffer';

            request.onload = function () {
                audioContext.decodeAudioData(request.response, function (buffer) {
                    // Успешно декодированный буфер
                    var soundSource = audioContext.createBufferSource();
                    soundSource.buffer = buffer;
                    // Подключаем soundSource к gainNode вместо audioContext.destination
                    soundSource.connect(gainNode);
                    soundSources[index] = soundSource; // Сохраняем источник звука в массиве

                    loadedCount++;
                    if (loadedCount === audioTracks.length) {
                        resolve(); // Все треки загружены и готовы к использованию
                    }
                }, function (error) {
                    console.error('Error decoding audio file', error);
                    reject(error); // Отклоняем Promise в случае ошибки
                });
            };

            request.send();
        });
    });
}

function initBridgeJs(callback) {

    if (/iPad|iPhone|iPod/.test(userAgent1) && !window.MSStream || /Mac/i.test(userAgent1)) {
        initSoundManager().then(bridge.initialize()
            .then(function () {
                bridge.platform.sdk;
                window.game = bridge.platform;
                let message = 'game_ready';
                game.sendMessage(message);
                showAdwJs();
                window.storage = bridge.storage;
                window.storageTypeLocal = bridge.STORAGE_TYPE.LOCAL_STORAGE;
                window.storageTypePlatform = bridge.STORAGE_TYPE.PLATFORM_INTERNAL;
                var lang = bridge.platform.language;
                var domain = bridge.platform.tld;
                callback(lang + ' ' + domain);
            }));
    } else {
        initAudio().then(bridge.initialize()
            .then(function () {
                bridge.platform.sdk;
                window.game = bridge.platform;
                let message = 'game_ready';
                game.sendMessage(message);
                showAdwJs();
                window.storage = bridge.storage;
                window.storageTypeLocal = bridge.STORAGE_TYPE.LOCAL_STORAGE;
                window.storageTypePlatform = bridge.STORAGE_TYPE.PLATFORM_INTERNAL;
                var lang = bridge.platform.language;
                var domain = bridge.platform.tld;
                callback(lang + ' ' + domain);
            }));
    }
}

function playRandomSound() {
    // Выбираем случайный индекс из диапазона от 0 до длины массива audioTracks
    var randomIndex = getRandomTrackId();
    currentTrack = audioTracks[randomIndex];
    currentIndex = randomIndex;

    if (/iPad|iPhone|iPod/.test(userAgent1) && !window.MSStream || /Mac/i.test(userAgent1)) {
        // Используем SoundManager для воспроизведения случайного трека
        soundManager.play(currentTrack.id, {
            volume: 75,
            onfinish: function() {
            currentIndex = currentIndex + 1;
                            if(currentIndex > 2){
                                currentIndex = 0;
                            }
                playSound(); // После окончания воспроизведения трека, запускаем другой случайный трек
            }
        });
    } else {
        // Используем Web Audio API для воспроизведения случайного трека
        if (!isPlaying) {
            isPlaying = true;
            var soundToPlay = soundSources[randomIndex];
            soundToPlay.start(0);
            soundToPlay.onended = function() {
                currentIndex = currentIndex + 1;
                if(currentIndex > 2){
                    currentIndex = 0;
                }
                playSound(); // После окончания воспроизведения трека, запускаем другой случайный трек
            };
        }
    }
}

function playSound(){
    currentTrack = audioTracks[currentIndex];
    if (/iPad|iPhone|iPod/.test(userAgent1) && !window.MSStream || /Mac/i.test(userAgent1)) {
            // Используем SoundManager для воспроизведения случайного трека
            soundManager.play(currentTrack.id, {
                volume: 75,
                onfinish: function() {
                currentIndex = currentIndex + 1;
                                if(currentIndex > 2){
                                    currentIndex = 0;
                                }
                    playSound(); // После окончания воспроизведения трека, запускаем другой случайный трек
                }
            });
        } else {
            // Используем Web Audio API для воспроизведения случайного трека

                var soundToPlay = soundSources[currentIndex];
                soundToPlay.start(0);
                soundToPlay.onended = function() {
                    currentIndex = currentIndex + 1;
                    if(currentIndex > 2){
                        currentIndex = 0;
                    }
                    playSound();
                    initAudio();
                };
            }
}

function pauseSound() {
    if (/iPad|iPhone|iPod/.test(userAgent1) && !window.MSStream || /Mac/i.test(userAgent1)) {
        soundManager.pause(currentTrack.id);
    } else {

        if (isPlaying) {
            isPlaying = false;
            audioContext.suspend().then(function () {

            });
        }
    }
}

function resumeSound() {
    if (/iPad|iPhone|iPod/.test(userAgent1) && !window.MSStream || /Mac/i.test(userAgent1)) {
            // Возобновление для SoundManager
            soundManager.resume(currentTrack.id); // Используйте идентификатор вашего звука
        } else {
            // Возобновление для Web Audio API
            if (!isPlaying) {
                audioContext.resume().then(function () {
                    isPlaying = true;
                    // Воспроизведение будет продолжено с момента, на котором было приостановлено
                    // Нет необходимости в дополнительных действиях
                });
            }
        }
}

function stopSound() {
    if (/iPad|iPhone|iPod/.test(userAgent1) && !window.MSStream || /Mac/i.test(userAgent1)) {
        soundManager.stop(currentTrack.id);
    } else {
        if (isPlaying) {
            isPlaying = false;
            soundSources[currentTrack].stop();
        }
    }
}

// Функция для отключения звука
function mute() {
    if (/iPad|iPhone|iPod/.test(userAgent1) && !window.MSStream || /Mac/i.test(userAgent1)) {
        // Отключение звука через SoundManager
        soundManager.mute();
    } else {
        // Отключение звука через Web Audio API
        gainNode.gain.value = 0; // Устанавливаем уровень громкости на 0
    }
}

// Функция для включения звука
function unmute() {
    if (/iPad|iPhone|iPod/.test(userAgent1) && !window.MSStream || /Mac/i.test(userAgent1)) {
        // Включение звука через SoundManager
        soundManager.unmute();
    } else {
        // Включение звука через Web Audio API
        gainNode.gain.value = 1; // Восстанавливаем уровень громкости
    }
}

function getLeaderBoardJs(callback) {
    let getEntriesOptions = {
        'yandex': {
            leaderboardName: 'BestDragons',
            includeUser: true,
            quantityAround: 5,
            quantityTop: 5
        }
    }
    var playerDataArray = [];
    bridge.leaderboard.getEntries(getEntriesOptions)
        .then(function (entries) {
            entries.forEach(function (e) {
                let playerData = [e.rank, e.name, e.score, e.photos[0]];
                playerDataArray.push(playerData);
            });
            callback(playerDataArray);
        })
        .catch(function (error) {
            console.log(error);
        });
}

function updateLeaderboardJs(scores, callback) {
    if (bridge.player.isAuthorized) {
        let getScoreOptions = {
            'yandex': {
                leaderboardName: 'BestDragons',
            }
        }
        bridge.leaderboard.getScore(getScoreOptions)
            .then(function (getScores) {
                if (getScores < scores) {
                    let setScoreOptions = {
                        'yandex': {
                            leaderboardName: 'BestDragons',
                            score: scores
                        }
                    }
                    bridge.leaderboard.setScore(setScoreOptions)
                        .then(function () {
                            console.log('Leaderboard Update');
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                    callback('update scores ' + scores);
                } else {
                    callback('not best')
                }
            })
            .catch(function (error) {
                let setScoreOptions = {
                    'yandex': {
                        leaderboardName: 'BestDragons',
                        score: scores
                    }
                }
                bridge.leaderboard.setScore(setScoreOptions)
                    .then(function () {
                        console.log('LeaderBoard Update');
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                callback('update scores ' + scores);
            });
    } else {
        callback('update scores failed you are not auth');
    }
}

function isGameVisibleJs(callback) {
    bridge.game.on(bridge.EVENT_NAME.VISIBILITY_STATE_CHANGED,
        function (state) {
            callback(state);
        });
}

function loadFromSdk(key, callback) {
    var resultLocal;
    window.storage.get(key, window.storageTypeLocal)
        .then(function (data) {
            if (data === null || typeof data === 'undefined') {
                resultLocal = '0';
            } else {
                resultLocal = data.toString();
            }
            callback(resultLocal);
        });
}


function saveToSdk(key, value, callback) {
    var result = value;
    window.storage.set(key, value, window.storageTypeLocal);
    callback(result);
}

function authorization(callback) {
    if (!bridge.player.isAuthorized) {
        let authorizationOptions = {
            'yandex': {
                scopes: true
            }
        }
        bridge.player.authorize(authorizationOptions)
            .then(function () {
                callback(bridge.player.name);
            })
            .catch(function (error) {
                console.log(error);
                callback('not authorized');
            });
    }
}

function getPlayerNameJs(callback) {
    if (bridge.player.isAuthorized) {
        callback(bridge.player.name);
    } else {
        callback('not authorized');
    }
}

function isPlayerAuthorizedJs(callback) {
    callback(bridge.player.isAuthorized);
}

function showAdwJs() {
    bridge.advertisement.showInterstitial();
}

function adwStateJs(callback) {
    bridge.advertisement.on(bridge.EVENT_NAME.INTERSTITIAL_STATE_CHANGED,
        function (state) {
            callback(state);
        });
}
function showRewardedAdwJs() {
    bridge.advertisement.showRewarded();
}
function adwRewardedStateJs(callback) {
    bridge.advertisement.on(bridge.EVENT_NAME.REWARDED_STATE_CHANGED,
        function (state) {
            callback(state);
        });
}