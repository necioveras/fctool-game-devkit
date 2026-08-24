(async function () {
  const status = document.getElementById("status");
  const start = document.getElementById("start");
  const finish = document.getElementById("finish");

  const fctool = new FCToolGameSDK.FCToolGame({
    gameId: "meu-jogo",
    gameVersion: "1.0.0"
  });

  try {
    const context = await fctool.initialize();
    status.textContent = `Configuração recebida: ${JSON.stringify(context.configuration || {})}`;
    fctool.ready();
    start.disabled = false;

    start.addEventListener("click", () => {
      fctool.start();
      fctool.emit("attempt", { success: true });
      fctool.score(10, 10);
      finish.disabled = false;
    });

    finish.addEventListener("click", () => {
      fctool.complete({ score: 10, result: "success" });
      status.textContent = "Jogo finalizado.";
      finish.disabled = true;
    });
  } catch (err) {
    status.textContent = err.message;
  }
})();
