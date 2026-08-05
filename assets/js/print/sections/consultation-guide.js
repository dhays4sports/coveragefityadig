(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../../print-sections.js'), require('../models/consultation-guide-model.js'));
  } else {
    root.CoverageFitPrintSections = root.CoverageFitPrintSections || {};
    root.CoverageFitPrintSections['consultation-guide'] = factory(root.CoverageFitPrintSectionRegistry, root.CoverageFitConsultationGuideModel);
  }
})(typeof window !== 'undefined' ? window : globalThis, function (registry, guideModel) {
  'use strict';
  if (!guideModel || typeof guideModel.create !== 'function') throw new Error('CoverageFit Consultation Guide Model is required.');

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
  function formatDate(value) {
    if (!value) return 'Not scheduled';
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return escapeHtml(value);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  }
  function renderWritingLines(count, label) {
    return `<div class="cf-guide-writing-lines" aria-label="${escapeHtml(label || 'Space for notes')}">${Array.from({ length: count || 3 }, () => '<span></span>').join('')}</div>`;
  }
  function renderConfirm(items) {
    const values = Array.isArray(items) ? items.filter(Boolean) : [];
    const normalized = values.length ? values : ['Current limits, deductibles, endorsements, exclusions, and homeowner preference.'];
    return `<ul class="cf-guide-check-list">${normalized.map(item => `<li><span class="cf-guide-check-box" aria-hidden="true"></span><span>${escapeHtml(item)}</span></li>`).join('')}</ul>`;
  }
  function renderHandoffList(items, emptyMessage, kind) {
    const values = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!values.length) return `<li class="cf-guide-evidence__empty">${escapeHtml(emptyMessage)}</li>`;
    return values.map(item => {
      const detail = kind === 'confirmed' ? (item.answer || item.statement) : (item.question || item.answer || item.statement);
      return `<li><strong>${escapeHtml(item.title)}</strong>${detail ? `<span>${escapeHtml(detail)}</span>` : ''}</li>`;
    }).join('');
  }
  function workingEvidenceLabel(topic) {
    const quality = String(topic?.evidenceQuality || '').toLowerCase();
    if (quality === 'confirmed' || quality === 'clear') return 'Homeowner answer';
    if (quality.includes('verification') || quality === 'partial') return 'Check policy';
    if (quality.includes('unresolved') || quality.includes('missing') || quality.includes('insufficient')) return 'Ask homeowner';
    return topic?.evidenceLabel ? String(topic.evidenceLabel) : 'Review item';
  }
  function renderEvidenceHandoff(handoff) {
    const source = handoff || {};
    const summary = source.summary || {};
    if (!source.available) {
      return `<section class="cf-guide-evidence cf-guide-evidence--legacy" aria-label="Before the conversation">
        <div class="cf-guide-evidence__heading"><span>Before the conversation</span><strong>Older review</strong></div>
        <p>This record predates the structured answer handoff. Review the saved answers manually before relying on them.</p>
      </section>`;
    }
    return `<section class="cf-guide-evidence" aria-labelledby="cf-guide-evidence-title">
      <div class="cf-guide-evidence__heading">
        <div><span>Before the conversation</span><h2 id="cf-guide-evidence-title">Use the homeowner’s answers to prepare the call</h2></div>
        <strong>${Number(summary.confirmed || 0)} homeowner answer${Number(summary.confirmed || 0) === 1 ? '' : 's'} · ${Number(summary.followUp || 0)} to follow up</strong>
      </div>
      <div class="cf-guide-evidence__grid">
        <section><h3>What they told us</h3><ul>${renderHandoffList(source.confirmedFacts, 'No confirmed homeowner answers were carried forward.', 'confirmed')}</ul></section>
        <section><h3>Check the policy</h3><ul>${renderHandoffList(source.verificationItems, 'No policy checks were identified.', 'verification')}</ul></section>
        <section><h3>Ask the homeowner</h3><ul>${renderHandoffList(source.unresolvedQuestions, 'No open homeowner questions were identified.', 'unresolved')}</ul></section>
      </div>
      <p class="cf-guide-evidence__guardrail">${escapeHtml(source.guardrail)}</p>
    </section>`;
  }

  function renderTopic(topic) {
    return `<article class="cf-guide-topic" data-topic-id="${escapeHtml(topic.id)}" data-evidence-quality="${escapeHtml(topic.evidenceQuality || 'confirmed')}">
      <header class="cf-guide-topic__header">
        <span class="cf-guide-topic__number">${String(topic.order).padStart(2, '0')}</span>
        <div>
          <p>${escapeHtml(topic.priority)}${topic.category ? ` · ${escapeHtml(topic.category)}` : ''}<em class="cf-guide-topic__evidence">${escapeHtml(workingEvidenceLabel(topic))}</em></p>
          <h2>${escapeHtml(topic.title)}</h2>
        </div>
      </header>

      <div class="cf-guide-topic__body">
        <section class="cf-guide-topic__known">
          <span>What we know</span>
          <p>${escapeHtml(topic.discovered)}</p>
        </section>

        <section class="cf-guide-topic__ask">
          <span>Ask</span>
          <p class="cf-guide-question">“${escapeHtml(topic.question)}”</p>
        </section>

        <div class="cf-guide-topic__supporting">
          <section>
            <span>What to explore</span>
            <p>${escapeHtml(topic.direction)}</p>
          </section>
          <section>
            <span>Check</span>
            ${renderConfirm(topic.confirm)}
          </section>
        </div>

        <section class="cf-guide-topic__notes">
          <span>Notes</span>
          ${renderWritingLines(3, `Notes for ${topic.title}`)}
        </section>
      </div>
    </article>`;
  }

  function renderDecisions(items) {
    const values = Array.isArray(items) ? items.filter(Boolean) : [];
    return `${values.length ? `<ul class="cf-guide-decision-list">${values.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}${renderWritingLines(values.length ? 2 : 4, 'Space for decisions and proposal plan')}`;
  }

  function renderMissing(items) {
    const values = Array.isArray(items) ? items.filter(Boolean) : [];
    return `${values.length ? `<ul class="cf-guide-check-list">${values.map(item => `<li><span class="cf-guide-check-box" aria-hidden="true"></span><span>${escapeHtml(item)}</span></li>`).join('')}</ul>` : '<p class="cf-guide-empty-note">No outstanding information was identified in the saved review.</p>'}${renderWritingLines(2, 'Space for additional information still needed')}`;
  }

  const section = Object.freeze({
    id: 'consultation-guide',
    name: 'Home Coverage Consultation Guide',
    version: '1.1.0',
    order: 30,
    requiredPaths: Object.freeze(['consultationContext', 'recommendations']),
    createModel(model) { return guideModel.create(model); },
    shouldRender(model) { return guideModel.hasContent(this.createModel(model)); },
    emptyState: Object.freeze({ message: 'No consultation guide is available.' }),
    render(model) {
      const m = this.createModel(model);
      const contact = [m.customer.phone, m.customer.email].filter(Boolean).join(' · ') || 'Contact not provided';
      const topics = m.topics.map(renderTopic).join('');
      const followUp = m.followUp.state === 'scheduled'
        ? `${formatDate(m.followUp.dueDate)}${m.followUp.note ? ` · ${escapeHtml(m.followUp.note)}` : ''}`
        : 'Not yet scheduled';

      const html = `<section class="cf-print-section cf-consultation-guide" aria-labelledby="cf-guide-title">
        <header class="cf-guide-header">
          <div>
            <p class="cf-guide-eyebrow">Agent Guide</p>
            <h1 id="cf-guide-title">Home Coverage Consultation Guide</h1>
            <p>${escapeHtml(m.customer.name)} · ${escapeHtml(m.propertyAddress || 'Property address not provided')}</p>
          </div>
          <div class="cf-guide-brand">CoverageFit<span>®</span><small>Call-ready guide</small></div>
        </header>

        <section class="cf-guide-context" aria-label="Review details">
          <div><span>Reason</span><strong>${escapeHtml(m.reviewReason)}</strong></div>
          <div><span>Contact</span><strong>${escapeHtml(contact)}</strong></div>
          <div><span>Stage</span><strong>${escapeHtml(m.stage)}</strong></div>
          <div><span>Follow-up</span><strong>${followUp}</strong></div>
        </section>

        ${renderEvidenceHandoff(m.evidenceHandoff)}

        <section class="cf-guide-discussion" aria-labelledby="cf-guide-discussion-title">
          <div class="cf-guide-section-heading">
            <span>During the conversation</span>
            <h2 id="cf-guide-discussion-title">Discussion topics</h2>
            <p>Use the suggested questions as a starting point. Confirm the policy and homeowner preference before recommending changes.</p>
          </div>
          <div class="cf-guide-topics">${topics || '<p class="cf-guide-empty">No discussion topics were captured. Use the decision fields below to document the consultation.</p>'}</div>
        </section>

        <section class="cf-guide-close" aria-labelledby="cf-guide-close-title">
          <div class="cf-guide-close__heading">
            <span>After the conversation</span>
            <h2 id="cf-guide-close-title">Decisions and next steps</h2>
          </div>

          <div class="cf-guide-close__grid">
            <section>
              <h3>Decisions and proposal plan</h3>
              ${renderDecisions(m.decisions)}
            </section>

            <section>
              <h3>Still needed</h3>
              ${renderMissing(m.missingInformation)}
            </section>

            <section class="cf-guide-next-action">
              <h3>Next action</h3>
              <p class="cf-guide-next-action__suggestion">${escapeHtml(m.nextAction || 'Document the agreed next step, owner, and follow-up date.')}</p>
              <div class="cf-guide-next-action__fields">
                <div><span>Owner</span><i></i></div>
                <div><span>Due date</span><i></i></div>
                <div><span>Follow-up method</span><i></i></div>
              </div>
              ${renderWritingLines(2, 'Space for next-action notes')}
            </section>
          </div>
        </section>

        <footer class="cf-guide-footer">
          <p><strong>Use:</strong> Guide the licensed consultation and document decisions. Confirm all coverage against the issued policy and carrier underwriting before presenting a recommendation.</p>
          <p>CoverageFit · Virginia Tam Insurance Agency · Confidential</p>
          <strong class="cf-document-section">Agent Guide</strong>
        </footer>
      </section>`;

      return Object.freeze({ id: this.id, html, model: m, diagnostics: guideModel.getDiagnostics(m) });
    }
  });

  if (registry && typeof registry.registerSection === 'function') registry.registerSection(section.id, section, { replace: true });
  return section;
});
