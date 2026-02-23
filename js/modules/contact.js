// =========================================================
// CONTACT — EmailJS integration + validation
// Sends real emails without any backend
// =========================================================

window.contactModule = (function () {
  'use strict';

  var EMAILJS_PUBLIC_KEY = '66T3xfhc3V5yHMSkC';
  var EMAILJS_SERVICE_ID = 'service_f2qn8lj';
  var EMAILJS_TEMPLATE_ID = 'template_y28t6sb';

  var initialized = false;

  // ---- Init EmailJS ----
  function initEmailJS() {
    if (window.emailjs) {
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
    }
  }

  // ---- Validation helpers ----
  function markInvalid(el, msg) {
    if (!el) return;
    el.classList.add('is-invalid');
    var help = el.nextElementSibling;
    if (!help || !help.classList.contains('tf-help')) {
      help = document.createElement('div');
      help.className = 'tf-help';
      el.insertAdjacentElement('afterend', help);
    }
    help.textContent = msg;
  }

  function clearInvalid(el) {
    if (!el) return;
    el.classList.remove('is-invalid');
    var help = el.nextElementSibling;
    if (help && help.classList.contains('tf-help')) help.remove();
  }

  // ---- Status message ----
  function showStatus(form, text, type) {
    // type: 'success' | 'error' | 'sending'
    var box = form.querySelector('.tf-status');
    if (!box) {
      box = document.createElement('div');
      box.className = 'tf-status';
      form.appendChild(box);
    }
    box.className = 'tf-status tf-status--' + (type || 'info');
    box.textContent = text;
    box.style.display = 'block';

    // Auto-hide success after 8s
    if (type === 'success') {
      setTimeout(function () {
        box.style.opacity = '0';
        setTimeout(function () { box.style.display = 'none'; box.style.opacity = ''; }, 300);
      }, 8000);
    }
  }

  function clearStatus(form) {
    var box = form.querySelector('.tf-status');
    if (box) box.style.display = 'none';
  }

  // ---- Button states ----
  function setButtonLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.disabled = true;
      btn.dataset.originalText = btn.textContent;
      btn.innerHTML = '<span class="tf-spinner"></span> Sending…';
      btn.classList.add('is-sending');
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalText || 'Send Message →';
      btn.classList.remove('is-sending');
    }
  }

  // ---- Main init ----
  function init() {
    if (initialized) return;

    initEmailJS();

    var form = document.querySelector('.talk-form');
    if (!form) return;

    var nameEl = document.getElementById('tf-name');
    var emailEl = document.getElementById('tf-email');
    var subjectEl = document.getElementById('tf-subject');
    var messageEl = document.getElementById('tf-message');
    var submitBtn = form.querySelector('.tf-submit');

    // Clear validation on input
    [nameEl, emailEl, subjectEl, messageEl].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', function () { clearInvalid(el); clearStatus(form); });
    });

    // Submit handler
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = ((nameEl && nameEl.value) || '').trim();
      var email = ((emailEl && emailEl.value) || '').trim();
      var subject = ((subjectEl && subjectEl.value) || '').trim();
      var message = ((messageEl && messageEl.value) || '').trim();

      // Validate
      var hasError = false;
      if (!name) { markInvalid(nameEl, 'Please enter your name.'); hasError = true; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        markInvalid(emailEl, 'Please enter a valid email.'); hasError = true;
      }
      if (!subject) { markInvalid(subjectEl, 'Please add a subject.'); hasError = true; }
      if (!message) { markInvalid(messageEl, 'Please write a message.'); hasError = true; }
      if (hasError) return;

      // Check EmailJS loaded
      if (!window.emailjs) {
        showStatus(form, 'Email service failed to load. Please email me directly at prakrittyagi.work@gmail.com', 'error');
        return;
      }

      // Send via EmailJS
      setButtonLoading(submitBtn, true);
      showStatus(form, 'Sending your message…', 'sending');

      var templateParams = {
        from_name: name,
        from_email: email,
        subject: subject,
        message: message
      };

      window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function () {
          // Success
          setButtonLoading(submitBtn, false);
          showStatus(form, '✓ Message sent successfully! I\'ll get back to you soon.', 'success');

          // Reset form
          form.reset();
          [nameEl, emailEl, subjectEl, messageEl].forEach(function (el) {
            if (el) clearInvalid(el);
          });

          // Briefly change button text
          if (submitBtn) {
            submitBtn.textContent = '✓ Sent!';
            setTimeout(function () {
              submitBtn.textContent = 'Send Message →';
            }, 3000);
          }
        })
        .catch(function (err) {
          // Error
          setButtonLoading(submitBtn, false);
          console.error('EmailJS error:', err);
          console.error('EmailJS error status:', err && err.status);
          console.error('EmailJS error text:', err && err.text);

          var msg;
          var status = err && err.status;
          var text = (err && err.text) || '';

          if (status === 412) {
            // 412 can mean: rate limit, bad template vars, or account issue
            msg = 'Email service error (412): ' + (text || 'Check your EmailJS dashboard for details.') +
                  ' You can also email me directly at prakrittyagi.work@gmail.com';
          } else if (status === 400) {
            msg = 'Bad request — please check the form fields and try again.';
          } else if (status === 403) {
            msg = 'Service not authorized. Please email me directly at prakrittyagi.work@gmail.com';
          } else {
            msg = 'Something went wrong. Please try again or email me directly at prakrittyagi.work@gmail.com';
          }
          showStatus(form, msg, 'error');
        });
    });

    initialized = true;
  }

  // ---- Copyright year ----
  function updateCopyrightYear() {
    var el = document.getElementById('copyright-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  // ---- #contact hashchange ----
  function bindContactHash() {
    function scrollToContact() {
      var el = document.getElementById('contact');
      if (!el) return;
      if (window._smoothScroll) window._smoothScroll(el);
      else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    window.addEventListener('hashchange', function () {
      if (location.hash === '#contact') scrollToContact();
    });
    if (location.hash === '#contact') setTimeout(scrollToContact, 0);
  }

  // ---- Boot ----
  var origInit = init;
  init = function () {
    origInit();
    updateCopyrightYear();
    bindContactHash();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  return { init: init };
})();