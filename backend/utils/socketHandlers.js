const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const Department = require('../models/Department');

// In-memory storage for connected users and real-time data
const connectedUsers = new Map();
const realtimeStats = {
  totalEmployees: 0,
  presentToday: 0,
  absentToday: 0,
  onLeaveToday: 0,
  pendingLeaves: 0
};

const initializeSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId;
    
    console.log(`✓ User connected: ${userId}`);
    
    if (userId) {
      connectedUsers.set(socket.id, {
        userId,
        socketId: socket.id,
        connectedAt: new Date()
      });
    }

    // Broadcast presence update to all clients
    broadcastPresenceUpdate(io);

    // Handle real-time attendance check-in
    socket.on('attendance:checkIn', async (data) => {
      try {
        const attendance = new Attendance({
          employeeId: userId,
          date: new Date(),
          checkInTime: new Date(),
          status: 'present'
        });
        await attendance.save();

        // Update statistics
        await updateRealtimeStats(io);

        // Broadcast to all admin users
        io.to('admin').emit('attendance:updated', {
          type: 'checkIn',
          employeeId: userId,
          time: new Date(),
          message: `Employee ${userId} checked in`
        });

        socket.emit('attendance:checkInSuccess', { success: true });
      } catch (error) {
        socket.emit('attendance:checkInError', { error: error.message });
      }
    });

    // Handle real-time attendance check-out
    socket.on('attendance:checkOut', async (data) => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOneAndUpdate(
          { employeeId: userId, date: { $gte: today } },
          { checkOutTime: new Date() },
          { new: true }
        );

        if (attendance) {
          // Update statistics
          await updateRealtimeStats(io);

          // Broadcast to all admin users
          io.to('admin').emit('attendance:updated', {
            type: 'checkOut',
            employeeId: userId,
            time: new Date(),
            message: `Employee ${userId} checked out`
          });

          socket.emit('attendance:checkOutSuccess', { success: true });
        } else {
          socket.emit('attendance:checkOutError', { error: 'No check-in found for today' });
        }
      } catch (error) {
        socket.emit('attendance:checkOutError', { error: error.message });
      }
    });

    // Handle stats request
    socket.on('stats:request', async () => {
      try {
        await updateRealtimeStats(io, socket);
      } catch (error) {
        socket.emit('stats:error', { error: error.message });
      }
    });

    // Handle presence request
    socket.on('presence:request', () => {
      const onlineUsers = Array.from(connectedUsers.values());
      socket.emit('presence:updated', { onlineUsers });
      io.emit('presence:updated', { onlineUsers });
    });

    // Subscribe to admin room
    socket.on('join:admin', () => {
      socket.join('admin');
    });

    // Handle leave status change notifications
    socket.on('leave:statusChanged', async (data) => {
      try {
        const { leaveId, status } = data;

        const VALID_STATUSES = ['approved', 'rejected', 'pending'];
        if (!leaveId || !VALID_STATUSES.includes(status)) {
          return socket.emit('leave:error', { error: 'Invalid leave ID or status' });
        }

        const leave = await Leave.findByIdAndUpdate(
          leaveId,
          { status },
          { new: true }
        ).populate('employeeId');

        // Notify the employee
        io.to(`user-${leave.employeeId._id}`).emit('leave:statusChanged', {
          leaveId,
          status,
          message: `Your leave request has been ${status}`
        });

        // Update statistics
        await updateRealtimeStats(io);

        // Broadcast to admin
        io.to('admin').emit('leave:updated', {
          type: 'statusChange',
          leaveId,
          status
        });
      } catch (error) {
        socket.emit('leave:error', { error: error.message });
      }
    });

    // Handle employee approval notifications
    socket.on('employee:approve', async (data) => {
      try {
        const { employeeId } = data;
        
        const employee = await Employee.findById(employeeId).populate('department');

        if (!employee) {
          return socket.emit('employee:approveError', { error: 'Employee not found' });
        }

        // Notify the employee by their email (or user ID if they're connected)
        io.to(`user-${employeeId}`).emit('employee:approved', {
          employeeId,
          email: employee.email,
          name: employee.name,
          message: 'Your account has been approved! Please login to continue.'
        });

        // Broadcast to admin
        io.to('admin').emit('employee:approved', {
          type: 'approval',
          employeeId,
          email: employee.email,
          name: employee.name,
          timestamp: new Date()
        });
      } catch (error) {
        socket.emit('employee:approveError', { error: error.message });
      }
    });

    // Handle employee rejection notifications
    socket.on('employee:reject', async (data) => {
      try {
        const { employeeId, reason } = data;
        
        const employee = await Employee.findById(employeeId);

        if (!employee) {
          return socket.emit('employee:rejectError', { error: 'Employee not found' });
        }

        // Notify the employee by their email (or user ID if they're connected)
        io.to(`user-${employeeId}`).emit('employee:rejected', {
          employeeId,
          email: employee.email,
          name: employee.name,
          reason: reason || 'Your account has been rejected.',
          message: 'Your account approval has been rejected.'
        });

        // Broadcast to admin
        io.to('admin').emit('employee:rejected', {
          type: 'rejection',
          employeeId,
          email: employee.email,
          name: employee.name,
          timestamp: new Date()
        });
      } catch (error) {
        socket.emit('employee:rejectError', { error: error.message });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (userId) {
        socket.leave(`user-${userId}`);
      }
      connectedUsers.delete(socket.id);
      broadcastPresenceUpdate(io);
      console.log(`✗ User disconnected: ${userId}`);
    });

    // Join user-specific room
    if (userId) {
      socket.join(`user-${userId}`);
    }
  });
};

// Update real-time statistics
const updateRealtimeStats = async (io, socket = null) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's attendance
    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    });

    const presentCount = todayAttendance.filter(a => a.status === 'present').length;
    const absentCount = todayAttendance.filter(a => a.status === 'absent').length;

    // Get pending leaves
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });

    // Get employees on leave today
    const onLeaveToday = await Leave.countDocuments({
      status: 'approved',
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    // Get total employees
    const totalEmployees = await Employee.countDocuments({ role: 'employee' });

    const stats = {
      totalEmployees,
      presentToday: presentCount,
      absentToday: absentCount,
      onLeaveToday,
      pendingLeaves,
      timestamp: new Date()
    };

    Object.assign(realtimeStats, stats);

    // Send to specific socket or broadcast
    if (socket) {
      socket.emit('stats:updated', stats);
    } else {
      io.emit('stats:updated', stats);
    }

  } catch (error) {
    console.error('Error updating statistics:', error);
  }
};

// Broadcast presence to all users
const broadcastPresenceUpdate = (io) => {
  const onlineUsers = Array.from(connectedUsers.values());
  io.emit('presence:updated', { onlineUsers });
};

module.exports = {
  initializeSocketHandlers,
  updateRealtimeStats,
  broadcastPresenceUpdate,
  getRealtimeStats: () => realtimeStats,
  getConnectedUsersCount: () => connectedUsers.size
};
