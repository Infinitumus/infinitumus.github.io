var audioContext;
var soundSource;
var isPlaying = false;
var startTime = 0;

var userAgent1 = navigator.userAgent || navigator.vendor || window.opera;

function initSoundManager() {
  return new Promise((resolve) => {
    soundManager.onready(() => {
      soundManager.defaultOptions = {
        autoLoad: true,
        stream: true
      };

      soundManager.createSound({
        id: 'mySound',
        url: './music/music.ogg',
        onfinish: resolve // вызывается, когда звук загружен и готов к использованию
      });
    });
  });
}

function initAudio() {
  return new Promise((resolve, reject) => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Загрузка звукового файла
    var request = new XMLHttpRequest();
    request.open('GET', './music/music.ogg', true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
      audioContext.decodeAudioData(request.response, function (buffer) {
        // Успешно декодированный буфер
        soundSource = audioContext.createBufferSource();
        soundSource.buffer = buffer;
        soundSource.connect(audioContext.destination);
        soundSource.loop = true;
        soundSource.src = '';

      }, function (error) {
        console.error('Error decoding audio file', error);
        reject(error); // Отклоняем Promise в случае ошибки
      });
    };

    request.send();
    resolve();
  });
}

function initBridgeJs(callback) {
vkBridge.send('VKWebAppInit');

    if (/iPad|iPhone|iPod/.test(userAgent1) && !window.MSStream || /Mac/i.test(userAgent1)) {
        initSoundManager().then(bridge.initialize()
                                                        .then(function () {
                                                                    bridge.platform.sdk;
                                                                    window.game = bridge.platform;
                                                                    //let message = 'game_ready';
                                                                   // game.sendMessage(message);
                                                                    showAdwJs();
                                                                    window.storage = bridge.storage;
                                                                    window.storageTypeLocal = bridge.STORAGE_TYPE.LOCAL_STORAGE;
                                                                    window.storageTypePlatform = bridge.STORAGE_TYPE.PLATFORM_INTERNAL;
                                                                    var lang = bridge.platform.language;
                                                                    var domain = bridge.platform.tld;
                                                                    callback(lang + ' ' + domain);
                                                        }));
    }else {
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



function playSound(id) {
if (/iPad|iPhone|iPod/.test(userAgent1) && !window.MSStream || /Mac/i.test(userAgent1)) {
        soundManager.play(id, { volume: 50, onfinish: function() {
                                    playSound(id);
                                  }});
}else {
  if (!isPlaying) {
    isPlaying = true;
    soundSource.start(0, startTime);
  }
  }
}

function pauseSound(id) {
    if (/iPad|iPhone|iPod/.test(userAgent1) && !window.MSStream || /Mac/i.test(userAgent1)) {
        soundManager.pause(id);
    }else {

  if (isPlaying) {
    isPlaying = false;
    audioContext.suspend().then(function() {
      startTime = audioContext.currentTime;
    });
  }
}
}

function resumeSound(id) {
    if (/iPad|iPhone|iPod/.test(userAgent1) && !window.MSStream || /Mac/i.test(userAgent1)) {
        soundManager.resume(id);
    }else {
  if (!isPlaying) {
    isPlaying = true;
    audioContext.resume().then(function() {
      startTime = audioContext.currentTime - startTime;
      playSound();
    });
  }
}
}

function stopSound(id) {
  if (/iPad|iPhone|iPod/.test(userAgent1) && !window.MSStream || /Mac/i.test(userAgent1)) {
      soundManager.stop(id);
  }else {
  if (isPlaying) {
    isPlaying = false;
    soundSource.stop();
  }
}
}

function getLeaderBoardJs(callback){
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
        .then(function(entries) {
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
                }else {
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

function isGameVisibleJs(callback){
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

function getPlayerNameJs(callback){
    if (bridge.player.isAuthorized){
        callback(bridge.player.name);
    }else {
        callback('not authorized');
    }
}

function isPlayerAuthorizedJs(callback){
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
function showRewardedAdwJs(){
    bridge.advertisement.showRewarded();
}
function adwRewardedStateJs(callback) {
    bridge.advertisement.on(bridge.EVENT_NAME.REWARDED_STATE_CHANGED,
        function (state) {
            callback(state);
        });
}