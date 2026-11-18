/**
 * Server-Sent Events (SSE) Manager
 * Manages real-time persistent HTTP streaming connections to authenticated clients.
 */
class SSEManager {
  constructor() {
    // Map of userId -> Set of express response objects
    this.clients = new Map();
    // Heartbeat timer reference
    this.heartbeatInterval = null;
    if (process.env.NODE_ENV !== 'test') {
      this.startHeartbeat();
    }
  }

  /**
   * Registers a new SSE client connection
   * @param {string} userId
   * @param {string} role
   * @param {import('express').Response} res
   */
  addClient(userId, role, res) {
    // Set mandatory SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering (Nginx, etc.)
    res.flushHeaders();

    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }

    // Attach metadata to the res object
    res.__userRole = role;
    this.clients.get(userId).add(res);

    // Send initial connection handshake event
    this.sendRaw(res, 'connected', {
      message: 'Connected to CCMMS Real-Time Notification Stream',
      userId,
      timestamp: new Date().toISOString()
    });

    // Cleanup on client disconnect
    res.on('close', () => {
      this.removeClient(userId, res);
    });
  }

  /**
   * Removes a closed connection
   */
  removeClient(userId, res) {
    if (this.clients.has(userId)) {
      const set = this.clients.get(userId);
      set.delete(res);
      if (set.size === 0) {
        this.clients.delete(userId);
      }
    }
  }

  /**
   * Sends an event to a single response stream
   */
  sendRaw(res, event, data) {
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      // Stream may have closed abruptly
    }
  }

  /**
   * Sends an event to a specific user (across all open tabs/devices)
   */
  sendToUser(userId, event, data) {
    const userClients = this.clients.get(userId);
    if (userClients && userClients.size > 0) {
      userClients.forEach((res) => this.sendRaw(res, event, data));
      return true;
    }
    return false;
  }

  /**
   * Sends an event to all connected users with a given role (e.g. 'admin' or 'staff')
   */
  sendToRole(role, event, data) {
    this.clients.forEach((clientSet) => {
      clientSet.forEach((res) => {
        if (res.__userRole === role) {
          this.sendRaw(res, event, data);
        }
      });
    });
  }

  /**
   * Broadcasts an event to every currently connected user
   */
  broadcastAll(event, data) {
    this.clients.forEach((clientSet) => {
      clientSet.forEach((res) => this.sendRaw(res, event, data));
    });
  }

  /**
   * Periodic keep-alive heartbeat ping every 25 seconds
   */
  startHeartbeat() {
    if (this.heartbeatInterval) return;
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((clientSet) => {
        clientSet.forEach((res) => {
          try {
            res.write(': keepalive-ping\n\n');
          } catch (_) {}
        });
      });
    }, 25000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  getActiveConnectionsCount() {
    let count = 0;
    this.clients.forEach((set) => {
      count += set.size;
    });
    return count;
  }
}

export const sseManager = new SSEManager();
export default sseManager;
