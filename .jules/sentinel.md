## 2025-02-14 - Google GenAI Safety Types
**Vulnerability:** Type mismatches in `safetySettings` configuration for `@google/genai` SDK.
**Learning:** The SDK enforces strict Enum usage for `HarmCategory` and `HarmBlockThreshold`. Using string literals (e.g. `'HARM_CATEGORY_HARASSMENT'`) causes TypeScript errors and may lead to settings being ignored at runtime if the SDK changes internal string mappings.
**Prevention:** Always import and use `HarmCategory` and `HarmBlockThreshold` Enums from the SDK instead of hardcoding strings. This ensures type safety and correct configuration application.

## 2025-02-14 - Prompt Injection Defense
**Vulnerability:** Unbounded user input in AI prompts allowing potential DoS or prompt injection.
**Learning:** Directly interpolating user input into an LLM prompt without length limits or sanitization exposes the system to token exhaustion attacks and prompt injection.
**Prevention:** Implemented strict input truncation (1000 chars) and whitelist-based character sanitization (alphanumeric + basic punctuation) before prompt construction.
