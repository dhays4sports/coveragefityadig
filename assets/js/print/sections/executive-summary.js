(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('../../print-sections.js'),
      require('../models/executive-summary-model.js'),
      require('../../protection-score.js')
    );
  } else {
    root.CoverageFitPrintSections = root.CoverageFitPrintSections || {};
    root.CoverageFitPrintSections['executive-summary'] = factory(
      root.CoverageFitPrintSectionRegistry,
      root.CoverageFitExecutiveSummaryModel,
      root.CoverageFitProtectionScore
    );
  }
})(typeof window !== 'undefined' ? window : globalThis, function (registry, executiveSummaryModel, protectionScore) {
  'use strict';

  if (!executiveSummaryModel || typeof executiveSummaryModel.create !== 'function') {
    throw new Error('CoverageFit Executive Summary Model is required.');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function scoreBand(value) {
    if (!Number.isFinite(value)) return { label: 'Not scored', className: 'unscored' };
    const band = protectionScore?.bandFor?.(value);
    return band ? { label: band.label, className: band.className } : { label: 'Review Recommended', className: 'review' };
  }

  function renderList(items, emptyMessage, className) {
    const values = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!values.length) return `<p class="cf-exec-empty">${escapeHtml(emptyMessage)}</p>`;
    return `<ol class="${className}">${values.map((item, index) => (
      `<li><span class="cf-exec-list-number">${index + 1}</span><span>${escapeHtml(item)}</span></li>`
    )).join('')}</ol>`;
  }

  function contactLine(model) {
    return [model?.contact?.phone, model?.contact?.email].filter(Boolean).map(escapeHtml).join(' · ');
  }

  function renderStrengths(items) {
    const values = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!values.length) return '';
    return `<div class="cf-exec-strengths" aria-label="Homeowner-reported strengths">${values.map(item => (
      `<span class="cf-exec-strength">${escapeHtml(item)}</span>`
    )).join('')}</div>`;
  }

  const section = Object.freeze({
    id: 'executive-summary',
    name: 'Consultation at a Glance',
    version: '1.4.0',
    order: 10,
    requiredPaths: Object.freeze([]),
    createModel(model) {
      return executiveSummaryModel.create(model);
    },
    shouldRender(model) {
      return executiveSummaryModel.hasContent(this.createModel(model));
    },
    emptyState: Object.freeze({ message: 'No consultation overview is available for this record.' }),
    render(model) {
      const sectionModel = this.createModel(model);
      const score = sectionModel.protectionScore.value;
      const band = scoreBand(score);
      const clientName = sectionModel.client.name || 'Homeowner';
      const preparedBy = sectionModel.consultation.preparedBy || 'Dylan Haysbert';
      const agency = sectionModel.consultation.agency || 'Virginia Tam Insurance Agency';
      const summary = sectionModel.summary || 'Use this guide to understand why the homeowner requested the review, what to discuss first, and what must be confirmed before recommendations are made.';

      const html = `<section class="cf-print-section cf-executive-summary" aria-labelledby="cf-exec-title">
  <header class="cf-exec-masthead">
    <div>
      <p class="cf-exec-eyebrow">Agent Guide</p>
      <h1 id="cf-exec-title">Consultation at a Glance</h1>
      <p class="cf-exec-client">Prepared for <strong>${escapeHtml(clientName)}</strong></p>
    </div>
    <div class="cf-exec-brand" aria-label="CoverageFit">CoverageFit<span>®</span></div>
  </header>

  <div class="cf-exec-context">
    <div><span>Home</span><strong>${escapeHtml(sectionModel.property.address || 'Address not provided')}</strong></div>
    <div><span>Why they requested the review</span><strong>${escapeHtml(sectionModel.reviewReason || 'General coverage review')}</strong></div>
    <div><span>Contact</span><strong>${contactLine(sectionModel) || 'Not provided'}</strong></div>
    <div><span>Prepared by</span><strong>${escapeHtml(preparedBy)}</strong><small>${escapeHtml(agency)}</small></div>
  </div>

  <div class="cf-exec-hero-grid">
    <article class="cf-exec-score-card cf-exec-score-${band.className}" aria-label="Protection Score">
      <p class="cf-exec-card-label">Protection Score</p>
      <div class="cf-exec-score-value"><strong>${Number.isFinite(score) ? escapeHtml(score) : '—'}</strong><span>${Number.isFinite(score) ? '/ 100' : ''}</span></div>
      <p class="cf-exec-score-band">${escapeHtml(sectionModel.protectionScore.status || band.label)}</p>
      <p class="cf-exec-score-note">A response-based measure of review readiness and clarity. It is not a coverage, underwriting, pricing, or eligibility decision.</p>
    </article>

    <article class="cf-exec-summary-card">
      <p class="cf-exec-card-label">Conversation purpose</p>
      <h2>What to accomplish on the call</h2>
      <p>${escapeHtml(summary)}</p>
      ${renderStrengths(sectionModel.strengths)}
    </article>
  </div>

  <div class="cf-exec-action-grid">
    <article class="cf-exec-panel cf-exec-priorities">
      <div class="cf-exec-panel-heading">
        <span>01</span><div><p>Discuss first</p><h2>Top conversation priorities</h2></div>
      </div>
      ${renderList(sectionModel.priorities, 'No priority topics were identified.', 'cf-exec-priority-list')}
    </article>

    <article class="cf-exec-panel cf-exec-next-steps">
      <div class="cf-exec-panel-heading">
        <span>02</span><div><p>Still needed</p><h2>Information to confirm</h2></div>
      </div>
      ${renderList(sectionModel.missingInformation, 'No major missing information was identified from the submitted review.', 'cf-exec-next-list')}
    </article>
  </div>

  <section class="cf-exec-next-action" aria-label="Recommended starting point">
    <span>Start here</span>
    <strong>${escapeHtml(sectionModel.nextSteps[0] || 'Review the priority topics, confirm current policy details, and document the agreed next step.')}</strong>
  </section>

  <footer class="cf-exec-footer-note">
    <span><strong>CoverageFit</strong> organizes a professional coverage conversation. Final coverage availability, terms, and pricing remain subject to carrier underwriting and policy documentation.</span>
    <strong class="cf-document-section">At a glance</strong>
  </footer>
</section>`;

      return Object.freeze({
        id: this.id,
        html,
        model: sectionModel,
        diagnostics: executiveSummaryModel.getDiagnostics(sectionModel)
      });
    }
  });

  if (registry && typeof registry.registerSection === 'function') {
    registry.registerSection(section.id, section, { replace: true });
  }

  return section;
});
