# BOLT'S JOURNAL

## 2024-05-22 - [Initial Journal Creation]
**Learning:** Created journal file.
**Action:** Log critical learnings here.

## 2024-05-22 - [Parallel Generation Requests]
**Learning:** The application was generating designs sequentially (in a loop) while `geminiService` already implemented a delay-based rate limiting strategy intended for batch (parallel) execution. This caused a double penalty: waiting for the previous request to finish AND THEN waiting for the delay.
**Action:** Refactored `App.tsx` to execute requests in parallel using `Promise.all`. This allows the `geminiService` delay to act as a proper staggered start (rate limit) rather than an additive delay, reducing total time for a 4-item batch from ~16s to ~5s.
