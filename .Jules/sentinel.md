## 2024-05-20 - [Input Length Enforcement]
**Vulnerability:** User inputs in GeneratorForm and ClientWaiverModal lacked `maxLength` attributes, allowing potential memory exhaustion (DoS) or buffer issues, despite some logical checks.
**Learning:** React state updates allow unlimited string length unless restricted by the input element. Logical checks (validation on submit) are not enough to prevent UI freezing from massive pastes.
**Prevention:** Always add `maxLength` attributes to `<input>` and `<textarea>` elements, matching backend/logical constraints.
