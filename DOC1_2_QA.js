#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');

const root = __dirname;
const checks = [];
const check = (name, pass) => { assert(pass, name); checks.push(name); };
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = rel => fs.existsSync(path.join(root, rel));
const hash = rel => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, rel))).digest('hex');

const version = read('VERSION').trim();
const pkg = JSON.parse(read('package.json'));
const route = read('agent/consultation/index.html');
const controller = read('assets/js/consultation-document.js');
const renderer = read('assets/js/print-renderers.js');
const executiveSource = read('assets/js/print/sections/executive-summary.js');
const propertySource = read('assets/js/print/sections/property-summary.js');
const guideSource = read('assets/js/print/sections/consultation-guide.js');

check('release version is DOC-1.2', version === '3.20.12' && pkg.version === version);
check('package describes call-ready Consultation Guide', /call-ready Consultation Guide/i.test(pkg.description));
check('DOC-1.2 implementation documentation exists', exists('CALL-READY-CONSULTATION-GUIDE.md') && exists('SPRINT-DOC-1.2.md'));
check('DOC-1.2 print certification exists', exists('DOC1_2_PRINT_CERTIFICATION.md'));
check('roadmap marks DOC-1.2 complete', read('ROADMAP.md').includes('DOC-1.2 Call-Ready Consultation Guide — Complete (3.20.12)'));
check('changelog contains DOC-1.2 release', read('CHANGELOG.md').includes('## 3.20.12 — DOC-1.2 Call-Ready Consultation Guide'));

check('route uses Agent Guide title', route.includes('<title>Agent Guide | CoverageFit</title>') && route.includes('Call-Ready Consultation Guide'));
check('route preview has call-ready accessible title', route.includes('title="CoverageFit call-ready consultation guide preview"'));
check('controller advances presentation version', controller.includes("const VERSION = '1.2.0'"));
check('controller enables paged-media page counters', controller.includes('includePageNumbers: true'));
check('controller uses Agent Guide report label', controller.includes("documentLabel: 'Agent Guide'"));
check('controller uses Home Coverage Consultation Guide title', controller.includes("title: 'Home Coverage Consultation Guide'"));

check('executive heading is simplified', executiveSource.includes('Consultation at a Glance'));
check('executive summary emphasizes why and what to discuss', executiveSource.includes('Why they requested the review') && executiveSource.includes('Top conversation priorities'));
check('executive page no longer claims Page 1 of 3', !executiveSource.includes('Page 1 of 3'));

check('property heading is simplified', propertySource.includes('Home and Policy Details'));
check('property arrays filter unavailable values', propertySource.includes("filter(([,value]) => present(value))"));
check('property output has address-only truthful state', propertySource.includes('Only the property address was provided.'));
check('property output omits repeated Not available placeholders', !propertySource.includes("'Not available'") && !propertySource.includes('"Not available"'));
check('property page no longer claims Page 2 of 3', !propertySource.includes('Page 2 of 3'));

check('guide heading is simplified', guideSource.includes('Home Coverage Consultation Guide'));
check('guide evidence labels use plain producer language', ['What they told us','Check the policy','Ask the homeowner'].every(label => guideSource.includes(label)));
check('guide topic uses sequential structure', ['What we know','Ask','What to explore','Check','Notes'].every(label => guideSource.includes(label)));
check('former four-column labels are removed', !['What was discovered','Question to ask','Recommended direction','Information to confirm'].some(label => guideSource.includes(label)));
check('every topic renders dedicated notes lines', guideSource.includes("renderWritingLines(3, `Notes for ${topic.title}`)"));
check('questions are emphasized as quoted prompts', guideSource.includes('class="cf-guide-question">“'));
check('confirmation items use check boxes', guideSource.includes('cf-guide-check-box'));
check('decisions section is simplified', guideSource.includes('Decisions and proposal plan'));
check('missing-information section is simplified', guideSource.includes('Still needed'));
check('next action captures owner due date and method', ['Owner','Due date','Follow-up method'].every(label => guideSource.includes(label)));
check('guide retains issued-policy and underwriting guardrail', guideSource.includes('issued policy and carrier underwriting'));
check('guide page no longer claims Page 3 of 3', !guideSource.includes('Page 3 of 3'));

