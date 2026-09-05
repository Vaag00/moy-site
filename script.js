/* ---------- Задание 4: слайдер-многогранник ---------- */
(function(){
  const total = 4;
  let index = 0;
  const shots = document.getElementById('prismShots');
  const copy  = document.getElementById('prismCopy');
  const dots  = document.getElementById('dots');

  for(let i=0;i<total;i++){
    const d = document.createElement('button');
    d.className = 'dot';
    d.setAttribute('aria-label','Съёмка ' + (i+1));
    d.addEventListener('click', ()=>{ index = i; render(); restart(); });
    dots.appendChild(d);
  }

  function render(){
    shots.style.transform = 'rotateX(' + (-90*index) + 'deg)';
    copy.style.transform  = 'rotateY(' + ( 90*index) + 'deg)';
    [...dots.children].forEach((d,i)=> d.classList.toggle('active', i===index));
  }
  function go(step){ index = (index+step+total)%total; render(); restart(); }

  document.getElementById('next').addEventListener('click', ()=>go(1));
  document.getElementById('prev').addEventListener('click', ()=>go(-1));
  document.addEventListener('keydown', e=>{
    if(e.key === 'ArrowRight') go(1);
    if(e.key === 'ArrowLeft')  go(-1);
  });

  let timer = setInterval(()=>go(1), 6000);
  function restart(){ clearInterval(timer); timer = setInterval(()=>go(1), 6000); }
  render();
})();

/* ---------- Задание 2: карта и форма ---------- */
(function(){
  const bank = document.getElementById('bank');
  const bNum = document.getElementById('bNum');
  const bHolder = document.getElementById('bHolder');
  const bExp = document.getElementById('bExp');
  const bCvc = document.getElementById('bCvc');

  function renderNumber(raw){
    const digits = raw.padEnd(16,'•').slice(0,16);
    bNum.innerHTML = '';
    digits.match(/.{1,4}/g).forEach(g=>{
      const s = document.createElement('span');
      s.textContent = g;
      bNum.appendChild(s);
    });
    if(raw.length){
      const i = Math.min(Math.floor((raw.length-1)/4), 3);
      bNum.children[i].classList.add('pulse');
      setTimeout(()=>[...bNum.children].forEach(s=>s.classList.remove('pulse')), 260);
    }
  }
  renderNumber('');

  document.getElementById('fNum').addEventListener('input', e=>{
    const raw = e.target.value.replace(/\D/g,'').slice(0,16);
    e.target.value = raw.replace(/(.{4})/g,'$1 ').trim();
    renderNumber(raw);
  });

  document.getElementById('fHolder').addEventListener('input', e=>{
    bHolder.textContent = e.target.value || 'имя фамилия';
  });

  document.getElementById('fExp').addEventListener('input', e=>{
    let raw = e.target.value.replace(/\D/g,'').slice(0,4);
    if(raw.length >= 3) raw = raw.slice(0,2) + '/' + raw.slice(2);
    e.target.value = raw;
    bExp.textContent = raw || 'ММ/ГГ';
  });

  const cvc = document.getElementById('fCvc');
  cvc.addEventListener('focus', ()=> bank.classList.add('flipped'));
  cvc.addEventListener('blur',  ()=> bank.classList.remove('flipped'));
  cvc.addEventListener('input', e=>{
    e.target.value = e.target.value.replace(/\D/g,'').slice(0,3);
    bCvc.textContent = e.target.value.padEnd(3,'•');
  });

  const btn = document.getElementById('payBtn');
  btn.addEventListener('click', e=>{
    const size = Math.max(btn.offsetWidth, btn.offsetHeight);
    const rect = btn.getBoundingClientRect();
    const r = document.createElement('span');
    r.className = 'ripple';
    r.style.width = r.style.height = size + 'px';
    r.style.left = (e.clientX - rect.left - size/2) + 'px';
    r.style.top  = (e.clientY - rect.top  - size/2) + 'px';
    btn.appendChild(r);
    setTimeout(()=>r.remove(), 600);
  });

  document.getElementById('payForm').addEventListener('submit', e=>{
    e.preventDefault();
    document.getElementById('done').textContent = 'Сертификат оформлен, письмо ушло на почту';
  });
})();

/* ---------- Практическая 4, задание 1: оплата через CloudPayments ---------- */
(function(){
  /* Тестовый ключ CloudPayments — деньги не списываются.
     Свой publicId берётся в личном кабинете: Сайты → нужный сайт. */
  var PUBLIC_ID = 'test_api_00000000000000000000002';

  var pick   = document.getElementById('pick');
  var total  = document.getElementById('cpTotal');
  var btn    = document.getElementById('cpPay');
  var result = document.getElementById('cpResult');
  var mail   = document.getElementById('cpEmail');
  var name   = document.getElementById('cpName');
  if(!pick) return;

  function selected(){ return pick.querySelector('input[name="svc"]:checked'); }
  function money(n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'; }

  function refresh(){ total.textContent = money(selected().value); result.textContent = ''; }
  pick.addEventListener('change', refresh);
  refresh();

  btn.addEventListener('click', function(){
    var opt = selected();
    var amount = Number(opt.value);
    var email = mail.value.trim();

    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){
      result.textContent = 'Укажите почту — на неё придёт чек';
      mail.focus();
      return;
    }
    if(typeof cp === 'undefined'){
      result.textContent = 'Виджет оплаты не загрузился, проверьте интернет';
      return;
    }

    var widget = new cp.CloudPayments({ language:'ru-RU', yandexPaySupport:true, sbpSupport:true });

    btn.disabled = true;
    result.textContent = 'Открываю окно оплаты…';

    widget.pay('charge', {
      publicId:    PUBLIC_ID,
      description: opt.dataset.title + ' — vaag.ph',
      amount:      amount,
      currency:    'RUB',
      invoiceId:   'VAAG-' + Date.now(),
      accountId:   email,
      email:       email,
      skin:        'mini',
      requireEmail:true,
      data:        { name: name.value.trim() || 'не указано', service: opt.dataset.title }
    })
    .then(function(){
      result.textContent = 'Оплата прошла. Напишу вам на ' + email + ' в течение дня.';
    })
    .catch(function(){
      result.textContent = 'Оплата не завершена. Попробуйте ещё раз или напишите мне в форме ниже.';
    })
    .finally(function(){ btn.disabled = false; });
  });
})();
