(() => {
  const root = document.querySelector('.tribute');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  function prepare() {
    observer?.disconnect();
    if (motion.matches) { root.classList.remove('motion-ready'); return; }
    const nodes = [...root.querySelectorAll('.pill,.hero-copy header,.hero-note,.chapter-link,.hero-art,.chapters a,.section > .eyebrow,.section h2,.section p,.timeline article,.moment,.stats > div,.media-preview,.celebrate,footer')]
      .filter(n => !n.parentElement?.closest('.timeline article,.moment,.media-preview,.real-quote') || n.classList.contains('media-preview'));
    root.classList.add('motion-ready');
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold: 0.08, rootMargin: '0px 0px -28px 0px'});
    nodes.forEach((n,i) => { n.classList.add('reveal'); n.style.setProperty('--reveal-delay', `${Math.min(i%3*45,90)}ms`); observer.observe(n); });
  }
  prepare();
  motion.addEventListener('change', prepare);
  const card=document.querySelector('.audio-toggle');
  const panel=document.querySelector('.vm-panel');
  const video=panel.querySelector('video');
  const closeBtn=panel.querySelector('.vm-close');
  const readyBtn=document.querySelector('.cry-ready');
  const cryCloseButtons=document.querySelectorAll('[data-cry-close]');
  const stopYouTube=()=>document.querySelectorAll('iframe').forEach(f=>f.contentWindow?.postMessage(JSON.stringify({event:'command',func:'pauseVideo',args:[]}),'https://www.youtube-nocookie.com'));
  let busy=false,anim;
  const dur=()=>motion.matches?0:520;
  function morph(from,to,opts){
    if(!opts.ms) return Promise.resolve();
    const fx=from.left-to.left+(from.width-to.width)/2, fy=from.top-to.top+(from.height-to.height)/2;
    const f=`translate(calc(-50% + ${fx}px), calc(-50% + ${fy}px)) scale(${from.width/to.width}, ${from.height/to.height})`;
    const c='translate(-50%,-50%) scale(1,1)';
    anim=panel.animate(opts.reverse?[{transform:c,borderRadius:'22px'},{transform:f,borderRadius:'24px'}]:[{transform:f,borderRadius:'24px'},{transform:c,borderRadius:'22px'}],{duration:opts.ms,easing:'cubic-bezier(.22,.8,.2,1)',fill:'both'});
    return anim.finished.catch(()=>{});
  }
  async function openVideo(){
    if(busy) return; busy=true;
    stopYouTube();
    const from=card.getBoundingClientRect();
    panel.hidden=false; panel.classList.add('on');
    document.body.classList.add('vm-open','vm-morphing');
    const to=panel.getBoundingClientRect();
    await morph(from,to,{ms:dur()});
    anim?.cancel();
    document.body.classList.remove('vm-morphing');
    closeBtn.focus({preventScroll:true});
    busy=false;
  }
  async function closeVideo(){
    if(busy||!panel.classList.contains('on')) return; busy=true;
    video.pause();
    const to=card.getBoundingClientRect();
    const from=panel.getBoundingClientRect();
    document.body.classList.add('vm-morphing');
    document.body.classList.remove('vm-open');
    card.style.visibility='hidden';
    await morph(to,from,{ms:dur(),reverse:true});
    anim?.cancel();
    panel.classList.remove('on'); panel.hidden=true;
    card.style.visibility='';
    document.body.classList.remove('vm-morphing');
    card.focus({preventScroll:true});
    busy=false;
  }
  function openPrompt(){if(busy)return;document.body.classList.add('cry-open');readyBtn.focus({preventScroll:true});}
  function closePrompt(){if(!document.body.classList.contains('cry-open'))return;document.body.classList.remove('cry-open');card.focus({preventScroll:true});}
  card.addEventListener('click',openPrompt);
  readyBtn.addEventListener('click',()=>{document.body.classList.remove('cry-open');openVideo();});
  cryCloseButtons.forEach(button=>button.addEventListener('click',closePrompt));
  closeBtn.addEventListener('click',closeVideo);
  document.querySelector('[data-vm-close]').addEventListener('click',closeVideo);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(document.body.classList.contains('cry-open'))closePrompt();else closeVideo();}});
  video.addEventListener('play',stopYouTube);
  document.querySelectorAll('.video-facade').forEach(button => button.addEventListener('click', () => {
    video.pause();
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${button.dataset.video}?enablejsapi=1&autoplay=1&playsinline=1&rel=0&start=${button.dataset.start||0}`;
    frame.title = button.getAttribute('aria-label').replace('Reproducir ', '');
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    button.replaceWith(frame);
  }));
  function burst() {
    if (motion.matches) return;
    document.querySelector('.confetti-burst')?.remove();
    const canvas=document.createElement('canvas'); canvas.className='confetti-burst'; canvas.setAttribute('aria-hidden','true');
    Object.assign(canvas.style,{position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'1000'});
    const width=innerWidth,height=innerHeight,ratio=Math.min(devicePixelRatio||1,2);
    canvas.width=width*ratio; canvas.height=height*ratio; document.body.append(canvas);
    const ctx=canvas.getContext('2d');ctx.scale(ratio,ratio);
    const colors=['#f5c46e','#f18c81','#8acac3','#c3adf7','#fff0d4'];
    const bits=Array.from({length:140},(_,i)=>({x:width/2,y:height*.6,vx:(Math.random()-.5)*19,vy:-8-Math.random()*15,size:4+Math.random()*7,angle:Math.random()*6.28,spin:(Math.random()-.5)*.22,color:colors[i%colors.length]}));
    let last=performance.now(),elapsed=0;
    function draw(now){
      const step=Math.min((now-last)/16.67,2);last=now;elapsed+=step;
      if(motion.matches||elapsed>240){canvas.remove();return;}
      ctx.clearRect(0,0,width,height);ctx.globalAlpha=Math.min(1,(240-elapsed)/50);
      bits.forEach(b=>{b.vx*=Math.pow(.988,step);b.vy+=.23*step;b.x+=b.vx*step;b.y+=b.vy*step;b.angle+=b.spin*step;ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.angle);ctx.fillStyle=b.color;ctx.fillRect(-b.size/2,-b.size/2,b.size,b.size*.55);ctx.restore();});
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
  const celebrate = document.querySelector('.celebrate');
  celebrate.addEventListener('click', () => {
    celebrate.setAttribute('aria-pressed','true');
    celebrate.textContent='¡Va por ti, José! ♥';
    burst();
  });
  let surprised=false;
  const surprise=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting)&&!surprised&&!motion.matches){surprised=true;burst();surprise.disconnect();}
  },{threshold:.12});
  surprise.observe(document.querySelector('.birthday'));
})();
