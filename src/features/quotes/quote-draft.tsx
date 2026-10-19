/** HTML draft fields deliberately remain outside the viewer and work without WebGL/JS.
 * No action/endpoint exists until Step 8; no contact data is persisted or transmitted.
 */
export function QuoteDraft() {
  return <section id="quote-draft" className="quote-draft" aria-labelledby="quote-title">
    <div><p className="eyebrow">PLAN YOUR REQUEST</p><h2 id="quote-title">A place for your project.</h2><p>This is a local demo draft. Submission will be added in Step 8. These fields are not saved or sent, and no furniture order is placed.</p></div>
    <fieldset className="quote-fields" aria-describedby="quote-draft-note"><legend className="sr-only">Demo quote draft details</legend>
      <label>Name<input name="name" autoComplete="off" maxLength={100} placeholder="Use fictional demo details" /></label>
      <label>Email<input name="email" type="email" autoComplete="off" maxLength={254} placeholder="hello@example.com" /></label>
      <label>Company <span>(optional)</span><input name="company" autoComplete="off" maxLength={120} /></label>
      <label>Country <span>(optional)</span><input name="country" autoComplete="off" maxLength={100} /></label>
      <label className="full-width">Project message <span>(optional)</span><textarea name="message" maxLength={1000} rows={4} placeholder="Tell us about your workspace concept" /></label>
      <p id="quote-draft-note" className="full-width">Draft fields only · Not saved · Submission unavailable</p>
      <button type="button" className="button full-width" disabled>Demo quote submission · Coming in Step 8</button>
    </fieldset>
  </section>;
}
