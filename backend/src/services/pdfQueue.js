const logger = require('../utils/logger');

class TaskQueue {
  constructor() {
    this.queue = [];
    this.running = false;
  }

  /**
   * Add a task to the queue
   * @param {Function} taskFn - An async function that returns a Promise
   * @param {string} taskName - Friendly name of the task
   */
  enqueue(taskFn, taskName = 'anonymous task') {
    return new Promise((resolve, reject) => {
      this.queue.push({ taskFn, taskName, resolve, reject });
      logger.info(`Task enqueued: [${taskName}]. Current queue length: ${this.queue.length}`);
      this.runNext();
    });
  }

  async runNext() {
    if (this.running || this.queue.length === 0) {
      return;
    }

    this.running = true;
    const { taskFn, taskName, resolve, reject } = this.queue.shift();

    logger.info(`Starting execution of task: [${taskName}]`);
    try {
      const result = await taskFn();
      logger.info(`Task completed successfully: [${taskName}]`);
      resolve(result);
    } catch (error) {
      logger.error(`Error executing task: [${taskName}]`, error);
      reject(error);
    } finally {
      this.running = false;
      this.runNext();
    }
  }
}

module.exports = new TaskQueue();
