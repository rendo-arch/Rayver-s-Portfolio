  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    root.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
  });

  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  /* ---------- IMAGE EXTENSION AUTO-DETECT ---------- */
  // You don't need to worry about file extensions — drop a .jpg, .jpeg, .png,
  // or .webp file with the right base name (e.g. "profile-1") in /assets and
  // this will find it automatically.
  const IMG_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'PNG'];
  const resolvedCache = {};
  function resolveImageSrc(basePath, callback){
    if (resolvedCache[basePath] !== undefined) { callback(resolvedCache[basePath]); return; }
    let i = 0;
    (function tryNext(){
      if (i >= IMG_EXTS.length) { resolvedCache[basePath] = null; callback(null); return; }
      const url = basePath + '.' + IMG_EXTS[i];
      const probe = new Image();
      probe.onload = () => { resolvedCache[basePath] = url; callback(url); };
      probe.onerror = () => { i++; tryNext(); };
      probe.src = url;
    })();
  }

  /* ---------- AVATAR CROSSFADE ---------- */
  // Drop your photos in /assets named profile-1 and profile-2 (any common
  // image extension works). Add more base names here to cycle through more.
  const avatarBases = ['assets/profile-1', 'assets/profile-2'];
  (function initAvatar(){
    const wrap = document.getElementById('avatarWrap');
    const img = document.getElementById('avatarImg');
    const imgNext = document.getElementById('avatarImgNext');
    const fallback = document.getElementById('avatarFallback');
    if (!wrap || !img || !imgNext) return;
    let index = 0;
    let busy = false;
    let hasPhoto = false;

    resolveImageSrc(avatarBases[0], (url) => {
      if (!url) return; // keep fallback showing
      img.src = url;
      img.style.display = 'block';
      fallback.style.display = 'none';
      hasPhoto = true;
    });

    // Simple two-layer crossfade: load the next photo into the hidden
    // overlay, fade it in over the current one, then swap it into the
    // base layer and reset the overlay for next time. No intermediate
    // "in-between" frame is ever shown — just a clean fade.
    function crossfadeTo(nextUrl, done){
      imgNext.onload = () => {
        void imgNext.offsetWidth; // force reflow so the transition runs
        imgNext.style.opacity = '1';
        setTimeout(() => {
          img.src = nextUrl;
          imgNext.style.opacity = '0';
          done();
        }, 450);
      };
      imgNext.src = nextUrl;
    }

    wrap.addEventListener('click', () => {
      if (busy || !hasPhoto || avatarBases.length < 2) return;
      const nextIndex = (index + 1) % avatarBases.length;
      resolveImageSrc(avatarBases[nextIndex], (nextUrl) => {
        if (!nextUrl) return;
        busy = true;
        crossfadeTo(nextUrl, () => {
          index = nextIndex;
          busy = false;
        });
      });
    });
  })();

  /* ---------- CHAT WIDGET AVATAR ---------- */
  (function initChatAvatar(){
    const img = document.getElementById('chatAvatarImg');
    const fallback = document.querySelector('.chat-avatar-fallback');
    if (!img) return;
    resolveImageSrc(avatarBases[0], (url) => {
      if (!url) return;
      img.src = url;
      img.style.display = 'block';
      if (fallback) fallback.style.display = 'none';
    });
  })();

  /* ---------- OUTSIDE-THE-CODE PHOTO STACK ---------- */
  // Drop your photos in /assets named gallery-1, gallery-2, gallery-3, ...
  // (any common image extension works — this probes up to 6 base names, so
  // you can add more than 3 and they'll all get cycled through). Renders as
  // a stacked pile; click (or tap) it to shuffle to the next photo.
  const galleryBaseCandidates = [
    'assets/gallery-1', 'assets/gallery-2', 'assets/gallery-3',
    'assets/gallery-4', 'assets/gallery-5', 'assets/gallery-6'
  ];
  (function initStack(){
    const stack = document.getElementById('photoStack');
    const placeholder = document.getElementById('stackPlaceholder');
    const cards = [
      { el: document.getElementById('stackFront'), img: document.getElementById('stackImg'), role: 'front' },
      { el: document.getElementById('stackBack1'), img: document.getElementById('stackImgBack1'), role: 'back1' },
      { el: document.getElementById('stackBack2'), img: document.getElementById('stackImgBack2'), role: 'back2' }
    ];
    if (!stack || !cards[0].el) return;

    // Resolve every candidate (in order), keep only the ones that exist.
    const resolved = new Array(galleryBaseCandidates.length);
    let doneCount = 0;
    galleryBaseCandidates.forEach((base, i) => {
      resolveImageSrc(base, (url) => {
        resolved[i] = url;
        doneCount++;
        if (doneCount === galleryBaseCandidates.length) {
          setup(resolved.filter(Boolean));
        }
      });
    });

    function setup(photos){
      const total = photos.length;
      if (!total) return; // keep the placeholder showing

      // roleOrder[0] = index into `cards` currently playing "front",
      // roleOrder[1] = "back1", roleOrder[2] = "back2".
      let roleOrder = [0, 1, 2];
      const visible = Math.min(3, total);
      let cursor = 0;

      function paint(){
        for (let i = 0; i < 3; i++) {
          const card = cards[roleOrder[i]];
          if (i < visible) {
            card.el.style.display = '';
            card.img.src = photos[(cursor + i) % total];
            card.img.style.display = 'block';
          } else {
            card.el.style.display = 'none';
          }
        }
        if (placeholder) placeholder.style.display = 'none';
      }
      paint();

      if (total < 2) return; // nothing to shuffle to

      stack.classList.add('interactive');
      stack.setAttribute('role', 'button');
      stack.setAttribute('tabindex', '0');
      stack.setAttribute('aria-label', 'Show next photo');
      stack.title = 'Click for next photo';

      let busy = false;
      function shuffle(){
        if (busy || visible < 2) return;
        busy = true;

        const outgoing = cards[roleOrder[0]];
        outgoing.el.classList.add('exiting');
        cards[roleOrder[1]].el.classList.add('advancing');
        cards[roleOrder[2]].el.classList.add('advancing-2');

        setTimeout(() => {
          cursor = (cursor + 1) % total;
          const newRoleOrder = [roleOrder[1], roleOrder[2], roleOrder[0]];
          const roleNames = ['front', 'back1', 'back2'];
          const modifiers = ['exiting', 'advancing', 'advancing-2'];

          // Relabel each card to its new role, invisibly (no-transition),
          // then repaint content for the new cursor position.
          newRoleOrder.forEach((cardIdx, i) => {
            const el = cards[cardIdx].el;
            el.classList.add('no-transition');
            roleNames.forEach((r) => el.classList.remove(r));
            modifiers.forEach((m) => el.classList.remove(m));
            el.classList.add(roleNames[i]);
          });

          roleOrder = newRoleOrder;
          paint();

          void stack.offsetWidth; // force reflow so the snap applies first
          newRoleOrder.forEach((cardIdx) => cards[cardIdx].el.classList.remove('no-transition'));

          busy = false;
        }, 380);
      }

      stack.addEventListener('click', shuffle);
      stack.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); shuffle(); }
      });
    }
  })();

  /* ---------- VISITOR COUNTER ---------- */
  // Real, account-based visitor tracking now lives in js/visitors.js
  // (Firebase Auth + Firestore) — this old countapi hit-counter is retired.

  /* ---------- CHAT WITH RAYVER (rule-based auto-reply) ---------- */
  (function initChat(){
    const toggle = document.getElementById('chatToggle');
    const panel = document.getElementById('chatPanel');
    const closeBtn = document.getElementById('chatClose');
    const messages = document.getElementById('chatMessages');
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSend');
    if (!toggle || !panel) return;

    let greeted = false;

    function addBubble(text, from){
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble ' + from;
      bubble.textContent = text;
      messages.appendChild(bubble);
      messages.scrollTop = messages.scrollHeight;
    }

    function showTyping(){
      const typing = document.createElement('div');
      typing.className = 'chat-typing';
      typing.id = 'chatTyping';
      typing.innerHTML = '<span></span><span></span><span></span>';
      messages.appendChild(typing);
      messages.scrollTop = messages.scrollHeight;
    }
    function hideTyping(){
      const typing = document.getElementById('chatTyping');
      if (typing) typing.remove();
    }

    function getAutoReply(raw){
      const m = raw.toLowerCase();
      if (/\b(hi|hello|hey|yo)\b/.test(m)) return "Hey! Thanks for stopping by 👋 What's up?";
      if (/project|portfolio|work on|gymtayo|bugtong|clothing/.test(m)) return "I've got GymTayo, BugtongQuest, and Code Clothing up right now — check the Projects section above, or ask me about any one of them.";
      if (/stack|tech|technolog|tools|framework|language/.test(m)) return "Mainly React, Tailwind, PHP, MySQL, and Supabase — plus Java from coursework. I also use AI coding agents to speed things up.";
      if (/hire|available|freelance|rate|price|budget|cost/.test(m)) return "I'm open for freelance work! Best way in is the contact section below, or just email me directly.";
      if (/gym|hobby|hobbies|church|faith|outside/.test(m)) return "Outside of code you'll usually find me at the gym, or with my church community 🙂 — check the Outside the Code section.";
      if (/contact|email|reach|touch/.test(m)) return "You can email me directly at colinajohnrayver0419@gmail.com — I'll get back to you as soon as I can.";
      if (/who are you|your name|are you (rayver|human|real|ai|bot)/.test(m)) return "I'm Rayver's auto-reply here on the site — he's not typing live right now, but your message gets seen. For a real conversation, email works best.";
      if (/thank/.test(m)) return "Anytime! 🙌";
      return "Thanks for the message! This is an auto-reply for now — for a real conversation, email colinajohnrayver0419@gmail.com and Rayver will get back to you.";
    }

    function openChat(){
      panel.classList.add('open');
      if (!greeted) {
        greeted = true;
        setTimeout(() => addBubble("Hey! I'm Rayver's site assistant — ask me about his projects, stack, or how to get in touch. (He'll see your message too!)", 'bot'), 200);
      }
      setTimeout(() => input && input.focus(), 250);
    }
    function closeChat(){ panel.classList.remove('open'); }

    toggle.addEventListener('click', () => {
      panel.classList.contains('open') ? closeChat() : openChat();
    });
    closeBtn.addEventListener('click', closeChat);

    function sendMessage(){
      const text = input.value.trim();
      if (!text) return;
      addBubble(text, 'user');
      input.value = '';
      showTyping();
      const delay = 500 + Math.random() * 500;
      setTimeout(() => {
        hideTyping();
        addBubble(getAutoReply(text), 'bot');
      }, delay);
    }
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  })();