check('call-ready CSS replaces compression constant', renderer.includes('CALL_READY_CONSULTATION_CSS') && !renderer.includes('CONSULTATION_COMPRESSION_CSS'));
check('renderer advances call-ready HTML version', renderer.includes("version: '1.7.0'"));
check('guide CSS sets readable question type', renderer.includes('.cf-guide-topic__ask .cf-guide-question') && renderer.includes('font-size:12px'));
check('guide CSS sets evidence list type above legacy compressed size', renderer.includes('.cf-guide-evidence__grid ul') && renderer.includes('font-size:9px'));
check('topic layout is sequential rather than four columns', renderer.includes('.cf-guide-topic__body{display:grid}') && renderer.includes('.cf-guide-topic__supporting{display:grid;grid-template-columns:1fr 1fr}'));
check('topic notes receive writing height', renderer.includes('.cf-guide-writing-lines span{height:16px}'));
check('guide can flow past one printed page', renderer.includes('.cf-consultation-guide{display:flex;min-height:auto;break-after:auto;page-break-after:auto}'));
check('paged-media counter remains visible', renderer.includes('.cf-shell-running-page{display:inline-block}'));

const registry = require('./assets/js/print-sections.js');
registry.clearRegistry();
const executiveSection = require('./assets/js/print/sections/executive-summary.js');
const propertySection = require('./assets/js/print/sections/property-summary.js');
const guideSection = require('./assets/js/print/sections/consultation-guide.js');

const sparseProperty = propertySection.render(Object.freeze({
  propertySummary: { available: true, address: '123 Main St, Fremont, CA 94539' }
}));
check('sparse property output retains address', sparseProperty.html.includes('123 Main St, Fremont, CA 94539'));
check('sparse property output uses one compact notice', sparseProperty.html.includes('cf-property-empty-state'));
check('sparse property output contains no unavailable placeholders', !sparseProperty.html.includes('Not available'));
check('sparse property model remains immutable', Object.isFrozen(sparseProperty.model));

const model = Object.freeze({
  generatedAt: '2026-08-04T18:00:00.000Z',
  metadata: Object.freeze({ title: 'Home Coverage Consultation Guide', preparedBy: 'Dylan Haysbert', agency: 'Virginia Tam Insurance Agency' }),
  customer: Object.freeze({ name: 'Jordan Martinez', email: 'jordan@example.com', phone: '408-555-0199' }),
  assessment: Object.freeze({ score: 74, status: 'Strong Foundation', topPriority: 'Review water-loss terms' }),
  executiveSummary: 'Prepare a focused conversation about rebuilding, water terms, and deductibles.',
  strengths: Object.freeze(['Completed a structured review']),
  propertySummary: Object.freeze({
    available: true,
    address: '123 Main St, Fremont, CA 94539',
    yearBuilt: 1998,
    squareFeet: 2100,
    coverage: Object.freeze({ currentCarrier: 'Example Mutual', deductible: 5000 })
  }),
  recommendations: Object.freeze([{
    id: 'water',
    title: 'Review water-loss terms',
    priority: 'High',
    category: 'Water',
    explanation: 'The homeowner is not sure how water damage is handled.',
    conversationStarter: 'Have you reviewed your water-damage deductible and special limitations?',
    producerNotes: 'Confirm the deductible, limitations, and mitigation-device requirements.',
    evidenceQuality: 'needs-verification',
    evidenceLabel: 'Needs policy verification',
    evidencePrompt: 'Confirm water-loss terms against the issued policy.',
    evidence: Object.freeze(['Homeowner reported uncertainty'])
  }]),
  timeline: Object.freeze({ items: Object.freeze([]) }),
  consultationChecklist: Object.freeze({ items: Object.freeze([]) }),
  consultationContext: Object.freeze({
    reviewReason: 'Premium increased',
    missingInformation: Object.freeze(['Current declarations page']),
    decisions: Object.freeze([]),
    nextAction: 'Review the declarations page and prepare options.',
    stage: 'consultation_scheduled',
    outcome: 'none',
    followUp: Object.freeze({ state: 'scheduled', dueDate: '2026-08-06', note: 'Call after 4 PM' }),
    evidenceHandoff: Object.freeze({
      available: true,
      summary: Object.freeze({ total: 3, confirmed: 1, verification: 1, unresolved: 1, followUp: 2 }),
      confirmedFacts: Object.freeze([Object.freeze({ title: 'Review reason', answer: 'Premium increased' })]),
      verificationItems: Object.freeze([Object.freeze({ title: 'Water terms', question: 'Confirm the current policy wording.' })]),
      unresolvedQuestions: Object.freeze([Object.freeze({ title: 'Deductible readiness', question: 'What deductible could you comfortably pay?' })]),
      guardrail: 'Confirm homeowner-reported responses against the issued policy before making a recommendation.'
    })
  })
});

