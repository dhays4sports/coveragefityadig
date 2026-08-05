import {
  handleConsultationActivity,
  handleConsultationDisposition,
  handleConsultationFollowUp,
  handleConsultationInbox,
  handleConsultationStatus,
  handleConsultationSubmission
} from './consultation-inbox-core.mjs';
import { handleProspectReportCreate, handleProspectReportRead } from './prospect-report-core.mjs';
import { createConsultationStore, createProspectReportStore } from './d1-json-store.mjs';
import { withD1RateLimit } from './cloudflare-rate-limit.mjs';

function consultationOptions(context) {
  return {
    store: context.env?.COVERAGEFIT_DB ? createConsultationStore(context.env.COVERAGEFIT_DB) : null,
    env: context.env || {},
    waitUntil: typeof context.waitUntil === 'function' ? context.waitUntil.bind(context) : null
  };
}

function reportOptions(context) {
  return {
    store: context.env?.COVERAGEFIT_DB ? createProspectReportStore(context.env.COVERAGEFIT_DB) : null,
    env: context.env || {}
  };
}

export function consultationSubmit(context) {
  return withD1RateLimit(context, { route: 'consultation-submit', limit: 12, windowSeconds: 60 }, () =>
    handleConsultationSubmission(context.request, consultationOptions(context))
  );
}

export function consultationInbox(context) {
  return withD1RateLimit(context, { route: 'consultation-inbox', limit: 60, windowSeconds: 60 }, () =>
    handleConsultationInbox(context.request, consultationOptions(context))
  );
}

export function consultationStatus(context) {
  return withD1RateLimit(context, { route: 'consultation-status', limit: 120, windowSeconds: 60 }, () =>
    handleConsultationStatus(context.request, consultationOptions(context))
  );
}

export function consultationFollowUp(context) {
  return withD1RateLimit(context, { route: 'consultation-follow-up', limit: 120, windowSeconds: 60 }, () =>
    handleConsultationFollowUp(context.request, consultationOptions(context))
  );
}

export function consultationActivity(context) {
  return withD1RateLimit(context, { route: 'consultation-activity', limit: 180, windowSeconds: 60 }, () =>
    handleConsultationActivity(context.request, consultationOptions(context))
  );
}

export function consultationDisposition(context) {
  return withD1RateLimit(context, { route: 'consultation-disposition', limit: 120, windowSeconds: 60 }, () =>
    handleConsultationDisposition(context.request, consultationOptions(context))
  );
}

export function prospectReportCreate(context) {
  return withD1RateLimit(context, { route: 'prospect-report-create', limit: 12, windowSeconds: 60 }, () =>
    handleProspectReportCreate(context.request, reportOptions(context))
  );
}

export function prospectReportRead(context) {
  return withD1RateLimit(context, { route: 'prospect-report-read', limit: 120, windowSeconds: 60 }, () =>
    handleProspectReportRead(context.request, reportOptions(context))
  );
}
