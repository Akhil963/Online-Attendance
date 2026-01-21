const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const moment = require('moment');
const ExcelJS = require('exceljs');
const fs = require('fs');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Schedule daily report at 5:30 PM (weekdays only, excluding holidays)
const scheduleEmailReport = () => {
  // Every day at 5:30 PM (17:30)
  // Monday to Friday: 1-5 (Sunday is 0, Saturday is 6)
  schedule.scheduleJob('30 17 * * 1-5', async () => {
    try {
      console.log('Generating daily attendance report for weekday...');
      await sendDailyAttendanceReport();
    } catch (error) {
      console.error('Error sending daily report:', error);
    }
  });
};

// Generate and send daily attendance report
const sendDailyAttendanceReport = async () => {
  try {
    const today = moment().startOf('day').toDate();
    const tomorrow = moment(today).add(1, 'day').toDate();
    
    // Check if today is a weekday (1-5 = Monday to Friday)
    const dayOfWeek = moment().day();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log('Skipping report: Today is a weekend');
      return;
    }

    // Get today's attendance
    const attendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate('employeeId', 'name email department phone');

    if (attendance.length === 0) {
      console.log('No attendance records for today');
      return;
    }

    // Create Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Daily Attendance');

    worksheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Check In', key: 'checkInTime', width: 15 },
      { header: 'Check Out', key: 'checkOutTime', width: 15 },
      { header: 'Working Hours', key: 'workingHours', width: 15 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data
    attendance.forEach(record => {
      worksheet.addRow({
        employeeId: record.employeeId._id,
        name: record.employeeId.name,
        status: record.status,
        checkInTime: record.checkInTime ? moment(record.checkInTime).format('hh:mm:ss A') : '-',
        checkOutTime: record.checkOutTime ? moment(record.checkOutTime).format('hh:mm:ss A') : '-',
        workingHours: record.workingHours || 0
      });
    });

    // Save file
    const fileName = `attendance_report_${moment().format('YYYY-MM-DD')}.xlsx`;
    const filePath = `./${fileName}`;
    await workbook.xlsx.writeFile(filePath);

    // Specific email configuration
    const reportEmail = process.env.REPORT_EMAIL || 'zintech04@gmail.com';

    // Calculate statistics
    const stats = {
      totalPresent: attendance.filter(a => a.status === 'present').length,
      totalAbsent: attendance.filter(a => a.status === 'absent').length,
      totalLate: attendance.filter(a => a.status === 'late').length,
      totalLeave: attendance.filter(a => a.status === 'leave').length
    };

    // Send email with attachment to specific email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: reportEmail,
      subject: `Daily Attendance Report - ${moment().format('(dddd) MMMM DD, YYYY')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <h2 style="margin: 0;">📊 Daily Attendance Report</h2>
          </div>
          
          <p><strong>Date:</strong> ${moment().format('dddd, MMMM DD, YYYY')}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #ddd;">
            <tr style="background: #ecf0f1;">
              <td style="padding: 12px; border: 1px solid #bdc3c7;"><strong>Total Present</strong></td>
              <td style="padding: 12px; border: 1px solid #bdc3c7; color: #27ae60; font-weight: bold; font-size: 18px;">${stats.totalPresent}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #bdc3c7;"><strong>Total Absent</strong></td>
              <td style="padding: 12px; border: 1px solid #bdc3c7; color: #e74c3c; font-weight: bold; font-size: 18px;">${stats.totalAbsent}</td>
            </tr>
            <tr style="background: #ecf0f1;">
              <td style="padding: 12px; border: 1px solid #bdc3c7;"><strong>Total Late</strong></td>
              <td style="padding: 12px; border: 1px solid #bdc3c7; color: #f39c12; font-weight: bold; font-size: 18px;">${stats.totalLate}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #bdc3c7;"><strong>Total Leave</strong></td>
              <td style="padding: 12px; border: 1px solid #bdc3c7; color: #3498db; font-weight: bold; font-size: 18px;">${stats.totalLeave}</td>
            </tr>
            <tr style="background: #ecf0f1;">
              <td style="padding: 12px; border: 1px solid #bdc3c7;"><strong>Total Records</strong></td>
              <td style="padding: 12px; border: 1px solid #bdc3c7; font-weight: bold; font-size: 18px;">${attendance.length}</td>
            </tr>
          </table>

          <div style="background: #e8f4f8; padding: 15px; border-left: 4px solid #3498db; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #2c3e50;">
              📎 Detailed attendance report is attached to this email as an Excel file.
            </p>
          </div>

          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
            Attendance System - Automated Daily Report<br>
            Sent at: ${moment().format('hh:mm:ss A')} IST
          </p>
        </div>
      `,
      attachments: [
        {
          path: filePath
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log(`Daily attendance report sent to ${reportEmail}`);

    // Delete file after sending
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error('Error in sendDailyAttendanceReport:', error);
  }
};

// Send notification email
const sendNotificationEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Send leave approval email
const sendLeaveApprovalEmail = async (employee, leave, status) => {
  try {
    const subject = `Leave ${status} - ${moment(leave.startDate).format('MMMM DD YYYY')}`;
    const html = `
      <h2>Leave ${status}</h2>
      <p>Dear ${employee.name},</p>
      <p>Your leave application has been <strong>${status}</strong>.</p>
      <p>
        <strong>Leave Details:</strong><br>
        Type: ${leave.leaveType}<br>
        From: ${moment(leave.startDate).format('MMMM DD YYYY')}<br>
        To: ${moment(leave.endDate).format('MMMM DD YYYY')}<br>
        Days: ${leave.numberOfDays}
      </p>
      ${leave.rejectionReason ? `<p><strong>Reason:</strong> ${leave.rejectionReason}</p>` : ''}
      <p>Thank you</p>
    `;

    await sendNotificationEmail(employee.email, subject, html);
  } catch (error) {
    console.error('Error sending leave email:', error);
  }
};

// Send notice notification via email
const sendNoticeEmail = async (recipients, notice) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">${notice.title}</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">
            ${notice.priority === 'critical' ? '🔴 CRITICAL' : notice.priority === 'high' ? '🟠 HIGH' : '🟢 NORMAL'} Priority
          </p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
            Category: <strong>${notice.category.toUpperCase()}</strong>
          </p>
          ${notice.isUrgent ? '<p style="color: #d32f2f; font-weight: bold; margin: 0 0 10px 0;">⚠️ URGENT NOTICE</p>' : ''}
        </div>

        <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #667eea; margin-bottom: 20px; border-radius: 4px;">
          <p style="margin: 0; line-height: 1.6; color: #333;">${notice.content}</p>
        </div>

        <div style="background: #e3f2fd; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #1976d2;">📱 You can also view this in your dashboard</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/notices" style="background: #1976d2; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; display: inline-block;">View in Dashboard</a>
        </div>

        <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
          This is an automated notification from Attendance System. Please do not reply to this email.
        </p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipients.join(','),
      subject: `📌 ${notice.title}${notice.isUrgent ? ' [URGENT]' : ''}`,
      html: html
    };

    await transporter.sendMail(mailOptions);
    console.log(`Notice email sent to ${recipients.length} recipients`);
    return { success: true, sentCount: recipients.length };
  } catch (error) {
    console.error('Error sending notice email:', error);
    throw error;
  }
};

