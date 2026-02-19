// Contact form functionality (usable without backend)
// - Validates required fields
// - Opens default mail app with subject/body pre-filled
// - Shows an inline success message as a friendly fallback

window.contactModule = (function() {
  let initialized = false;

  function encode(v) { return encodeURIComponent(v || ''); }

  function buildMailto(to, name, email, subject, message) {
    const parts = [];
    if (subject) parts.push('subject=' + encode(subject));
    const body =
`Name: ${name}
Email: ${email}

Message:
${message}`;
    parts.push('body=' + encode(body));
    const qs = parts.join('&');
    return `mailto:${to}${qs ? '?' + qs : ''}`;
  }

  function showStatus(form, text) {
    let box = form.querySelector('.tf-status');
    if (!box) {
      box = document.createElement('div');
      box.className = 'tf-status';
      form.appendChild(box);
    }
    box.textContent = text;
  }

  function markInvalid(el, msg) {
    el.classList.add('is-invalid');
    let help = el.nextElementSibling;
    if (!help || !help.classList || !help.classList.contains('tf-help')) {
      help = document.createElement('div');
      help.className = 'tf-help';
      el.insertAdjacentElement('afterend', help);
    }
    help.textContent = msg;
  }

  function clearInvalid(el) {
    el.classList.remove('is-invalid');
    const help = el.nextElementSibling;
    if (help && help.classList && help.classList.contains('tf-help')) {
      help.remove();
    }
  }

  function init() {
    if (initialized) return;

    const form = document.querySelector('.talk-form');
    if (!form) return;

    const nameEl = document.getElementById('tf-name');
    const emailEl = document.getElementById('tf-email');
    const subjectEl = document.getElementById('tf-subject');
    const messageEl = document.getElementById('tf-message');

    [nameEl, emailEl, subjectEl, messageEl].forEach(el => {
      if (!el) return;
      el.addEventListener('input', () => clearInvalid(el));
    });

    form.addEventListener('submit', function(e) {
      // If the form uses native mailto action we can still enhance it here
      e.preventDefault();

      const name = (nameEl && nameEl.value || '').trim();
      const email = (emailEl && emailEl.value || '').trim();
      const subject = (subjectEl && subjectEl.value || '').trim();
      const message = (messageEl && messageEl.value || '').trim();

      let hasError = false;
      if (!name) { markInvalid(nameEl, 'Please enter your name.'); hasError = true; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        markInvalid(emailEl, 'Please enter a valid email.');
        hasError = true;
      }
      if (!subject) { markInvalid(subjectEl, 'Please add a subject.'); hasError = true; }
      if (!message) { markInvalid(messageEl, 'Please add a short message.'); hasError = true; }

      if (hasError) return;

      // Derive recipient from form action (mailto:you@domain)
      let to = 'prakrittyagi.work@gmail.com';
      const action = (form.getAttribute('action') || '').trim();
      if (action.startsWith('mailto:')) {
        to = action.slice('mailto:'.length).split('?')[0];
      }

      const href = buildMailto(to, name, email, subject, message);

      // Try to open default mail client
      try {
        window.location.href = href;
      } catch(_) { /* no-op */ }

      showStatus(form, 'Your message is ready to send in your email app. If it didn\'t open, copy the details above.');
    });

    initialized = true;
  }

  // Self-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  return { init };
})();