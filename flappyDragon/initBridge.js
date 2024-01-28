soundManager.onready(function() {

  soundManager.createSound({
    id: 'mySound',
    url: './music/music.mp3'
  });
});

function playSound(id) {
   soundManager.play(id, { volume: 50, onfinish: function() {
                              playSound(id);
                            }});
  }

function pauseSound(id) {
    soundManager.pause(id);
  }

function resumeSound(id) {
    soundManager.resume(id);
  }

function stopSound(id) {
    soundManager.stop(id);
  }

function getLeaderBoardJs(callback){
    let getEntriesOptions = {
        'yandex': {
            leaderboardName: 'Best Dragons',
            includeUser: true,
            quantityAround: 10,
            quantityTop: 10
        }
    }
    bridge.leaderboard.getEntries(getEntriesOptions)
        .then(function(entries) {
            entries.forEach(e => {
                console.log('ID: ' + e.id + ', name: ' + e.name + ', score: ' + e.score + ', rank: ' + e.rank + ', small photo: ' + e.photos[0])
            });
            callback(entries);
        })
        .catch(function (error) {
                   console.log(error);
        });
}

function isGameVisibleJs(callback){
    bridge.game.on(bridge.EVENT_NAME.VISIBILITY_STATE_CHANGED,
    function (state) {
                callback(state);
            });
}

function initBridgeJs(callback) {
    bridge.initialize()
        .then(function () {
                    bridge.platform.sdk;
                    showAdwJs();
                    window.game = bridge.platform;
                    let message = 'game_ready';
                    game.sendMessage(message);
                    window.storage = bridge.storage;
                    window.storageTypeLocal = bridge.STORAGE_TYPE.LOCAL_STORAGE;
                    window.storageTypePlatform = bridge.STORAGE_TYPE.PLATFORM_INTERNAL;
                    callback(window.game.language);
        });
}

function loadFromSdk(key, callback) {

    var resultPlatform;
    var resultLocal;
    var loadLevel;
    var name;
    var data;

    if (bridge.player.isAuthorized) {
        name = bridge.player.name;
        window.storage.get(key, window.storageTypePlatform)
            .then(function (dataPl) {
                if (dataPl === null || typeof dataPl === 'undefined') {
                    resultPlatform = '1 1000';
                } else {
                    resultPlatform = dataPl.toString();
                }
                window.storage.get(key, window.storageTypeLocal)
                    .then(function (dataLo) {
                        if (dataLo === null || typeof dataLo === 'undefined') {
                            resultLocal = '1 1000';
                        } else {
                            resultLocal = dataLo.toString();
                        }
                        var splitResPl = resultPlatform.split(' ');
                        var levelPl = splitResPl[0];
                        var splitResLoc = resultLocal.split(' ');
                        var levelLoc = splitResLoc[0];
                        if (levelPl >= levelLoc) {
                            loadLevel = levelPl;
                            data = resultPlatform;
                            window.storage.set(key, resultPlatform, window.storageTypeLocal);
                        } else {
                            loadLevel = levelLoc;
                            data = resultLocal;
                        }
                        window.level = loadLevel;
                        callback(data + ' ' + name);
                    });
            });
    } else {
        window.storage.get(key, window.storageTypeLocal)
            .then(function (data) {
                if (data === null || typeof data === 'undefined') {
                    resultLocal = '1 1000';
                } else {
                    resultLocal = data.toString();
                }
                window.level = resultLocal.split(' ')[0];
                callback(resultLocal);
            });
    }
}

function updateLeaderboardJs(scores, callback) {
       if (bridge.player.isAuthorized) {
        let getScoreOptions = {
            'yandex': {
                leaderboardName: 'scoresLeaderboard1',
            }
        }
        bridge.leaderboard.getScore(getScoreOptions)
            .then(function (getScores) {
                if (getScores < scores) {
                    let setScoreOptions = {
                        'yandex': {
                            leaderboardName: 'scoresLeaderboard1',
                            score: scores
                        }
                    }
                    bridge.leaderboard.setScore(setScoreOptions)
                        .then(function () {
                            console.log('Liderboard Update');
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                    callback('update scores ' + scores);
                }
            })
            .catch(function (error) {
                let setScoreOptions = {
                                        'yandex': {
                                            leaderboardName: 'scoresLeaderboard1',
                                            score: scores
                                        }
                                    }
                                    bridge.leaderboard.setScore(setScoreOptions)
                                        .then(function () {
                                            console.log('Liderboard Update');
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

function saveToSdk(key, value, callback) {
    var result = value;
    if (bridge.player.isAuthorized) {
        window.storage.set(key, value, window.storageTypePlatform);
    }
    window.storage.set(key, value, window.storageTypeLocal);
    callback(result);
}

function authorization(key, callback) {
    if (!bridge.player.isAuthorized) {
        let authorizationOptions = {
            'yandex': {
                scopes: true
            }
        }
        bridge.player.authorize(authorizationOptions)
            .then(function () {
                loadFromSdk(key, callback)
            })
            .catch(function (error) {
                console.log(error);
                callback('not authorized');
            });
    }
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