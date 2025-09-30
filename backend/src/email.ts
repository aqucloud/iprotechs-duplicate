// Import Libs.
import { EmailMessage } from 'cloudflare:email';

//////////////////////////////
//////// Contact
//////////////////////////////
export const contact: ExportedHandlerFetchHandler<Env> = async (request, environment) => {
	try {
		const contentType = request.headers.get("content-type") || "";

		// Parse incoming request body based on content type
		let formData: Record<string, string> = {};
		if (contentType.includes("application/x-www-form-urlencoded")) {
			const text = await request.text();
			const params = new URLSearchParams(text);
			formData = Object.fromEntries(params);
		} else if (contentType.includes("application/json")) {
			formData = await request.json();
		} else {
			return new Response(JSON.stringify({ success: false, message: "Unsupported Content-Type" }), {
				status: 400,
				headers: { "Content-Type": "application/json" }
			});
		}
		
		// Extract the reCAPTCHA token and client IP
		// const captcha = formData["g-recaptcha-response"] || "";
		const ip = request.headers.get("cf-connecting-ip") || "unknown";

		// Ensure a token was provided
		// if (!captcha) {
		// 	return new Response(JSON.stringify({
		// 		success: false,
		// 		message: "No reCAPTCHA token provided"
		// 	}), {
		// 		status: 400,
		// 		headers: { "Content-Type": "application/json" }
		// 	});
		// }

		// try {
		// 	// Verify the token with Google
		// 	const captchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
		// 		method: "POST",
		// 		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		// 		body: new URLSearchParams({
		// 			secret: '6Le8E-QqAAAAADIgywfXI_0WBUBumNy0KaBqSTFG',
		// 			response: captcha,
		// 			remoteip: ip
		// 		})
		// 	});

		// 	// Parse the JSON response
		// 	const captchaData: RecaptchaResponse = await captchaRes.json();

		// 	if (!captchaData.success) {
		// 		return new Response(JSON.stringify({
		// 			success: false,
		// 			message: "reCAPTCHA validation failed"
		// 		}), {
		// 			status: 400,
		// 			headers: { "Content-Type": "application/json" }
		// 		});
		// 	}
		// } catch (err) {
		// 	console.error("reCAPTCHA verification error:", err);
		// 	return new Response(JSON.stringify({
		// 		success: false,
		// 		message: "Error verifying reCAPTCHA"
		// 	}), {
		// 		status: 500,
		// 		headers: { "Content-Type": "application/json" }
		// 	});
		// }

		// Prepare email bodies
		const userEmailBody = getUserEmailBody(formData);
		const adminEmailBody = getAdminEmailBody(formData);

		// Send emails using your existing sendEmail function
		await sendEmail(environment, "info@iprotechs.com", formData.email, "Thank you for your Demo Request", userEmailBody);
		await sendEmail(environment, "info@iprotechs.com", "info@iprotechs.com", `You have a demo request from ${formData.name}!`, adminEmailBody);

		return new Response(JSON.stringify({ success: true, message: "Request submitted successfully" }), {
			headers: { "Content-Type": "application/json" }
		});
	} catch (error) {
		return new Response(JSON.stringify({ success: false, message: (error as Error).message }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};

// Define type for Google reCAPTCHA response
interface RecaptchaResponse {
  success: boolean;
}

//////////////////////////////
//////// Email Helper
//////////////////////////////
const sendEmail = async (environment: Env, fromEmail: string, toEmail: string, subject: string, body: string) => {
	// RAW RFC 5322 Message 📧;
	const rawMessage = [`From: <${fromEmail}>`, `To: ${toEmail}`, `Reply-To: ${fromEmail}`, `Date: ${new Date().toUTCString()}`, `Message-ID: <${crypto.randomUUID()}@rutvikkaturi.com>`, `Subject: ${subject}`, '', body].join('\n');
	const emailMessage = new EmailMessage(fromEmail, toEmail, rawMessage);
	await environment.SEB.send(emailMessage);
};

const getUserEmailBody = (formData: Record<string, string>) => {
	return `<!DOCTYPE html>
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
												<p>Hi ${formData.name},</p>
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
}

const getAdminEmailBody = (formData: Record<string, string>) => {
   return `<!DOCTYPE html>
				<html>
					<body>
						<div>
							<table width='100%' cellspacing='0' cellpadding='0' border='0' align='center'>
								<tbody>
									<tr>
										<td align='center'>
											<table style='border-top:#1f7dc1 solid 4px;' width='600' cellspacing='0' cellpadding='0' border='0'>
												<tbody>
													<tr>
														<td style='text-align:center;padding:15px 0 20px 0;'>
															<a href='https://www.iprotechs.com/' target='_blank'>
																<img src='https://www.iprotechs.com/images/iprotechs-02.jpg' alt='iprotechs' height='30'/>
															</a>
														</td>
													</tr>
													<tr>
														<td style='border-bottom:#000 solid 1px;'>
															<table width='100%' border='1' bordercolor='#89919a' style='border-collapse:collapse;'>
																<tbody>
																	<tr><td>Name</td><td>${formData.name}</td></tr>
																	<tr><td>Email</td><td>${formData.email}</td></tr>
																	<tr><td>Mobile</td><td>${formData.phone}</td></tr>
																	<tr><td>Subject</td><td>${formData.subject}</td></tr>
																	<tr><td>Message</td><td>${formData.message}</td></tr>
																	<tr><td>IP Address</td><td>${formData.ip}</td></tr>
																</tbody>
															</table>
														</td>
													</tr>
													<tr>
														<td style='padding:20px 25px;font-family:Arial;'>
															<p>Thanks again for connecting with us.</p>
															<p>Regards,<br/>iprotechs</p>
														</td>
													</tr>
												</tbody>
									        </table>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</body>
				</html>`;
}