// Send WhatsApp notification via Ultramsg (Free tier)
const sendWhatsAppNotification = async (phoneNumbers, notice) => {
  try {
    const token = process.env.ULTRAMSG_TOKEN;
    const instance = process.env.ULTRAMSG_INSTANCE;

    if (!token || !instance) {
      console.warn('WhatsApp credentials not configured. Skipping WhatsApp notification.');
      return { success: false, message: 'WhatsApp not configured' };
    }

    const message = `� *${notice.title}*\n\n${notice.content.substring(0, 500)}${notice.content.length > 500 ? '...' : ''}\n\n🔗 View full notice in your dashboard`;

    const failedNumbers = [];
    let successCount = 0;

    for (const phone of phoneNumbers) {
      try {
        const response = await fetch(
          `https://api.ultramsg.com/${instance}/messages/chat`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: token,
              to: phone,
              body: message
            })
          }
        );

        if (response.ok) {
          successCount++;
        } else {
          failedNumbers.push(phone);
        }
      } catch (error) {
        console.error(`Failed to send WhatsApp to ${phone}:`, error);
        failedNumbers.push(phone);
      }
    }

    return {
      success: successCount > 0,
      sentCount: successCount,
      failedNumbers: failedNumbers
    };
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    throw error;
  }
};

// Send approval request email to admin when employee registers
const sendApprovalRequestToAdmin = async (employee, adminEmails) => {
  try {
    const employeeDetails = `
      <div style="margin-top: 20px;">
        <h3 style="color: #333;">Employee Details:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Name:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${employee.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${employee.email || 'Not provided'}</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Phone:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${employee.phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Department:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${employee.department?.name || 'Not assigned'}</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Gender:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${employee.gender || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Registration Date:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${new Date(employee.createdAt).toLocaleDateString()}</td>
          </tr>
        </table>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmails.join(', '),
      subject: `🔔 New Employee Registration - Approval Required`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">🔔 New Employee Registration</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Approval Required</p>
          </div>
          
          <div style="background-color: #fff; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
            <p style="color: #555; font-size: 16px;">Hello Admin,</p>
            
            <p style="color: #555; line-height: 1.6;">
              A new employee has registered and is waiting for your approval. Please review their details below and approve or reject their account.
            </p>
            
            ${employeeDetails}
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/approvals" 
                 style="display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Review & Approve
              </a>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background-color: #f0f0f0; border-left: 4px solid #667eea; border-radius: 4px;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                <strong>Note:</strong> The employee will not be able to access the system until you approve their account.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Attendance System. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Approval request email sent to admin(s): ${adminEmails.join(', ')}`);
    return true;
  } catch (error) {
    console.error('Error sending approval request email to admin:', error);
    throw error;
  }
};

