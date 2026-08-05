// Shared wrapper so every transactional email looks like it's from the
// same product rather than a bare unstyled table. Inline styles only —
// email clients strip <style> blocks and ignore Tailwind entirely.

export function emailShell(bodyHtml: string, previewText: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background-color:#F5F1E8;font-family:Georgia,'Times New Roman',serif;">
  <span style="display:none;font-size:1px;color:#F5F1E8;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${previewText}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E5DFCE;">
          <tr>
            <td style="background-color:#1A3A2A;padding:28px 32px;">
              <span style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#ffffff;">HerbRx</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;font-family:Arial,Helvetica,sans-serif;color:#3A3A3A;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:#FAF7EF;border-top:1px solid #E5DFCE;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8A8577;text-align:center;">
              HerbRx — Verified natural products for Nigerians.<br />
              This is an automated message, please don't reply directly to this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function formatNairaEmail(kobo: number) {
  return `₦${(kobo / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
}
