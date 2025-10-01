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
		
		// Extracting the client IP
		const ip = request.headers.get("cf-connecting-ip") || "unknown";

		// Prepare email bodies
		const userEmailBody = getUserEmailBody(formData);
		const adminEmailBody = getAdminEmailBody(formData, ip);
        const userEmail = formData.email;

		// Send emails using your existing sendEmail function

		// From info@iprotechs.com to user email
		if(userEmail != 'admin@iprotechs.com' && userEmail != 'info@iprotechs.com') {
			await sendEmail(environment, "info@iprotechs.com", userEmail, "Thank you for your Demo Request", userEmailBody);
		}
		// From info@iprotechs.com to admin@iprotechs.com
		await sendEmail(environment, "info@iprotechs.com", "admin@iprotechs.com", `You have a demo request from ${formData.name}!`, adminEmailBody);

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

//////////////////////////////
//////// Email Helper
//////////////////////////////
const sendEmail = async (environment: Env, fromEmail: string, toEmail: string, subject: string, body: string) => {
	// RAW RFC 5322 Message 📧;
	const rawMessage = [
		`From: <${fromEmail}>`, 
		`To: ${toEmail}`, 
		`Reply-To: ${fromEmail}`, 
		`Date: ${new Date().toUTCString()}`, 
		`Message-ID: <${crypto.randomUUID()}@iprotechs.com>`, 
		`Subject: ${subject}`, 
		`MIME-Version: 1.0`,
    	`Content-Type: text/html; charset=UTF-8`,
		``, 
		body
	].join('\n');
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

const getAdminEmailBody = (formData: Record<string, string>, clientIp: string) => {
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
																	<tr><td>IP Address</td><td>${clientIp}</td></tr>
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