// Send approval confirmation email to employee
const sendApprovalConfirmationToEmployee = async (employee, admin) => {
  try {
    const approvalDetails = `
      <div style="margin-top: 20px;">
        <h3 style="color: #333;">Your Account Details:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Employee ID:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;"><span style="color: #667eea; font-weight: bold;">${employee.employeeId}</span></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Name:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${employee.name}</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${employee.email}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Department:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${employee.department?.name || 'Not assigned'}</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Role:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${employee.role}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Approval Date:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleDateString()}</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Approved By:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${admin.name}</td>
          </tr>
        </table>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: employee.email,
      subject: `✅ Account Approved - Welcome to ${process.env.COMPANY_NAME || 'Attendance System'}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 28px;">✅ Your Account is Approved!</h2>
            <p style="margin: 10px 0 0 0; font-size: 14px;">Welcome to the Team</p>
          </div>
          
          <div style="background-color: #fff; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
            <p style="color: #555; font-size: 16px;">Dear ${employee.name},</p>
            
            <p style="color: #555; line-height: 1.6;">
              Great news! 🎉 Your account has been <strong>successfully approved</strong> by the administrator. You can now access the attendance system with your credentials.
            </p>
            
            ${approvalDetails}
            
            <div style="margin-top: 30px; background-color: #e8f5e9; padding: 15px; border-radius: 5px; border-left: 4px solid #11998e;">
              <p style="color: #2e7d32; margin: 0; font-weight: bold;">✓ Your account is now active</p>
              <p style="color: #555; margin: 5px 0 0 0; font-size: 14px;">You can now log in and start using the system.</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login/employee" 
                 style="display: inline-block; background-color: #11998e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Login to System
              </a>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background-color: #f0f0f0; border-radius: 4px;">
              <h4 style="color: #333; margin-top: 0;">Next Steps:</h4>
              <ul style="color: #666; padding-left: 20px; margin: 0;">
                <li>Log in with your email and password</li>
                <li>Complete your profile if needed</li>
                <li>Start marking your daily attendance</li>
                <li>Check announcements and notices regularly</li>
              </ul>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #fff3e0; border-left: 4px solid #ff9800; border-radius: 4px;">
              <p style="color: #f57c00; margin: 0; font-size: 12px;">
                <strong>Need Help?</strong> If you have any questions, please contact your administrator at ${process.env.ADMIN_EMAIL || 'admin@company.com'}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Attendance System. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Approval confirmation email sent to: ${employee.email}`);
    return true;
  } catch (error) {
    console.error('Error sending approval confirmation email:', error);
    throw error;
  }
};

// Send rejection email to employee
const sendRejectionEmailToEmployee = async (employee, reason) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: employee.email,
      subject: `❌ Account Registration Status - Action Required`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">Registration Status Update</h2>
          </div>
          
          <div style="background-color: #fff; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
            <p style="color: #555; font-size: 16px;">Dear ${employee.name},</p>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #ffebee; border-left: 4px solid #f5576c; border-radius: 4px;">
              <p style="color: #c62828; margin: 0; font-weight: bold;">Your registration was not approved</p>
            </div>
            
            <p style="color: #555; line-height: 1.6; margin-top: 20px;">
              We have reviewed your registration details and unfortunately, we are unable to approve your account at this time.
            </p>
            
            ${reason ? `
              <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
                <p style="color: #333; margin: 0; font-weight: bold;">Reason:</p>
                <p style="color: #666; margin: 10px 0 0 0;">${reason}</p>
              </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding: 15px; background-color: #fff3e0; border-left: 4px solid #ff9800; border-radius: 4px;">
              <p style="color: #f57c00; margin: 0; font-size: 14px;">
                Please contact your administrator for more information or to request a re-review of your application.
              </p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="mailto:${process.env.ADMIN_EMAIL || 'admin@company.com'}" 
                 style="display: inline-block; background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Contact Administrator
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Attendance System. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Rejection email sent to: ${employee.email}`);
    return true;
  } catch (error) {
    console.error('Error sending rejection email:', error);
    throw error;
  }
};

module.exports = {
  scheduleEmailReport,
  sendDailyAttendanceReport,
  sendNotificationEmail,
  sendLeaveApprovalEmail,
  sendNoticeEmail,
  sendWhatsAppNotification,
  sendApprovalRequestToAdmin,
  sendApprovalConfirmationToEmployee,
  sendRejectionEmailToEmployee,
  transporter
};
