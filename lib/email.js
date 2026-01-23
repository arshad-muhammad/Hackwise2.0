import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// CA Approval Email Template
function getCAApprovalEmailTemplate(name, caCode) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Hackwise 2.0 Campus Ambassador Confirmation</title>
</head>
<body style="margin:0; padding:0; background-color:#f6f7fb; font-family:Arial, Helvetica, sans-serif; color:#111111;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f7fb; padding:40px 0;">
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.08); overflow:hidden;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:32px 24px 24px; background:linear-gradient(135deg,#fff4ec,#ffffff);">
              <img src="https://hackwise.spherehive.in/_next/image?url=%2Fassets%2FHackloho.png&w=1920&q=75"
                   alt="Hackwise Logo"
                   width="160"
                   style="display:block; margin-bottom:16px;" />
              <h1 style="margin:0; font-size:24px; font-weight:700; color:#111111;">
                You're Selected
              </h1>
              <p style="margin:8px 0 0; font-size:14px; color:#555555;">
                Hackwise 2.0 Campus Ambassador Program
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 28px;">

              <p style="font-size:16px; line-height:1.6; margin:0 0 18px;">
                Hi <strong>${name}</strong>,
              </p>

              <p style="font-size:15px; line-height:1.7; margin:0 0 22px; color:#333333;">
                Congratulations. You've been <strong>officially selected as a Campus Ambassador for Hackwise 2.0</strong>.
              </p>

              <p style="font-size:15px; line-height:1.7; margin:0 0 26px; color:#333333;">
                This role goes beyond promotion. It's about leadership, execution, and building something meaningful at your campus.
              </p>

              <!-- Benefits Card -->
              <div style="background-color:#fafafa; border:1px solid #eeeeee; border-radius:10px; padding:20px; margin-bottom:28px;">
                <p style="margin:0 0 12px; font-weight:700; font-size:15px; color:#f97316;">
                  What you unlock as a Campus Ambassador
                </p>
                <ul style="margin:0; padding-left:18px; font-size:14px; line-height:1.8; color:#444444;">
                  <li>Represent Hackwise 2.0 officially at your college</li>
                  <li>Earn performance-based cash prizes and exclusive goodies</li>
                  <li>Get shortlisted for the Hackwise 2.0 organising team</li>
                  <li>Receive personalised letters of recommendation</li>
                  <li>Opportunity to lead a Sphere Hive club at your campus</li>
                  <li>Network with mentors, founders, and industry professionals</li>
                  <li>Build real leadership and portfolio experience</li>
                </ul>
              </div>

              <!-- Login Card -->
              <div style="background:linear-gradient(135deg,#fff7f0,#ffffff); border:1px solid #ffd8bf; border-radius:10px; padding:20px; margin-bottom:30px;">
                <p style="margin:0 0 10px; font-weight:700; color:#f97316;">
                  Your Campus Ambassador Dashboard
                </p>

                <p style="margin:0 0 6px; font-size:14px; color:#333333;">
                  Login URL
                </p>
                <p style="margin:0 0 14px; font-size:14px;">
                  <a href="https://hackwise.spherehive.in/campus-ambassador/login"
                     style="color:#f97316; text-decoration:none; font-weight:600;">
                    https://hackwise.spherehive.in/campus-ambassador/login
                  </a>
                </p>

                <p style="margin:0 0 6px; font-size:14px; color:#333333;">
                  CA Code: <strong>${caCode}</strong>
                </p>
                <p style="margin:0; font-size:14px; color:#333333;">
                  Password: <strong>Your registration password</strong>
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center; margin-bottom:28px;">
                <a href="https://hackwise.spherehive.in/campus-ambassador/login"
                   style="display:inline-block; background-color:#f97316; color:#000000; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:700; font-size:14px;">
                  Go to CA Dashboard
                </a>
              </div>

              <p style="font-size:14px; line-height:1.7; margin:0 0 18px; color:#444444;">
                Your first task will be assigned soon. Keep an eye on your dashboard and email for updates.
              </p>

              <p style="font-size:15px; line-height:1.7; margin:0;">
                Welcome to Hackwise 2.0. Let's build something impactful.
              </p>

              <p style="margin:20px 0 0; font-size:14px;">
                Regards,<br />
                <strong>Team Hackwise</strong><br />
                Sphere Hive
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 28px; background-color:#fafafa; border-top:1px solid #eeeeee;">
              <p style="margin:0; font-size:12px; line-height:1.6; color:#777777;">
                This is a performance-based role. Rewards and organising team selection are subject to verified contributions and final review by the Hackwise core team.
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

// Task Assignment Email Template
function getTaskAssignmentEmailTemplate(name, taskTitle, taskDescription, deadline, taskType, points, bonusPoints) {
  const deadlineDate = new Date(deadline).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New Task Assigned - Hackwise 2.0</title>
</head>
<body style="margin:0; padding:0; background-color:#f6f7fb; font-family:Arial, Helvetica, sans-serif; color:#111111;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f7fb; padding:40px 0;">
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.08); overflow:hidden;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:32px 24px 24px; background:linear-gradient(135deg,#fff4ec,#ffffff);">
              <img src="https://hackwise.spherehive.in/_next/image?url=%2Fassets%2FHackloho.png&w=1920&q=75"
                   alt="Hackwise Logo"
                   width="160"
                   style="display:block; margin-bottom:16px;" />
              <h1 style="margin:0; font-size:24px; font-weight:700; color:#111111;">
                New Task Assigned
              </h1>
              <p style="margin:8px 0 0; font-size:14px; color:#555555;">
                Hackwise 2.0 Campus Ambassador Program
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 28px;">

              <p style="font-size:16px; line-height:1.6; margin:0 0 18px;">
                Hi <strong>${name}</strong>,
              </p>

              <p style="font-size:15px; line-height:1.7; margin:0 0 22px; color:#333333;">
                A new task has been assigned to you for the Hackwise 2.0 Campus Ambassador Program.
              </p>

              <!-- Task Details Card -->
              <div style="background-color:#fafafa; border:1px solid #eeeeee; border-radius:10px; padding:20px; margin-bottom:28px;">
                <p style="margin:0 0 12px; font-weight:700; font-size:18px; color:#f97316;">
                  ${taskTitle}
                </p>
                
                <div style="margin-bottom:16px;">
                  <p style="margin:0 0 8px; font-weight:600; font-size:14px; color:#333333;">Description:</p>
                  <p style="margin:0; font-size:14px; line-height:1.7; color:#444444; white-space:pre-wrap;">${taskDescription}</p>
                </div>

                <div style="border-top:1px solid #eeeeee; padding-top:16px; margin-top:16px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:4px 0;">
                        <span style="font-weight:600; font-size:14px; color:#333333;">Task Type:</span>
                        <span style="font-size:14px; color:#444444; margin-left:8px;">${taskType}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;">
                        <span style="font-weight:600; font-size:14px; color:#333333;">Deadline:</span>
                        <span style="font-size:14px; color:#444444; margin-left:8px;">${deadlineDate}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;">
                        <span style="font-weight:600; font-size:14px; color:#333333;">Points on Completion:</span>
                        <span style="font-size:14px; color:#f97316; margin-left:8px; font-weight:700;">${points} points</span>
                      </td>
                    </tr>
                    ${bonusPoints > 0 ? `
                    <tr>
                      <td style="padding:4px 0;">
                        <span style="font-weight:600; font-size:14px; color:#333333;">Early Submission Bonus:</span>
                        <span style="font-size:14px; color:#f97316; margin-left:8px; font-weight:700;">+${bonusPoints} bonus points</span>
                      </td>
                    </tr>
                    ` : ''}
                  </table>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center; margin-bottom:28px;">
                <a href="https://hackwise.spherehive.in/campus-ambassador/dashboard"
                   style="display:inline-block; background-color:#f97316; color:#000000; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:700; font-size:14px;">
                  View Task in Dashboard
                </a>
              </div>

              <p style="font-size:14px; line-height:1.7; margin:0 0 18px; color:#444444;">
                Please complete this task before the deadline to earn points and maintain your performance score.
              </p>

              <p style="font-size:15px; line-height:1.7; margin:0;">
                Good luck, and keep up the great work!
              </p>

              <p style="margin:20px 0 0; font-size:14px;">
                Regards,<br />
                <strong>Team Hackwise</strong><br />
                Sphere Hive
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 28px; background-color:#fafafa; border-top:1px solid #eeeeee;">
              <p style="margin:0; font-size:12px; line-height:1.6; color:#777777;">
                This is a performance-based role. Rewards and organising team selection are subject to verified contributions and final review by the Hackwise core team.
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

/**
 * Send CA approval email
 */
export async function sendCAApprovalEmail(email, name, caCode) {
  try {
    console.log('[EMAIL] Starting CA approval email send...', { email, name, caCode });
    
    if (!process.env.RESEND_API_KEY) {
      console.error('[EMAIL] RESEND_API_KEY not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Hackwise 2.0 <noreply@hackwise.spherehive.in>';
    console.log('[EMAIL] Sending from:', fromEmail);
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: '🎉 You\'re Selected as a Campus Ambassador for Hackwise 2.0',
      html: getCAApprovalEmailTemplate(name, caCode),
    });

    if (error) {
      console.error('[EMAIL] Error sending CA approval email:', error);
      console.error('[EMAIL] Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message };
    }

    console.log('[EMAIL] ✅ CA approval email sent successfully!');
    console.log('[EMAIL] Email ID:', data?.id);
    console.log('[EMAIL] Recipient:', email);
    return { success: true, data };
  } catch (error) {
    console.error('[EMAIL] Exception sending CA approval email:', error);
    console.error('[EMAIL] Exception stack:', error.stack);
    return { success: false, error: error.message };
  }
}

/**
 * Send task assignment email
 */
export async function sendTaskAssignmentEmail(email, name, task) {
  try {
    console.log('[EMAIL] Starting task assignment email send...', { 
      email, 
      name, 
      taskId: task.id || 'N/A',
      taskTitle: task.title 
    });
    
    if (!process.env.RESEND_API_KEY) {
      console.error('[EMAIL] RESEND_API_KEY not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Hackwise 2.0 <noreply@hackwise.spherehive.in>';
    console.log('[EMAIL] Sending from:', fromEmail);
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: `📋 New Task: ${task.title} - Hackwise 2.0`,
      html: getTaskAssignmentEmailTemplate(
        name,
        task.title,
        task.description,
        task.deadline,
        task.task_type,
        task.points_on_completion || 5,
        task.bonus_points_early || 0
      ),
    });

    if (error) {
      console.error('[EMAIL] Error sending task assignment email:', error);
      console.error('[EMAIL] Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message };
    }

    console.log('[EMAIL] ✅ Task assignment email sent successfully!');
    console.log('[EMAIL] Email ID:', data?.id);
    console.log('[EMAIL] Recipient:', email);
    console.log('[EMAIL] Task:', task.title);
    return { success: true, data };
  } catch (error) {
    console.error('[EMAIL] Exception sending task assignment email:', error);
    console.error('[EMAIL] Exception stack:', error.stack);
    return { success: false, error: error.message };
  }
}

