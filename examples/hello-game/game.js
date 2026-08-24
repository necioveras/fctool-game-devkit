(async function(){
  const fctool = new FCToolGameSDK.FCToolGame({gameId:"hello-game",gameVersion:"1.0.0"});
  const $ = id => document.getElementById(id);
  let score = 0;

  try {
    const ctx = await fctool.initialize();
    $("config").textContent = "Configuração: " + JSON.stringify(ctx.configuration || {});
    fctool.ready();
    $("status").textContent = "Pronto.";
    $("start").disabled = false;

    $("start").onclick = () => {
      fctool.start();
      fctool.emit("attempt", {success:true, number:1});
      $("start").disabled = true;
      $("point").disabled = $("hint").disabled = $("complete").disabled = false;
      $("status").textContent = "Em execução.";
    };

    $("point").onclick = () => {
      score += 10;
      $("score").textContent = score;
      fctool.score(score, 100);
      fctool.emit("score_changed", {score});
    };

    $("hint").onclick = () => fctool.emit("hint_requested", {score});

    $("complete").onclick = () => {
      fctool.complete({score, result: score >= 50 ? "success" : "finished"});
      $("status").textContent = "Concluído.";
      $("point").disabled = $("hint").disabled = $("complete").disabled = true;
    };
  } catch(err) {
    $("status").textContent = "Erro: " + err.message;
  }
})();
