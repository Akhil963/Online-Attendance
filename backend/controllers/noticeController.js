const Notice = require('../models/Notice');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const { sendNoticeEmail } = require('../utils/emailService');

// Create notice (Admin only)
exports.createNotice = async (req, res) => {
  try {
    const { title, content, category, priority, isUrgent, departments, employees, roles, expiryDate, notificationChannels } = req.body;
    const postedBy = req.userId;
    const userRole = req.userRole; // Get user role from auth middleware

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
      employees: employees || [],
      roles: roles || [],
      postedBy,
      postedByModel: userRole === 'admin' ? 'Admin' : 'Employee',
      expiryDate: expiryDate || null,
      // Only allow dashboard and email channels - WhatsApp disabled
      notificationChannels: (notificationChannels || ['dashboard']).filter(channel => 
        ['dashboard', 'email'].includes(channel)
      )
    });

    await notice.save();

    // Send notifications asynchronously
    try {
      const io = req.app.get('io');
      await sendNotifications(notice, io);
      
      // Notify admin about new notice for notice management page refresh
      if (io) {
        io.to('admin').emit('notice:created', {
          notice: notice
        });
        io.emit('notification:new', {
          type: 'notice',
          noticeId: notice._id,
          title: notice.title,
          category: notice.category,
          priority: notice.priority,
          isUrgent: notice.isUrgent,
          createdAt: notice.createdAt || new Date(),
          message: `New notice: ${notice.title}`
        });
      }
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
const sendNotifications = async (notice, io) => {
  try {
    // Build strict recipient targeting from selected departments/employees/roles.
    const hasDepartments = Array.isArray(notice.departments) && notice.departments.length > 0;
    const hasEmployees = Array.isArray(notice.employees) && notice.employees.length > 0;
    const hasRoles = Array.isArray(notice.roles) && notice.roles.length > 0;

    let query = {};
    if (hasDepartments || hasEmployees || hasRoles) {
      const orConditions = [];
      if (hasDepartments) {
        orConditions.push({ department: { $in: notice.departments } });
      }
      if (hasEmployees) {
        orConditions.push({ _id: { $in: notice.employees } });
      }
      if (hasRoles) {
        orConditions.push({ role: { $in: notice.roles } });
      }
      query = { $or: orConditions };
    }

    const recipients = await Employee.find(query).select('email phone name');
    
    if (recipients.length === 0) {
      console.log('No recipients found for notice');
      return;
    }

    let sentCount = 0;
    const failedRecipients = [];

    // Emit real-time in-app notification for each targeted employee.
    if (io && recipients.length > 0) {
      recipients.forEach((recipient) => {
        io.to(`user-${recipient._id}`).emit('notification:new', {
          type: 'notice',
          noticeId: notice._id,
          title: notice.title,
          category: notice.category,
          priority: notice.priority,
          isUrgent: notice.isUrgent,
          createdAt: notice.createdAt || new Date(),
          message: `New notice: ${notice.title}`
        });
      });
    }

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

    // Send WhatsApp (Disabled - requires integration setup)
    // if (notice.notificationChannels.includes('whatsapp') && recipients.length > 0) {
    //   try {
    //     const phones = recipients.map(r => r.phone).filter(p => p);
    //     if (phones.length > 0) {
    //       const result = await sendWhatsAppNotification(phones, notice);
    //       if (result.success) {
    //         sentCount += result.sentCount;
    //       }
    //       if (result.failedNumbers) {
    //         result.failedNumbers.forEach(phone => {
    //           const recipient = recipients.find(r => r.phone === phone);
    //           failedRecipients.push({
    //             employeeId: recipient?._id,
    //             phone: phone,
    //             channel: 'whatsapp',
    //             error: 'Failed to send',
    //             timestamp: new Date()
    //           });
    //         });
    //       }
    //     }
    //   } catch (error) {
    //     console.error('Error sending WhatsApp notifications:', error);
    //   }
    // }

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
    const employee = await Employee.findById(userId);

    // Get notices targeted to this employee/department/role, or global broadcasts.
    const query = {
      isActive: true,
      $or: [
        { employees: { $in: [userId] } },
        { departments: { $in: [employee?.department] } },
        { roles: { $in: [employee?.role] } },
        {
          $and: [
            { employees: { $size: 0 } },
            { departments: { $size: 0 } },
            { roles: { $size: 0 } }
          ]
        }
      ]
    };

    const notices = await Notice.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Batch-fetch postedBy users to avoid N+1 queries
    const adminIds = [...new Set(notices.filter(n => n.postedByModel !== 'Employee').map(n => String(n.postedBy)))];
    const empIds = [...new Set(notices.filter(n => n.postedByModel === 'Employee').map(n => String(n.postedBy)))];
    const [fetchedAdmins, fetchedEmployees] = await Promise.all([
      Admin.find({ _id: { $in: adminIds } }).select('name email').lean(),
      Employee.find({ _id: { $in: empIds } }).select('name email').lean()
    ]);
    const adminMap = Object.fromEntries(fetchedAdmins.map(a => [String(a._id), a]));
    const empMap = Object.fromEntries(fetchedEmployees.map(e => [String(e._id), e]));
    const populatedNotices = notices.map(notice => {
      const map = notice.postedByModel === 'Employee' ? empMap : adminMap;
      return { ...notice, postedBy: map[String(notice.postedBy)] || { name: 'Unknown', email: '' } };
    });

    res.json({ notices: populatedNotices });
  } catch (error) {
    console.error('Error in getNotices:', error);
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
      .populate('departments', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Batch-fetch postedBy users to avoid N+1 queries
    const adminIds2 = [...new Set(notices.filter(n => n.postedByModel !== 'Employee').map(n => String(n.postedBy)))];
    const empIds2 = [...new Set(notices.filter(n => n.postedByModel === 'Employee').map(n => String(n.postedBy)))];
    const [fetchedAdmins2, fetchedEmployees2] = await Promise.all([
      Admin.find({ _id: { $in: adminIds2 } }).select('name email').lean(),
      Employee.find({ _id: { $in: empIds2 } }).select('name email').lean()
    ]);
    const adminMap2 = Object.fromEntries(fetchedAdmins2.map(a => [String(a._id), a]));
    const empMap2 = Object.fromEntries(fetchedEmployees2.map(e => [String(e._id), e]));
    const populatedNotices = notices.map(notice => {
      const map = notice.postedByModel === 'Employee' ? empMap2 : adminMap2;
      return { ...notice, postedBy: map[String(notice.postedBy)] || { name: 'Unknown', email: '' } };
    });

    res.json({ notices: populatedNotices });
  } catch (error) {
    console.error('Error in getAllNotices:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update notice (Admin only)
exports.updateNotice = async (req, res) => {
  try {
    const { noticeId } = req.params;
    const { title, content, category, priority, isUrgent, departments, employees, roles, expiryDate } = req.body;

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
        employees: employees || [],
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
