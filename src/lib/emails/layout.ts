/**
 * Shared email layout wrapper for all Nola & Co. transactional emails.
 */
export function emailLayout(body: string): string {
  return `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nola & Co.</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F4EF;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#4A4A4A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F4EF;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding:32px 32px 24px;border-bottom:1px solid #E8E6E1;">
              <img src="https://nolaandco.hu/images/logo-wide.svg" alt="Nola & Co." width="140" style="display:block;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 32px;border-top:1px solid #E8E6E1;font-size:12px;color:#999;">
              <p style="margin:0 0 4px;">&copy; 2026 Nola & Co.</p>
              <p style="margin:0;">
                <a href="https://nolaandco.hu" style="color:#C4A591;text-decoration:none;">nolaandco.hu</a>
                &nbsp;|&nbsp;
                <a href="mailto:rendeles@nolaandco.hu" style="color:#C4A591;text-decoration:none;">rendeles@nolaandco.hu</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
