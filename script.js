document.addEventListener('DOMContentLoaded', () => {
  const attacks = document.querySelectorAll('.attack');
  const enemyEl = document.getElementById('enemy');
  const enemyHpEl = document.getElementById('enemy-hp');
  const playerHpEl = document.getElementById('player-hp');
  const modals = document.querySelectorAll('.modal');

  let enemyHP = 250;
  let playerHP = 100;

  const damageMap = {
    project1: 40,
    project2: 90,
    project3: -30 // heal
  };

  function openModal(id){
    const m = document.getElementById(id);
    if(m) m.classList.add('active');
  }

  function closeModal(el){
    el.classList.remove('active');
  }

  attacks.forEach(btn => {
    btn.addEventListener('click', () => {
      const proj = btn.dataset.project;
      const dmg = damageMap[proj] ?? 0;

      // Play simple animation
      enemyEl.classList.add('shake');
      setTimeout(()=> enemyEl.classList.remove('shake'), 350);

      // Apply damage or heal
      if(dmg >= 0){
        enemyHP = Math.max(0, enemyHP - dmg);
        enemyHpEl.textContent = enemyHP;
      } else {
        playerHP = Math.min(100, playerHP - dmg * -1 * -1); // heal logic: dmg is negative
        playerHP = Math.min(100, playerHP + Math.abs(dmg));
        playerHpEl.textContent = playerHP;
      }

      // After short delay open the project modal
      setTimeout(()=> openModal(proj), 420);
    });
  });

  // close buttons and clicking outside
  modals.forEach(m => {
    m.addEventListener('click', (e) => {
      if(e.target === m) closeModal(m);
    });
    const closeBtn = m.querySelector('.close');
    if(closeBtn) closeBtn.addEventListener('click', ()=> closeModal(m));
  });

  // optional Inspect button
  const run = document.getElementById('run');
  if(run) run.addEventListener('click', ()=>{
    openModal('project1');
  });
});
