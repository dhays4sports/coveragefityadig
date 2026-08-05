(() => {
  'use strict';

  const config = window.COVERAGEFIT_CONFIG;
  const scoring = window.CoverageFitProtectionScore;
  if (!config) throw new Error('CoverageFit config is missing.');
  if (!scoring || typeof scoring.evaluate !== 'function') throw new Error('CoverageFit Protection Score methodology is missing.');

  const continuity = window.CoverageFitAssessmentContinuity || null;
  const consumerCopy = window.CoverageFitAssessmentConsumerCopy || null;
  const restoredDraft = continuity?.getDraft?.() || null;
  let current = 0;
  let selections = restoredDraft?.selections && typeof restoredDraft.selections === 'object'
    ? JSON.parse(JSON.stringify(restoredDraft.selections))
    : {};
  let earlyInsightShown = Boolean(restoredDraft?.earlyInsightShown);
  let restoredView = restoredDraft?.view || 'quiz';
  const restoredStartedAt = Number(restoredDraft?.startedAt || 0);
  const startedAt = Number.isFinite(restoredStartedAt) && restoredStartedAt > 0 ? restoredStartedAt : Date.now();
  const $ = id => document.getElementById(id);
  const qTitle = $('questionTitle');
  const qHelp = $('questionHelp');
  const answersEl = $('answers');
  const stepLabel = $('stepLabel');
  const bar = $('progressBar');
  const back = $('backBtn');
  const next = $('nextBtn');
  const quiz = $('quiz');
  const result = $('result');
  const restart = $('restartBtn');
  const remaining = $('timeRemaining');
  const kicker = $('questionKicker');
  const earlyInsight = $('earlyInsight');
  const earlyInsightTitle = $('earlyInsightTitle');
  const earlyInsightCopy = $('earlyInsightCopy');

  let propertyContext = $('propertyQuestionContext');
  if (!propertyContext) {
    propertyContext = document.createElement('div');
    propertyContext.id = 'propertyQuestionContext';
    propertyContext.className = 'property-question-context';
    propertyContext.hidden = true;
    qHelp.insertAdjacentElement('afterend', propertyContext);
  }

  let reviewReasonContext = $('reviewReasonQuestionContext');
  if (!reviewReasonContext) {
    reviewReasonContext = document.createElement('div');
    reviewReasonContext.id = 'reviewReasonQuestionContext';
    reviewReasonContext.className = 'review-reason-question-context';
    reviewReasonContext.hidden = true;
    propertyContext.insertAdjacentElement('afterend', reviewReasonContext);
  }

  let feedback = $('answerFeedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.id = 'answerFeedback';
    feedback.className = 'answer-feedback';
    answersEl.insertAdjacentElement('afterend', feedback);
  }

  const chapter = config.chapterLabels || {};
  const storageKey = config.storageKey || `coveragefit_${config.slug}_report`;
  const subject = config.subjectLabel || 'Protection';
  let profile = null;
  if (config.profileStorageKey) {
    try {
      profile = JSON.parse(sessionStorage.getItem(config.profileStorageKey) || localStorage.getItem(config.profileStorageKey) || 'null');
    } catch (_) {}
  }

  const activeReviewReason = () => {
    const personalization = window.CoverageFitPersonalization?.get?.() || window.CoverageFitAssessmentPrefill?.context || null;
    return personalization?.journey?.reviewReason
      || window.CoverageFitAssessmentPrefill?.reviewContext
      || window.CoverageFitTrigger
      || '';
  };

  const activeQuestions = () => {
    if (typeof config.resolveQuestions === 'function') {
      return config.resolveQuestions({ selections, profile: profile || {}, reviewReason: activeReviewReason() });
    }
    return config.questions.filter(question => !question.condition || question.condition(selections, profile || {}));
  };

  if (restoredDraft) {
    const questions = activeQuestions();
    const restoredIndex = questions.findIndex(question => question.key === restoredDraft.currentQuestionKey);
    current = restoredIndex >= 0
      ? restoredIndex
      : Math.max(0, Math.min(Number(restoredDraft.currentIndex || 0), Math.max(0, questions.length - 1)));
  }

  function pruneHidden() {
    const active = new Set(activeQuestions().map(question => question.key));
    Object.keys(selections).forEach(key => {
      if (!active.has(key)) delete selections[key];
    });
  }

  function saveDraft(reason = 'progress', extra = {}) {
    if (!continuity?.save) return null;
    const questions = activeQuestions();
    const question = questions[current] || null;
    return continuity.save({
      currentIndex: current,
      currentQuestionKey: question?.key || '',
      questionCount: questions.length,
      selections,
      earlyInsightShown,
      view: 'quiz',
      propertyConfirmed: document.body.classList.contains('property-confirmed'),
      startedAt,
      lastSaveReason: reason,
      ...extra
    });
  }

  function answerState(answer, question) {
    const impact = scoring.impactFor(answer, question);
    return {
      impact,
      findingType: scoring.findingTypeFor(answer, impact),
      positive: impact <= 0
    };
  }

  function feedbackFor(answer, question) {
    const state = answerState(answer, question);
    if (state.positive) return 'This gives your review a clear starting point.';
    if (state.findingType === scoring.FINDING_TYPES.IDENTIFIED_GAP) {
      return 'This is worth discussing with Dylan so you can understand the available options.';
    }
    if (state.findingType === scoring.FINDING_TYPES.UNCERTAINTY) {
      return 'No problem. CoverageFit will add this to the list of items to confirm in your policy.';
    }
    return 'This may be worth comparing with your current needs during the review.';
  }

  function evidenceStateFor(answer, question) {
    const state = answerState(answer, question);
    const quality = scoring.evidenceQualityFor?.(answer, question, state.findingType)
      || (answer ? 'confirmed' : 'missing');
    const labels = scoring.EVIDENCE_LABELS || {};
    return {
      quality,
      label: labels[quality] || (quality === 'confirmed' ? 'Clear response captured' : 'Needs policy verification')
    };
  }

  function renderAnswerFeedback(answer, question) {
    const state = answerState(answer, question);
    const evidence = evidenceStateFor(answer, question);
    const friendlyEvidence = {
      confirmed: 'Clear answer captured',
      partial: 'A little more detail may help',
      'needs-verification': 'Good item to confirm',
      missing: 'Choose the closest answer'
    }[evidence.quality] || 'Good item to confirm';
    feedback.dataset.evidenceQuality = evidence.quality;
    feedback.innerHTML = `<strong>${state.positive ? '✓ Good to know' : '→ Added to your review'}</strong><span>${feedbackFor(answer, question)}</span><small class="evidence-quality evidence-quality--${evidence.quality}">${friendlyEvidence}</small>`;
  }

  function showIncompleteFeedback(question) {
    feedback.dataset.evidenceQuality = 'missing';
    feedback.innerHTML = `<strong>Choose one answer to continue</strong><span>Select the option that best matches what you know today. “Not sure” is always okay.</span>`;
    window.CoverageFitAnalytics?.track('assessment_completion_blocked', {
      assessment: config.slug,
      question: question?.key || '',
      step: current + 1
    });
  }

  function updateJourney(stage) {
    const order = ['profile', 'industry', 'coverage', 'snapshot', 'contact'];
    const activeIndex = order.indexOf(stage);
    document.querySelectorAll('#businessJourney .journey-step').forEach(element => {
      const index = order.indexOf(element.dataset.stage);
      element.classList.toggle('is-active', index === activeIndex);
      element.classList.toggle('is-complete', index < activeIndex);
    });
  }

  function render() {
    pruneHidden();
    const questions = activeQuestions();
    if (current >= questions.length) current = Math.max(0, questions.length - 1);
    const question = questions[current];
    const progress = Math.round((current + 1) / questions.length * 100);
    const minutes = consumerCopy?.remainingMinutes?.(questions.length, current)
      || Math.max(1, Math.ceil((questions.length - current) * 0.42));
    const stage = question.section === 'coverage' ? 'coverage' : 'industry';
    updateJourney(stage);

    const visibleQuestion = consumerCopy?.question?.(question) || question;
    qTitle.textContent = visibleQuestion.title || question.title;
    qHelp.textContent = visibleQuestion.help || question.help;
    propertyContext.hidden = !question.propertyContext;
    propertyContext.textContent = question.propertyContext || '';
    propertyContext.dataset.propertyAware = question.propertyAware ? 'true' : 'false';
    reviewReasonContext.hidden = !question.reviewReasonContext;
    reviewReasonContext.textContent = question.reviewReasonContext || '';
    reviewReasonContext.dataset.reviewReason = question.reviewReasonKey || 'general';
    reviewReasonContext.dataset.reviewReasonAware = question.reviewReasonAware ? 'true' : 'false';
    stepLabel.textContent = `Question ${current + 1} of ${questions.length}`;
    remaining.textContent = minutes === 1 ? 'About 1 minute remaining' : `About ${minutes} minutes remaining`;
    kicker.textContent = chapter[question.category] || 'What this helps you understand';
    bar.style.width = `${progress}%`;
    answersEl.innerHTML = '';
    feedback.innerHTML = '';
    earlyInsight.hidden = !(current === 1 && earlyInsightShown);
    if (current === 1 && earlyInsightShown) showEarlyInsight(true);

    const oldIntro = document.getElementById('coverageSectionIntro');
    if (oldIntro) oldIntro.remove();
    if (stage === 'coverage' && (current === 0 || questions[current - 1]?.section !== 'coverage')) {
      const intro = document.createElement('div');
      intro.id = 'coverageSectionIntro';
      intro.className = 'coverage-section-intro';
      intro.innerHTML = '<span>Step 3 of 5</span><strong>Now let’s review your current coverage.</strong><p>These shared questions organize the policies, timing, and exposures that matter for the follow-up review.</p>';
      qTitle.parentElement.insertAdjacentElement('beforebegin', intro);
    }

    if (question.type === 'text' || question.type === 'date') {
      const wrap = document.createElement('div');
      wrap.className = 'answer-input-wrap';
      const input = document.createElement('input');
      input.className = 'answer-input';
      input.type = question.type;
      input.placeholder = question.placeholder || '';
      input.value = selections[question.key]?.value || '';
      input.setAttribute('aria-label', question.title);
      const note = document.createElement('span');
      note.className = 'answer-input-note';
      note.textContent = question.required === false
        ? 'Optional. You can continue without an exact date.'
        : 'This will be included in your private review summary.';
      wrap.append(input, note);
      answersEl.appendChild(wrap);

      const store = () => {
        const value = input.value.trim();
        if (value) {
          selections[question.key] = {
            questionKey: question.key,
            questionTitle: question.title,
            category: question.category,
            weight: question.weight || 0,
            label: value,
            value,
            points: 0,
            scoreImpact: 0,
            impactLevel: 'none',
            findingType: scoring.FINDING_TYPES.STRENGTH,
            tag: question.tag || question.title,
            insight: `${question.tag || question.title}: ${value}`,
            question: `Confirm ${String(question.tag || question.title).toLowerCase()} during the review.`
          };
        } else {
          delete selections[question.key];
        }
        next.disabled = question.required !== false && !value;
        saveDraft('answer_updated');
      };
      input.addEventListener('input', store);
      input.addEventListener('change', store);
      next.disabled = question.required !== false && !input.value.trim();
    } else {
      question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `answer ${selections[question.key]?.index === index ? 'selected' : ''}`;
        const visibleAnswer = consumerCopy?.answer?.(question, index, answer) || answer;
        button.innerHTML = `<div><strong>${visibleAnswer.label}</strong><span>${visibleAnswer.sub}</span></div><div class="circle"></div>`;
        button.onclick = () => {
          selections[question.key] = {
            ...answer,
            index,
            questionKey: question.key,
            questionTitle: question.title,
            category: question.category,
            weight: question.weight,
            section: question.section,
            propertyAware: Boolean(question.propertyAware),
            propertyContext: question.propertyContext || '',
            applicabilityReason: question.applicabilityReason || '',
            priorityBoost: Number(question.priorityBoost || 0),
            propertyPriorityBoost: Number(question.propertyPriorityBoost || 0),
            reviewReasonAware: Boolean(question.reviewReasonAware),
            reviewReasonKey: question.reviewReasonKey || 'general',
            reviewReasonLabel: question.reviewReasonLabel || '',
            reviewReasonContext: question.reviewReasonContext || '',
            reviewReasonApplicabilityReason: question.reviewReasonApplicabilityReason || '',
            reviewReasonPriorityBoost: Number(question.reviewReasonPriorityBoost || 0)
          };
          pruneHidden();
          saveDraft('answer_selected');
          window.CoverageFitAnalytics?.track('answer_selected', {
            assessment: config.slug,
            industry: profile?.industry || '',
            question: question.key,
            answer: answer.label,
            findingType: answerState(answer, question).findingType,
            reviewReason: question.reviewReasonKey || 'general',
            reviewReasonAware: Boolean(question.reviewReasonAware),
            step: current + 1
          });
          next.disabled = false;
          render();
          renderAnswerFeedback(answer, question);
          if (current === 1 && !earlyInsightShown) showEarlyInsight();
        };
        answersEl.appendChild(button);
      });

      if (selections[question.key]) {
        renderAnswerFeedback(selections[question.key], question);
      }
      next.disabled = !selections[question.key];
    }

    back.disabled = current === 0;
    next.textContent = current === questions.length - 1
      ? (config.finalButtonLabel || `Build My ${subject} Snapshot`)
      : 'Next Question';
  }

  function scoreEvaluation() {
    return scoring.evaluate({
      questions: activeQuestions(),
      selections,
      methodology: config.scoreMethodology
    });
  }

  function payload() {
    const evaluation = scoreEvaluation();
    const findingByKey = new Map(evaluation.findings.map(finding => [finding.key, finding]));
    const answerRows = Object.values(selections).map(answer => {
      const finding = findingByKey.get(answer.questionKey);
      return {
        key: answer.questionKey,
        title: answer.questionTitle,
        tag: answer.tag,
        category: answer.category,
        label: answer.label,
        value: answer.value || '',
        points: finding?.points ?? answer.points ?? 0,
        scoreImpact: finding?.scoreImpact ?? 0,
        impactLevel: finding?.impactLevel || answer.impactLevel || null,
        findingType: finding?.findingType || answer.findingType || scoring.FINDING_TYPES.STRENGTH,
        evidenceQuality: finding?.evidenceQuality || answer.evidenceQuality || 'confirmed',
        evidenceLabel: finding?.evidenceLabel || '',
        evidenceSufficient: finding?.evidenceSufficient !== false,
        evidenceBasis: finding?.evidenceBasis || '',
        evidencePrompt: finding?.evidencePrompt || '',
        answered: finding?.answered !== false,
        required: finding?.required !== false,
        weight: finding?.weight ?? answer.weight ?? 0,
        weightedPenalty: finding?.weightedPenalty ?? 0,
        priorityScore: finding?.priorityScore ?? 0,
        severityLabel: finding?.severityLabel || 'Confirmed starting point',
        propertyAware: Boolean(finding?.propertyAware || answer.propertyAware),
        propertyContext: finding?.propertyContext || answer.propertyContext || '',
        applicabilityReason: finding?.applicabilityReason || answer.applicabilityReason || '',
        priorityBoost: finding?.priorityBoost ?? answer.priorityBoost ?? 0,
        propertyPriorityBoost: finding?.propertyPriorityBoost ?? answer.propertyPriorityBoost ?? 0,
        reviewReasonAware: Boolean(finding?.reviewReasonAware || answer.reviewReasonAware),
        reviewReasonKey: finding?.reviewReasonKey || answer.reviewReasonKey || 'general',
        reviewReasonLabel: finding?.reviewReasonLabel || answer.reviewReasonLabel || '',
        reviewReasonContext: finding?.reviewReasonContext || answer.reviewReasonContext || '',
        reviewReasonApplicabilityReason: finding?.reviewReasonApplicabilityReason || answer.reviewReasonApplicabilityReason || '',
        reviewReasonPriorityBoost: finding?.reviewReasonPriorityBoost ?? answer.reviewReasonPriorityBoost ?? 0,
        insight: answer.insight,
        question: answer.question
      };
    });

    const prospect = window.CoverageFitAssessmentPrefill?.profile || null;
    const personalization = window.CoverageFitPersonalization?.get?.() || window.CoverageFitAssessmentPrefill?.context || null;
    const journey = personalization?.journey || {};
    const attribution = window.CoverageFitAttribution?.getPayload?.() || null;
    const integration = personalization
      ? {
          source: journey.source || '',
          campaign: journey.campaign || '',
          referralSource: journey.referralSource || '',
          entry: journey.entryPoint || '',
          assessment: journey.assessment || config.slug,
          sessionId: personalization.sessionId || '',
          prefilled: Boolean(personalization.flags?.hasProfile)
        }
      : (prospect?.integration
        ? { ...prospect.integration }
        : {
            source: attribution?.source || '',
            campaign: attribution?.campaign || '',
            entry: attribution?.entry || '',
            sessionId: attribution?.sessionId || '',
            prefilled: false
          });

    const priorityRows = evaluation.priorities.slice(0, 3).map(finding => ({
      name: finding.tag,
      tag: finding.tag,
      category: finding.category,
      insight: finding.insight,
      question: finding.question,
      points: finding.points,
      weight: finding.weight,
      weightedPenalty: finding.weightedPenalty,
      priorityScore: finding.priorityScore,
      scoreImpact: finding.scoreImpact,
      findingType: finding.findingType,
      severityLabel: finding.severityLabel,
      evidenceQuality: finding.evidenceQuality,
      evidenceLabel: finding.evidenceLabel,
      evidenceSufficient: finding.evidenceSufficient,
      evidenceBasis: finding.evidenceBasis,
      evidencePrompt: finding.evidencePrompt,
      answered: finding.answered,
      required: finding.required,
      propertyAware: Boolean(finding.propertyAware),
      propertyContext: finding.propertyContext || '',
      applicabilityReason: finding.applicabilityReason || '',
      priorityBoost: finding.priorityBoost || 0,
      propertyPriorityBoost: finding.propertyPriorityBoost || 0,
      reviewReasonAware: Boolean(finding.reviewReasonAware),
      reviewReasonKey: finding.reviewReasonKey || 'general',
      reviewReasonLabel: finding.reviewReasonLabel || '',
      reviewReasonContext: finding.reviewReasonContext || '',
      reviewReasonApplicabilityReason: finding.reviewReasonApplicabilityReason || '',
      reviewReasonPriorityBoost: finding.reviewReasonPriorityBoost || 0,
      priority: finding.findingType === scoring.FINDING_TYPES.IDENTIFIED_GAP ? 'high' : finding.findingType === scoring.FINDING_TYPES.UNCERTAINTY ? 'medium' : 'review'
    }));
    const strengthFindings = evaluation.strengths.slice(0, 3);

    return {
      version: config.slug === 'business' ? 'v2.9' : 'v2.4',
      assessment: config.slug,
      attribution,
      personalizationContext: personalization,
      propertyProfile: config.slug === 'home' ? (window.CoverageFitPropertyIntelligence?.load?.() || null) : null,
      industryModule: config.industryModule || profile?.module || profile?.industry || 'general',
      industryLabel: config.industryLabel || profile?.industryLabel || 'Business',
      profile,
      reviewContext: journey.reviewReason || window.CoverageFitAssessmentPrefill?.reviewContext || prospect?.reviewContext || '',
      prospectProfile: prospect,
      integration,
      trigger: window.CoverageFitTrigger || sessionStorage.getItem('coveragefit_trigger') || '',
      createdAt: new Date().toISOString(),
      score: evaluation.score,
      status: evaluation.status,
      rating: evaluation.status,
      scoreMethodology: evaluation.methodology,
      propertyPersonalization: config.slug === 'home' ? {
        ...(config.propertyPersonalization || {}),
        profileId: profile?.profileId || null,
        activeQuestionKeys: activeQuestions().filter(question => question.propertyAware).map(question => question.key),
        prioritizedQuestionKeys: activeQuestions().filter(question => Number(question.propertyPriorityBoost || 0) > 0).map(question => question.key),
        usedConfirmedPropertyData: activeQuestions().some(question => question.propertyAware)
      } : null,
      reviewReasonPersonalization: config.slug === 'home' ? {
        ...(config.reviewReasonPersonalization || {}),
        reviewReason: journey.reviewReason || window.CoverageFitAssessmentPrefill?.reviewContext || prospect?.reviewContext || '',
        reasonKey: config.reviewReasonKeyFor?.(activeReviewReason()) || 'general',
        label: config.reviewReasonRules?.[config.reviewReasonKeyFor?.(activeReviewReason()) || 'general']?.label || 'General review',
        summary: config.reviewReasonRules?.[config.reviewReasonKeyFor?.(activeReviewReason()) || 'general']?.summary || '',
        contextualQuestionKeys: activeQuestions().filter(question => question.reviewReasonAware).map(question => question.key),
        prioritizedQuestionKeys: activeQuestions().filter(question => Number(question.reviewReasonPriorityBoost || 0) > 0).map(question => question.key),
        scoreFormulaChanged: false
      } : null,
      assessmentCompletion: {
        ...(evaluation.completion || evaluation.evidence || {}),
        methodology: config.evidenceQualityMethodology || {
          id: 'coveragefit-assessment-evidence-quality-v1',
          version: '1.0.0',
          description: 'Classifies whether each recorded response is clear enough to carry into a licensed review without changing the Protection Score formula.'
        },
        activeQuestionKeys: evaluation.findings.map(finding => finding.key),
        unansweredQuestionKeys: evaluation.findings.filter(finding => !finding.answered && finding.required !== false).map(finding => finding.key)
      },
      scoreDiagnostics: {
        totalWeight: evaluation.methodology.totalWeight,
        weightedPenalty: evaluation.methodology.totalPenalty,
        identifiedGapCount: evaluation.priorities.filter(finding => finding.findingType === scoring.FINDING_TYPES.IDENTIFIED_GAP).length,
        uncertaintyCount: evaluation.priorities.filter(finding => finding.findingType === scoring.FINDING_TYPES.UNCERTAINTY).length,
        considerationCount: evaluation.priorities.filter(finding => finding.findingType === scoring.FINDING_TYPES.CONSIDERATION).length,
        activeQuestionCount: evaluation.findings.length,
        propertyAwareQuestionCount: evaluation.findings.filter(finding => finding.propertyAware).length,
        reviewReasonAwareQuestionCount: evaluation.findings.filter(finding => finding.reviewReasonAware).length,
        confirmedEvidenceCount: evaluation.completion?.confirmedCount || 0,
        partialEvidenceCount: evaluation.completion?.partialCount || 0,
        needsVerificationCount: evaluation.completion?.needsVerificationCount || 0,
        missingRequiredCount: evaluation.completion?.missingRequiredCount || 0,
        completionRate: evaluation.completion?.completionRate ?? 100,
        scoreIsFinal: evaluation.completion?.scoreIsFinal !== false
      },
      categories: evaluation.categories,
      answers: answerRows,
      industryResponses: Object.fromEntries(answerRows.map(answer => [answer.key, {
        question: answer.title,
        answer: answer.label,
        value: answer.value,
        category: answer.category,
        points: answer.points,
        scoreImpact: answer.scoreImpact,
        findingType: answer.findingType,
        evidenceQuality: answer.evidenceQuality,
        evidenceSufficient: answer.evidenceSufficient,
        weightedPenalty: answer.weightedPenalty,
        priorityScore: answer.priorityScore
      }])),
      strengths: strengthFindings.map(finding => finding.insight || finding.label),
      strengthFindings,
      priorities: priorityRows,
      strongest: strengthFindings[0]?.insight || 'Completing this review is a positive first step.',
      topPriority: priorityRows[0]?.insight || config.defaultPriority || 'Confirm your current protection details during a licensed review.'
    };
  }

  function save(report) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(report));
      sessionStorage.setItem(`${storageKey}_responses`, JSON.stringify(report.industryResponses || {}));
    } catch (_) {}
  }

  function renderEvidencePreview(completion) {
    const snapshotPreview = result.querySelector('.snapshot-preview');
    if (!snapshotPreview) return;
    let preview = $('evidenceQualityPreview');
    if (!preview) {
      preview = document.createElement('div');
      preview.id = 'evidenceQualityPreview';
      preview.className = 'evidence-quality-preview';
      snapshotPreview.insertAdjacentElement('afterend', preview);
    }
    const summary = completion || {};
    preview.dataset.state = summary.state || 'complete';
    preview.innerHTML = '';

    const heading = document.createElement('div');
    heading.className = 'evidence-quality-preview__heading';
    const eyebrow = document.createElement('span');
    eyebrow.textContent = 'Assessment evidence';
    const title = document.createElement('strong');
    title.textContent = summary.label || 'Evidence ready';
    heading.append(eyebrow, title);

    const metrics = document.createElement('div');
    metrics.className = 'evidence-quality-preview__metrics';
    [
      ['Clear responses', summary.confirmedCount || 0],
      ['Need confirmation', summary.followUpCount || 0],
      ['Still unanswered', summary.missingRequiredCount || 0]
    ].forEach(([label, value]) => {
      const item = document.createElement('div');
      const number = document.createElement('b');
      number.textContent = String(value);
      const copy = document.createElement('span');
      copy.textContent = label;
      item.append(number, copy);
      metrics.appendChild(item);
    });

    const message = document.createElement('p');
    message.textContent = summary.message || 'Your responses are ready to organize the licensed review.';
    preview.append(heading, metrics, message);
  }

  function finish() {
    const report = payload();
    updateJourney('snapshot');
    quiz.style.display = 'none';
    result.style.display = 'block';
    $('resultTitle').textContent = `Your ${subject} Snapshot is ready.`;
    $('resultCopy').textContent = report.priorities.length
      ? (config.resultCopy || 'Your responses revealed positive starting points and a few topics worth confirming with a licensed insurance professional.')
      : (config.strongResultCopy || 'Your responses suggest a strong starting point. A brief review can confirm that everything still fits today.');
    $('strongestPreview').textContent = report.strongest;
    $('priorityPreview').textContent = report.topPriority;
    renderEvidencePreview(report.assessmentCompletion);
    $('captureScore').value = report.score;
    $('captureRisks').value = report.priorities.map(item => item.tag).join(', ') || 'No major concerns flagged';
    $('capturePriority').value = report.topPriority;
    $('capturePayload').value = JSON.stringify(report);
    save(report);
    continuity?.markCompleted?.({
      answerCount: Object.keys(selections).length,
      questionCount: activeQuestions().length,
      durationSeconds: Math.round((Date.now() - startedAt) / 1000)
    });
    window.CoverageFitAnalytics?.track('assessment_completed', {
      assessment: config.slug,
      industry: report.industryModule,
      durationSeconds: Math.round((Date.now() - startedAt) / 1000),
      score: report.score,
      scoreMethodology: report.scoreMethodology?.id,
      identifiedGapCount: report.scoreDiagnostics?.identifiedGapCount,
      uncertaintyCount: report.scoreDiagnostics?.uncertaintyCount,
      confirmedEvidenceCount: report.assessmentCompletion?.confirmedCount,
      needsVerificationCount: report.assessmentCompletion?.needsVerificationCount,
      completionState: report.assessmentCompletion?.state
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showEarlyInsight(restoring = false) {
    const questions = activeQuestions();
    const first = selections[questions[0]?.key];
    const second = selections[questions[1]?.key];
    const uncertain = [first, second].filter((answer, index) => answer && answerState(answer, questions[index]).impact > 0).length;
    const insight = config.earlyInsight || {};
    earlyInsightTitle.textContent = uncertain
      ? (insight.concernTitle || 'You already have two useful items for your review.')
      : (insight.strongTitle || 'You have a useful starting foundation.');
    earlyInsightCopy.textContent = uncertain
      ? (insight.concernCopy || 'CoverageFit will keep these items organized so you know what to confirm later.')
      : (insight.strongCopy || 'CoverageFit will help you confirm what is strong and what is still worth asking about.');
    earlyInsight.hidden = false;
    earlyInsightShown = true;
    saveDraft(restoring ? 'early_insight_restored' : 'early_insight_shown', { view: 'quiz' });
    if (!restoring) {
      window.CoverageFitAnalytics?.track('assessment_early_insight_shown', {
        assessment: config.slug,
        concernCount: uncertain,
        step: current + 1,
        blocking: false
      });
    }
  }

  next.onclick = () => {
    const questions = activeQuestions();
    if (current === questions.length - 1) {
      const firstMissing = questions.findIndex(question => question.required !== false && !selections[question.key]);
      if (firstMissing >= 0) {
        current = firstMissing;
        render();
        showIncompleteFeedback(questions[firstMissing]);
        window.scrollTo({ top: document.querySelector('.tool-card')?.offsetTop || 0, behavior: 'smooth' });
        return;
      }
      bar.style.width = '100%';
      finish();
    } else {
      current += 1;
      render();
      saveDraft('question_advanced');
    }
  };

  back.onclick = () => {
    if (current) {
      current -= 1;
      render();
      saveDraft('question_revisited');
    }
  };

  restart.onclick = () => {
    continuity?.restart?.('retake_review');
    current = 0;
    selections = {};
    earlyInsightShown = false;
    earlyInsight.hidden = true;
    result.style.display = 'none';
    quiz.style.display = 'block';
    render();
  };

  $('captureForm').addEventListener('focusin', () => updateJourney('contact'));
  $('captureForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!this.checkValidity()) {
      this.reportValidity();
      return;
    }

    const questions = activeQuestions();
    const firstMissing = questions.findIndex(question => question.required !== false && !selections[question.key]);
    if (firstMissing >= 0) {
      current = firstMissing;
      result.style.display = 'none';
      quiz.style.display = 'block';
      render();
      showIncompleteFeedback(questions[firstMissing]);
      window.scrollTo({ top: document.querySelector('.tool-card')?.offsetTop || 0, behavior: 'smooth' });
      return;
    }

    updateJourney('contact');
    const report = payload();
    const detail = $('propertyField').value.trim() || 'Not provided';
    const enteredName = $('firstName').value.trim() || config.defaultName;
    const prospect = report.prospectProfile || {};
    const personalization = report.personalizationContext || {};
    const identity = personalization.identity || {};
    const property = personalization.property || {};
    const journey = personalization.journey || {};
    const nameParts = enteredName.split(/\s+/).filter(Boolean);
    const importedName = identity.displayName || prospect.fullName || '';
    const sameImportedName = Boolean(importedName && enteredName.toLowerCase() === String(importedName).toLowerCase());

    report.consumer = {
      firstName: sameImportedName ? (identity.givenName || prospect.firstName || nameParts[0] || '') : (nameParts[0] || ''),
      lastName: sameImportedName ? (identity.familyName || prospect.lastName || nameParts.slice(1).join(' ')) : nameParts.slice(1).join(' '),
      name: enteredName,
      email: $('email').value.trim(),
      phone: $('phone').value.trim(),
      detail,
      propertyAddress: property.displayAddress || prospect.propertyAddress || prospect.address?.formattedAddress || detail,
      reviewContext: report.reviewContext || journey.reviewReason || prospect.reviewContext || ''
    };
    report.integration = {
      ...(report.integration || {}),
      source: report.integration?.source || report.attribution?.source || '',
      campaign: report.integration?.campaign || report.attribution?.campaign || '',
      referralSource: report.integration?.referralSource || journey.referralSource || '',
      entry: report.integration?.entry || report.attribution?.entry || '',
      sessionId: report.integration?.sessionId || report.attribution?.sessionId || '',
      prefilled: Boolean((prospect && Object.keys(prospect).length) || personalization.flags?.hasProfile)
    };

    const businessName = $('businessName');
    const businessType = $('businessType');
    if (businessName) report.consumer.businessName = businessName.value.trim();
    if (businessType) report.consumer.businessType = businessType.value;
    if (report.profile) {
      report.consumer.industry = report.profile.industry;
      report.consumer.industryLabel = report.profile.industryLabel;
      report.consumer.businessSize = report.profile.businessSize;
      report.consumer.locationType = report.profile.locationType;
      report.consumer.employees = report.profile.employees;
      report.consumer.revenueRange = report.profile.revenueRange;
    }
    if (config.detailKey) report.consumer[config.detailKey] = detail;

    let prospectReportAccess = { ok: false };
    if (config.slug === 'home' && window.CoverageFitProspectReports) {
      prospectReportAccess = await window.CoverageFitProspectReports.create(report, { honeypot: $('website')?.value || '' });
      if (prospectReportAccess?.ok) {
        report.prospectReport = {
          id: prospectReportAccess.reportId,
          schemaVersion: window.CoverageFitProspectReports.SCHEMA_VERSION || '1.0',
          createdAt: prospectReportAccess.createdAt,
          expiresAt: prospectReportAccess.expiresAt,
          durable: Boolean(prospectReportAccess.durable),
          localOnly: Boolean(prospectReportAccess.localOnly)
        };
        window.CoverageFitProspectReports.cache?.(prospectReportAccess.reportId, report, report.prospectReport);
      }
    }

    let consultationRecord = null;
    if (config.slug === 'home' && window.CoverageFitConsultationRecords) {
      const records = window.CoverageFitConsultationRecords;
      const recordId = records.createId?.(report) || '';
      if (recordId) {
        report.consultationRecord = {
          id: recordId,
          schemaVersion: records.SCHEMA_VERSION || '1.0',
          status: 'ready',
          createdAt: report.createdAt
        };
        consultationRecord = records.upsert?.(report, { id: recordId }) || null;
        if (consultationRecord) {
          report.consultationRecord.createdAt = consultationRecord.createdAt;
          report.consultationRecord.updatedAt = consultationRecord.updatedAt;
        }
      }
    }

    const consultationField = $('consultationRecordId');
    if (consultationField) consultationField.value = consultationRecord?.id || report.consultationRecord?.id || '';
    const formPayload = JSON.parse(JSON.stringify(report));
    delete formPayload.prospectReport;
    $('capturePayload').value = JSON.stringify(formPayload);
    window.CoverageFitAttribution?.enrichForm?.(this);
    save(report);

    const remoteSubmission = config.slug === 'home' && window.CoverageFitRemoteConsultations
      ? window.CoverageFitRemoteConsultations.submit(report, { honeypot: $('website')?.value || '' })
      : Promise.resolve({ ok: false, skipped: true });
    await (window.COVERAGEFIT_PRODUCER_READY || Promise.resolve());
    const producer = window.COVERAGEFIT_PRODUCER || {};
    if (producer.formEndpoint) this.action = producer.formEndpoint;
    try {
      await fetch(this.action, { method: 'POST', body: new FormData(this), headers: { Accept: 'application/json' } });
    } catch (error) {
      console.warn(error);
    }
    try {
      await remoteSubmission;
    } catch (error) {
      console.warn(error);
    }
    await new Promise(resolve => setTimeout(resolve, 1750));
    const reportUrl = window.CoverageFitProspectReports?.buildUrl?.(report.prospectReport?.id, config.reportPath) || config.reportPath;
    location.href = reportUrl;
  });

  window.addEventListener('coveragefit:property-profile-confirmed', event => {
    profile = event.detail || null;
    pruneHidden();
    if (current >= activeQuestions().length) current = Math.max(0, activeQuestions().length - 1);
    render();
    saveDraft('property_profile_confirmed', {
      propertyConfirmed: true,
      propertyProfileId: profile?.profileId || ''
    });
    window.CoverageFitAnalytics?.track('assessment_property_personalized', {
      assessment: config.slug,
      activeQuestionCount: activeQuestions().length,
      propertyAwareQuestionCount: activeQuestions().filter(question => question.propertyAware).length
    });
  });

  window.addEventListener('beforeunload', () => {
    if (result.style.display !== 'block') saveDraft('page_unloaded');
  });

  window.CoverageFitAnalytics?.track('assessment_started', {
    assessment: config.slug,
    industry: profile?.industry || 'general',
    scoreMethodology: config.scoreMethodology?.id || scoring.METHODOLOGY_ID,
    restoredDraft: Boolean(restoredDraft)
  });
  render();
  if (restoredView === 'earlyInsight' && earlyInsightShown && current !== 1) {
    current = Math.min(1, Math.max(0, activeQuestions().length - 1));
    render();
  }
})();
