const Notice = require('../models/Notice');
const Employee = require('../models/Employee');
const { sendNoticeEmail, sendWhatsAppNotification } = require('../utils/emailService');

// Create notice (Admin only)
exports.createNotice = async (req, res) => {
  try {
    const { title, content, category, priority, isUrgent, departments, roles, expiryDate, notificationChannels } = req.body;
    const postedBy = req.userId;

    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    const notice = new Notice({
      title,
      content,
      category,
      priority: priority || 'normal',
      isUrgent: isUrgent || false,
      departments: departments || [],
      roles: roles || [],
      postedBy,
      expiryDate: expiryDate || null,
      notificationChannels: notificationChannels || ['dashboard']
    });

    await notice.save();

    // Send notifications asynchronously
    try {
      await sendNotifications(notice);
    } catch (error) {
      console.error('Error sending notifications:', error);
      // Don't fail the API call if notifications fail
    }

    res.status(201).json({
      message: 'Notice created successfully',
      notice
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to send notifications
const sendNotifications = async (notice) => {
  try {
    // Get all employees who should receive this notice
    let query = {
      $or: [
        { department: { $in: notice.departments } },
      ]
    };

    // If no specific departments, notify all employees
    if (notice.departments.length === 0) {
      query = {}; // Get all employees
    }

    // If specific roles, add them to the query
    if (notice.roles.length > 0) {
      query = {
        $or: [
          { department: { $in: notice.departments } },
          { role: { $in: notice.roles } }
        ]
      };
    }

    const recipients = await Employee.find(query).select('email phone name');
    
    if (recipients.length === 0) {
      console.log('No recipients found for notice');
      return;
    }

    let sentCount = 0;
    const failedRecipients = [];

    // Send Email
    if (notice.notificationChannels.includes('email') && recipients.length > 0) {
      try {
        const emails = recipients.map(r => r.email).filter(e => e);
        if (emails.length > 0) {
          await sendNoticeEmail(emails, notice);
          sentCount += emails.length;
        }
      } catch (error) {
        console.error('Error sending email notifications:', error);
        recipients.forEach(r => {
          if (r.email) {
            failedRecipients.push({
              employeeId: r._id,
              email: r.email,
              channel: 'email',
              error: error.message,
              timestamp: new Date()
            });
          }
        });
      }
    }

    // Send WhatsApp
    if (notice.notificationChannels.includes('whatsapp') && recipients.length > 0) {
      try {
        const phones = recipients.map(r => r.phone).filter(p => p);
        if (phones.length > 0) {
          const result = await sendWhatsAppNotification(phones, notice);
          if (result.success) {
            sentCount += result.sentCount;
          }
          if (result.failedNumbers) {
            result.failedNumbers.forEach(phone => {
              const recipient = recipients.find(r => r.phone === phone);
              failedRecipients.push({
                employeeId: recipient?._id,
                phone: phone,
                channel: 'whatsapp',
                error: 'Failed to send',
                timestamp: new Date()
              });
            });
          }
        }
      } catch (error) {
        console.error('Error sending WhatsApp notifications:', error);
      }
    }

    // Update notice with sent count
    notice.sentAt = new Date();
    notice.sentToCount = sentCount;
    notice.failedRecipients = failedRecipients;
    await notice.save();

    console.log(`Notice sent to ${sentCount} recipients`);
  } catch (error) {
    console.error('Error in sendNotifications:', error);
  }
};

// Get notices for employee
exports.getNotices = async (req, res) => {
  try {
    const userId = req.userId;
    const employee = await require('../models/Employee').findById(userId);

    // Get all active notices that apply to this employee
    const query = {
      isActive: true,
      $or: [
        { departments: { $in: [employee?.department] } },
        { departments: { $eq: [] } }, // Notices with no department restrictions
        { roles: { $in: [employee?.role] } },
        { roles: { $eq: [] } } // Notices with no role restrictions
      ]
    };

    const notices = await Notice.find(query)
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ notices });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all notices (Admin)
exports.getAllNotices = async (req, res) => {
  try {
    const { category } = req.query;

    let query = {};
    if (category) {
      query.category = category;
    }

    const notices = await Notice.find(query)
      .populate('postedBy', 'name')
      .populate('departments', 'name')
      .sort({ createdAt: -1 });

    res.json({ notices });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update notice (Admin only)
exports.updateNotice = async (req, res) => {
  try {
    const { noticeId } = req.params;
    const { title, content, category, priority, isUrgent, departments, roles, expiryDate } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    const notice = await Notice.findByIdAndUpdate(
      noticeId,
      {
        title,
        content,
        category,
        priority: priority || 'normal',
        isUrgent: isUrgent || false,
        departments: departments || [],
        roles: roles || [],
        expiryDate: expiryDate || null,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    res.json({
      message: 'Notice updated successfully',
      notice
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete notice
exports.deleteNotice = async (req, res) => {
  try {
    const { noticeId } = req.params;

    const notice = await Notice.findByIdAndDelete(noticeId);

    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
