var player;

function initGame() {
  YaGames.init().then(_sdk => {
    window.ysdk = _sdk;
    console.log('Yandex SDK initialized');
    ysdk.features.LoadingAPI?.ready();
  })
  .catch(console.error);
}


function initPlayer() {
    return ysdk.getPlayer().then(_player => {
            player = _player;

            return player;
        });
}
function handleAuth() {
    initPlayer().then(_player => {
        if (_player.getMode() === 'lite') {
            ysdk.auth.openAuthDialog();
        }
    });
}