const executive = executiveSection.render(model);
const property = propertySection.render(model);
const guide = guideSection.render(model);
check('executive output preserves score data', executive.html.includes('74') && executive.model.protectionScore.value === 74);
check('property output preserves known carrier and deductible', property.html.includes('Example Mutual') && property.html.includes('$5,000'));
check('guide output preserves recommendation explanation', guide.html.includes('The homeowner is not sure how water damage is handled.'));
check('guide output preserves conversation question', guide.html.includes('Have you reviewed your water-damage deductible'));
check('guide output preserves producer direction', guide.html.includes('Confirm the deductible, limitations, and mitigation-device requirements.'));
check('guide output preserves policy confirmation prompt', guide.html.includes('Confirm water-loss terms against the issued policy.'));
check('guide output maps evidence label only at presentation', guide.model.topics[0].evidenceLabel === 'Needs policy verification' && guide.html.includes('Check policy'));
check('guide output preserves evidence guardrail', guide.html.includes('Confirm homeowner-reported responses against the issued policy'));
check('guide output provides notes for the discussion topic', guide.html.includes('Notes for Review water-loss terms'));
check('guide output preserves next action', guide.html.includes('Review the declarations page and prepare options.'));

new vm.Script(controller, { filename: 'consultation-document.js' });
new vm.Script(renderer, { filename: 'print-renderers.js' });
check('modified JavaScript parses successfully', true);

check('print adapter contract is unchanged', hash('assets/js/print-adapters.js') === 'ecfa281f3ac3fc581e5659a5932407ea74ed74f2a1d95bd0b9f9bc51d66cc9d8');
check('print engine contract is unchanged', hash('assets/js/print-engine.js') === '9ddd5434a0df49c495d9db59923a80f13f79e47cc3b2eb2eeef5505ab88f5156');
check('consultation guide model is unchanged', hash('assets/js/print/models/consultation-guide-model.js') === '44cb4c840e893b7828d21d4e7655b6694e7748e55e99ef157510deb6245fda21');
check('executive summary model is unchanged', hash('assets/js/print/models/executive-summary-model.js') === '688acc9bfaadb02ac7dd72f8c7e51465a26e9f2192cb675e0650531cf12cad0b');
check('property summary model is unchanged', hash('assets/js/print/models/property-summary-model.js') === '7596cae3dcd81c977999763ef5ff491010b2d19c96f8a51bf1639cb5932dbf5f');
check('Workspace data contract is unchanged', hash('assets/js/workspace-data.js') === '985a14895e1382ea62b210448387f33939bbb43e52fc752722b40fd6de33ecc5');
check('Protection Score contract is unchanged', hash('assets/js/protection-score.js') === '0cf3190a5bb99aceb0e527f91268247481fd14e67acd81fb35db3accd8a5f2a8');
check('D1 consultation contract is unchanged', hash('server/consultation-inbox-core.mjs') === 'a9d3d7c5dad61145810bfc5acf7ab642c5854280f7f1e632452b01a3c7c2601a');
check('producer notification contract is unchanged', hash('server/producer-notification.mjs') === 'cfd1aef3009ca2bb014555fa8498b65e4289a3af276b671474ac2cc7acb0b6a7');
check('D1 migration is unchanged', hash('migrations/0001_ops_cf_1_1.sql') === '1bbbd39be2e30119920c2914308c64ad2e11ca460a8f065cd2e6ec9a05cb53cc');

console.log(`DOC-1.2 QA: ${checks.length}/${checks.length} passed`);
