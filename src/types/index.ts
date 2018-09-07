/**
 * Options for Redis connection.
 */
export interface RedisOptions {
    host: string;
    port: number;
    password?: string;
}

/**
 * Options for the Worqr instance.
 */
export interface WorqrOptions {
    redisKeyPrefix?: string;
    instanceId?: string;
    workerHeartbeatInterval?: number;
    workerTimeout?: number;
    workerCleanupInterval?: number;
    digestBiteSize?: number;
}

/**
 * Represents a process started by a worker.
 */
export interface Process {
    id: string;
    task: string;
}

/**
 * Event emitted by a queue.
 */
export interface QueueEvent {
    type: QueueEventType;
    message: string;
}

/**
 * Specifies what kind of event the queue event is.
 */
export type QueueEventType = 'work' | 'cancel' | 'delete';