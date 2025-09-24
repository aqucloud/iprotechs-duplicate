export interface Env {
  SENDGRID_API_KEY: string;
  RECAPTCHA_SECRET: string;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const formData = await req.formData();
        const username = formData.get("yourname")?.toString() || "";
        const useremail = formData.get("youremail")?.toString() || "";
        const userphone = formData.get("yourphone")?.toString() || "";
        const usersubject = formData.get("yoursubject")?.toString() || "";
        const usermessage = formData.get("yourmessage")?.toString() || "";
        const honeypot = formData.get("honeypot")?.toString() || "";
        const timestamp = parseInt(formData.get("timestamp")?.toString() || "0");
        const jsChallenge = formData.get("js_challenge")?.toString() || "";
        const captcha = formData.get("g-recaptcha-response")?.toString() || "";
        const ip = req.headers.get("cf-connecting-ip") || "unknown";

        env.RECAPTCHA_SECRET = `6Le8E-QqAAAAADIgywfXI_0WBUBumNy0KaBqSTFG`;

        // 1. reCAPTCHA validation
        // const captchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/x-www-form-urlencoded" },
        //     body: `secret=${env.RECAPTCHA_SECRET}&response=${captcha}&remoteip=${ip}`,
        // });
        // const captchaData = await captchaRes.json();
        // if (!captchaData.success) {
        //     return new Response("reCAPTCHA validation failed", { status: 400 });
        // }

        // 2. Honeypot check
        if (honeypot) {
            return new Response("Bot detected", { status: 400 });
        }

        // 3. Time + JS challenge check
        if (Date.now() - timestamp < 3000) {
            return new Response("Form submitted too quickly", { status: 400 });
        }
        if (jsChallenge !== "human_verified") {
            return new Response("JavaScript challenge failed", { status: 400 });
        }

        // 4. Original Email Templates (from PHP)
        const userEmailHTML = `<!DOCTYPE html>
        <html>
            <body>
                <div>
                    <table width='100%' cellspacing='0' cellpadding='0' border='0' align='center'>
                        <tbody>
                        <tr><td align='center'>
                            <table style='border-top:#1f7dc1 solid 4px;' width='600' cellspacing='0' cellpadding='0' border='0'>
                            <tbody>
                                <tr><td style='text-align:center;padding:15px 0 20px 0;'>
                                <a href='https://www.iprotechs.com/' target='_blank'>
                                    <img src='https://iprotechs.com/images/thankyou.jpg' alt='iprotechs' height='30'/>
                                </a>
                                </td></tr>
                                <tr><td style='border-bottom:#000 solid 1px;'>
                                <table width='100%' border='0'>
                                    <tbody>
                                    <tr><td style='padding:20px 25px;font-family:Arial;'>
                                        <p>Hi ${username},</p>
                                        <p>Thank you visiting us @ iprotechs. We have received your request for Demo. Our tech team will connect you in the next 24 hours.</p>
                                        <p>For any query write to <a href='mailto:info@iprotechs.com'>info@iprotechs.com</a></p>
                                    </td></tr>
                                    <tr><td style='padding:20px 25px;font-family:Arial;'>
                                        <p>Thanks again for connecting with us.</p>
                                        <p>Regards,<br/>iprotechs</p>
                                    </td></tr>
                                    </tbody>
                                </table>
                                </td></tr>
                            </tbody>
                            </table>
                        </td></tr>
                        </tbody>
                    </table>
                </div>
            </body>
        </html>`;

        const adminEmailHTML = `<!DOCTYPE html>
        <html>
            <body>
                <div>
                    <table width='100%' cellspacing='0' cellpadding='0' border='0' align='center'>
                        <tbody>
                        <tr><td align='center'>
                            <table style='border-top:#1f7dc1 solid 4px;' width='600' cellspacing='0' cellpadding='0' border='0'>
                            <tbody>
                                <tr><td style='text-align:center;padding:15px 0 20px 0;'>
                                <a href='https://www.iprotechs.com/' target='_blank'>
                                    <img src='https://www.iprotechs.com/images/iprotechs-02.jpg' alt='iprotechs' height='30'/>
                                </a>
                                </td></tr>
                                <tr><td style='border-bottom:#000 solid 1px;'>
                                <table width='100%' border='1' bordercolor='#89919a' style='border-collapse:collapse;'>
                                    <tbody>
                                    <tr><td>Name</td><td>${username}</td></tr>
                                    <tr><td>Email</td><td>${useremail}</td></tr>
                                    <tr><td>Mobile</td><td>${userphone}</td></tr>
                                    <tr><td>Subject</td><td>${usersubject}</td></tr>
                                    <tr><td>Message</td><td>${usermessage}</td></tr>
                                    <tr><td>IP Address</td><td>${ip}</td></tr>
                                    </tbody>
                                </table>
                                </td></tr>
                                <tr><td style='padding:20px 25px;font-family:Arial;'>
                                <p>Thanks again for connecting with us.</p>
                                <p>Regards,<br/>iprotechs</p>
                                </td></tr>
                            </tbody>
                            </table>
                        </td></tr>
                        </tbody>
                    </table>
                </div>
            </body>
        </html>`;

        // 5. Send Emails via SendGrid
        async function sendEmail(to: string, subject: string, html: string) {
            return fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${env.SENDGRID_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                personalizations: [{ to: [{ email: to }] }],
                from: { email: "info@iprotechs.com", name: "iProtechs" },
                subject,
                content: [{ type: "text/html", value: html }],
            }),
            });
        }

        await sendEmail(useremail, "Thank you for your Demo Request.", userEmailHTML);
        await sendEmail("info@iprotechs.com", `New Demo Request from ${username}`, adminEmailHTML);

        // 6. Return Thank-You Page
        const thankYouPage = 
        `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8"/>
                    <title>
                        Thank you
                    </title>
                </head>
                <body>
                    <h1>Thank you for contacting iProtechs</h1>
                    <h2>Our team will get in touch within 24-48 hours.</h2>
                </body>
            </html>`;

        return new Response(thankYouPage, { headers: { "Content-Type": "text/html" } });

    } catch (err) {
        return new Response(`Error: ${(err as Error).message}`, { status: 500 });
    }
  },
};
