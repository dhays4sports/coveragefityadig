(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CoverageFitConsultationGuideModel = factory();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const VERSION = '1.0.0';
  const SCHEMA_VERSION = 1;
  const STAGE_LABELS = Object.freeze({
    review_received: 'Review received',
    contact_attempted: 'Contact attempted',
    consultation_scheduled: 'Consultation scheduled',
    consultation_completed: 'Consultation completed',
    proposal_prepared: 'Proposal prepared',
    decision_pending: 'Decision pending',
    closed: 'Closed'
  });
  const OUTCOME_LABELS = Object.freeze({
    none: '',
    policy_bound: 'Policy bound',
    current_carrier_retained: 'Stayed with current carrier',
    declined_price: 'Declined because of price',
    declined_coverage: 'Declined because of coverage',
    unable_to_reach: 'Unable to reach',
    not_eligible: 'Not eligible or not a fit',
    deferred: 'Deferred or future review'
  });

  function text(value, fallback) {
    if (value === 0) return '0';
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    return fallback || '';
  }
  function clone(value) {
    if (value == null) return value;
    try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; }
  }
  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(key => deepFreeze(value[key]));
    return Object.freeze(value);
  }
  function list(value) { return Array.isArray(value) ? value : []; }
  function unique(values, limit) {
    const seen = new Set();
    const result = [];
    list(values).forEach(value => {
      const normalized = text(value);
      if (!normalized || seen.has(normalized.toLowerCase())) return;
      seen.add(normalized.toLowerCase());
      result.push(normalized);
    });
    return typeof limit === 'number' ? result.slice(0, limit) : result;
  }
  function key(value) { return text(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  function related(item, recommendation) {
    const recommendationId = text(recommendation?.id);
    const ids = unique([...(item?.sourceIds || []), ...(item?.recommendationIds || []), item?.sourceItemId]);
    if (recommendationId && ids.includes(recommendationId)) return true;
    const left = key(item?.title);
    const right = key(recommendation?.title);
    return Boolean(left && right && (left === right || left.includes(right) || right.includes(left)));
  }
  function topicModel(recommendation, index, timelineItems, checklistItems) {
    const planItem = timelineItems.find(item => related(item, recommendation)) || {};
    const checklistItem = checklistItems.find(item => related(item, recommendation)) || {};
    const evidence = unique([
      ...list(recommendation?.evidence),
      ...list(planItem?.evidence),
      ...list(checklistItem?.evidence)
    ], 3);
    const confirm = unique([
      recommendation?.evidencePrompt,
      checklistItem?.evidencePrompt,
      planItem?.evidencePrompt,
      checklistItem?.description,
      checklistItem?.coachingNote,
      planItem?.coachingNote,
      ...evidence
    ], 3);
    return {
      id: text(recommendation?.id, `guide-topic-${index + 1}`),
      order: index + 1,
      title: text(recommendation?.title, text(planItem?.title, 'Coverage review topic')),
      priority: text(recommendation?.priority, text(checklistItem?.priority, 'Review')),
      category: text(recommendation?.category),
      discovered: text(recommendation?.explanation || recommendation?.summary, text(planItem?.objective, 'The submitted review identified this as a topic worth confirming.')),
      question: text(recommendation?.conversationStarter || recommendation?.question, text(planItem?.prompt || checklistItem?.prompt, 'How is this addressed by the current policy, and what would you prefer going forward?')),
      direction: text(recommendation?.producerNotes, text(planItem?.coachingNote || checklistItem?.coachingNote, 'Confirm the current limits, deductible, endorsements, exclusions, and customer preference before making a recommendation.')),
      evidenceQuality: text(recommendation?.evidenceQuality, text(planItem?.evidenceQuality || checklistItem?.evidenceQuality, 'confirmed')),
      evidenceLabel: text(recommendation?.evidenceLabel, text(planItem?.evidenceLabel || checklistItem?.evidenceLabel, 'Clear response captured')),
      evidencePrompt: text(recommendation?.evidencePrompt, text(planItem?.evidencePrompt || checklistItem?.evidencePrompt)),
      answerLabel: text(recommendation?.answerLabel, text(planItem?.answerLabel || checklistItem?.answerLabel)),
      confirm
    };
  }
  function fallbackTopics(timelineItems) {
    return timelineItems
      .filter(item => text(item?.type) === 'recommendation-topic')
      .slice(0, 3)
      .map((item, index) => topicModel({ id: item.id, title: item.title, summary: item.objective, question: item.prompt, producerNotes: item.coachingNote, sourceIds: item.sourceIds }, index, timelineItems, []));
  }
  function handoffItems(value, limit) {
    return list(value).map((item, index) => ({
      id: text(item?.id || item?.key, `handoff-${index + 1}`),
      key: text(item?.key),
      title: text(item?.title, 'Assessment response'),
      answer: text(item?.answer),
      statement: text(item?.statement, [text(item?.title), text(item?.answer)].filter(Boolean).join(': ')),
      question: text(item?.question),
      evidenceQuality: text(item?.evidenceQuality, 'confirmed'),
      evidenceLabel: text(item?.evidenceLabel),
      category: text(item?.category)
    })).slice(0, limit);
  }

  function evidenceHandoffModel(source, context) {
    const handoff = source?.evidenceHandoff || context?.evidenceHandoff || {};
    const summary = handoff.summary || {};
    return {
      available: Boolean(handoff.available),
      state: text(handoff.state, handoff.available ? 'ready' : 'legacy'),
      summary: {
        total: Number(summary.total || 0),
        confirmed: Number(summary.confirmed || 0),
        verification: Number(summary.verification || 0),
        unresolved: Number(summary.unresolved || 0),
        followUp: Number(summary.followUp || 0)
      },
      confirmedFacts: handoffItems(handoff.confirmedFacts, 4),
      verificationItems: handoffItems(handoff.verificationItems, 4),
      unresolvedQuestions: handoffItems(handoff.unresolvedQuestions, 4),
      guardrail: text(handoff.guardrail, 'Confirm homeowner-reported responses against the issued policy before making a recommendation.')
    };
  }

  function create(printModel) {
    const source = printModel && typeof printModel === 'object' ? printModel : {};
    const context = source.consultationContext || {};
    const evidenceHandoff = evidenceHandoffModel(source, context);
    const timelineItems = list(source.timeline?.items);
    const checklistItems = list(source.consultationChecklist?.items);
    const recommendations = list(source.recommendations);
    const topics = recommendations.length
      ? recommendations.slice(0, 3).map((item, index) => topicModel(item, index, timelineItems, checklistItems))
      : fallbackTopics(timelineItems);
    const decisions = unique([
      ...list(context.decisions),
      text(context.dispositionNote),
      OUTCOME_LABELS[text(context.outcome, 'none')] || ''
    ], 4);
    const followUp = context.followUp || {};
    return deepFreeze({
      schemaVersion: SCHEMA_VERSION,
      modelVersion: VERSION,
      customer: {
        name: text(source.customer?.name, 'Homeowner'),
        email: text(source.customer?.email),
        phone: text(source.customer?.phone)
      },
      propertyAddress: text(source.propertySummary?.address),
      reviewReason: text(context.reviewReason, 'General coverage review'),
      evidenceHandoff,
      stage: text(STAGE_LABELS[text(context.stage)], 'Review received'),
      outcome: text(OUTCOME_LABELS[text(context.outcome, 'none')]),
      followUp: {
        state: text(followUp.state, 'none'),
        dueDate: text(followUp.dueDate),
        note: text(followUp.note)
      },
      topics,
      decisions,
      nextAction: text(context.nextAction),
      missingInformation: unique(context.missingInformation, 5),
      source: {
        generatedAt: text(source.generatedAt),
        printEngineVersion: text(source.engineVersion),
        rawContext: clone(context)
      }
    });
  }
  function hasContent(model) { return Boolean(model && (model.topics?.length || model.evidenceHandoff?.available || model.customer?.name || model.reviewReason)); }
  function getDiagnostics(model) {
    const warnings = [];
    if (!model?.topics?.length) warnings.push('No consultation topics are available.');
    model?.topics?.forEach((topic, index) => {
      if (!topic.discovered) warnings.push(`Topic ${index + 1} has no discovery explanation.`);
      if (!topic.question) warnings.push(`Topic ${index + 1} has no conversation question.`);
    });
    return deepFreeze({ valid: hasContent(model), version: VERSION, schemaVersion: SCHEMA_VERSION, warnings, warningCount: warnings.length });
  }

  return Object.freeze({ VERSION, SCHEMA_VERSION, STAGE_LABELS, OUTCOME_LABELS, create, hasContent, getDiagnostics });
});
