(() => {
  'use strict';

  const PROFILE_KEY = 'coveragefit_prospect_profile_v1';
  const clean = (value, max = 220) => String(value || '').trim().replace(/[<>\u0000-\u001F\u007F]/g, '').slice(0, max);
  const readJson = (storage, key) => {
    try { return JSON.parse(storage.getItem(key) || 'null'); } catch (_) { return null; }
  };
  const getProfile = () => window.CoverageFitPrefill?.get?.()
    || readJson(sessionStorage, PROFILE_KEY)
    || readJson(localStorage, PROFILE_KEY)
    || null;

  const apply = () => {
    const form = document.getElementById('captureForm');
    if (!form) return;

    const profile = getProfile();
    const personalizationContext = window.CoverageFitPersonalization?.get?.() || null;
    const hasProfile = personalizationContext ? Boolean(personalizationContext.flags?.hasProfile) : Boolean(profile);
    if (!hasProfile) {
      window.CoverageFitContactPrefill = { applied: false, fields: [], profile: null, context: personalizationContext };
      return;
    }

    const address = profile?.address || {};
    const values = {
      firstName: clean(personalizationContext?.identity?.displayName || profile?.fullName || [profile?.firstName, profile?.lastName].filter(Boolean).join(' '), 160),
      email: clean(personalizationContext?.contact?.email || profile?.email, 254).toLowerCase(),
      phone: clean(personalizationContext?.contact?.phone || profile?.phone, 40),
      propertyField: clean(personalizationContext?.property?.postalCode || address.postalCode, 20)
    };

    const appliedFields = [];
    Object.entries(values).forEach(([id, value]) => {
      if (!value) return;
      const field = document.getElementById(id);
      if (!field || field.value.trim()) return;
      field.value = value;
      field.dataset.prefilled = 'true';
      appliedFields.push(id);
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    });

    if (appliedFields.length) {
      const note = document.createElement('p');
      note.className = 'contact-prefill-note';
      note.id = 'contactPrefillNote';
      note.setAttribute('role', 'status');
      note.textContent = 'We carried over the information you already provided. Please confirm it is still correct.';
      form.insertBefore(note, form.firstChild);
    }

    window.CoverageFitContactPrefill = {
      applied: appliedFields.length > 0,
      fields: appliedFields.slice(),
      profile,
      context: personalizationContext
    };

    try {
      window.dispatchEvent(new CustomEvent('coveragefit:contact-prefill-ready', {
        detail: {
          applied: appliedFields.length > 0,
          fields: appliedFields.slice(),
          source: personalizationContext?.journey?.source || profile?.integration?.source || ''
        }
      }));
    } catch (_) {}
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true });
  else apply();
})();
