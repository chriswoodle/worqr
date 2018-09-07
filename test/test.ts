import { expect } from 'chai';

import { Worqr } from '../src';
import { QueueEvent } from '../src/types';

let worqr: Worqr;
let processName: string;

describe('Worqr', function () {
    it('should create a new Worqr instance', () => {
        worqr = new Worqr({
            host: process.env.REDIS_HOST as string,
            port: Number.parseInt(process.env.REDIS_PORT as string),
            password: process.env.REDIS_PASSWORD as string
        });

        expect(worqr).to.exist;
    });

    it('should clean up any existing workers', done => {
        worqr.cleanupWorkers()
            .then(() => done())
            .catch(done);
    });

    it('should enqueue three tasks to a queue', done => {
        Promise.resolve()
            .then(() => worqr.enqueue('queue1', 'task1'))
            .then(() => worqr.enqueue('queue1', 'task2'))
            .then(() => worqr.enqueue('queue1', 'task3'))
            .then(() => done())
            .catch(done);
    });

    it('should enqueue three tasks to a second queue', done => {
        Promise.resolve()
            .then(() => worqr.enqueue('queue2', 'task1'))
            .then(() => worqr.enqueue('queue2', 'task2'))
            .then(() => worqr.enqueue('queue2', 'task3'))
            .then(() => done())
            .catch(done);
    });

    it('should enqueue three tasks to a third queue', done => {
        Promise.resolve()
            .then(() => worqr.enqueue('queue3', 'task1'))
            .then(() => worqr.enqueue('queue3', 'task2'))
            .then(() => worqr.enqueue('queue3', 'task3'))
            .then(() => done())
            .catch(done);
    });

    it('should verify there are three queues', done => {
        worqr.getQueueNames()
            .then(queueNames => {
                expect(queueNames).to.include('queue1');
                expect(queueNames).to.include('queue2');
                expect(queueNames).to.include('queue3');
                done();
            })
            .catch(done);
    });

    it('should start the worker', done => {
        worqr.startWorker()
            .then(() => done())
            .catch(done);
    });

    it('should list all workers', done => {
        worqr.getWorkers()
            .then(workerNames => {
                expect(workerNames).to.have.lengthOf(1);
                expect(workerNames).to.include(worqr.getWorkerId());
                done();
            })
            .catch(done);
    });

    it('should fail to start task on the first queue', done => {
        worqr.startTask('queue1')
            .catch(() => done());
    });

    it('should start work on the first queue', done => {
        worqr.startWork('queue1')
            .then(() => done())
            .catch(done);
    });

    it('should indicate the worker is working on the first queue', done => {
        worqr.isWorking(worqr.getWorkerId(), 'queue1')
            .then(isWorking => {
                expect(isWorking).to.be.true;
                done();
            })
            .catch(done);
    });

    it('should get a list of queues the worker is working on', done => {
        worqr.getWorkingQueues(worqr.getWorkerId())
            .then(queueNames => {
                expect(queueNames).to.have.lengthOf(1);
                expect(queueNames).to.include('queue1');
                done();
            })
            .catch(done);
    });

    it('should ensure the first queue exists', done => {
        worqr.isQueue('queue1')
            .then(isQueue => {
                expect(isQueue).to.be.true;
                done();
            })
            .catch(done);
    });

    it('should ensure there are three tasks in the first queue', done => {
        worqr.getQueueCount('queue1')
            .then(count => {
                expect(count).to.equal(3);
                done();
            })
            .catch(done);
    });

    it('should peek the first queue', done => {
        worqr.peekQueue('queue1')
            .then(task => {
                expect(task).to.equal('task1');
                done();
            })
            .catch(done);
    });

    it('should list all the tasks in the first queue', done => {
        worqr.getQueueTasks('queue1')
            .then(tasks => {
                expect(tasks).to.have.lengthOf(3);
                expect(tasks).to.include('task1');
                expect(tasks).to.include('task2');
                expect(tasks).to.include('task3');
                done();
            })
            .catch(done);
    });

    it('should start a task on the first queue', done => {
        worqr.startTask('queue1')
            .then(process => {
                expect(process).to.exist;
                if (process) {
                    expect(process.processName).to.exist;
                    expect(process.task).to.exist;
                    expect(process.task).to.equal('task1');
                    processName = process.processName;
                }
                done();
            })
            .catch(done);
    });

    it('should get a list of running processes', done => {
        worqr.getProcesses()
            .then(processes => {
                expect(processes).to.have.lengthOf(1);
                done();
            })
            .catch(done);
    });

    it('should get a list of running processes on the queue', done => {
        worqr.getWorkingProcesses('queue1')
            .then(processes => {
                expect(processes).to.have.lengthOf(1);
                done();
            })
            .catch(done);
    });

    it('should get the task for the process', done => {
        worqr.getTask(processName)
            .then(task => {
                expect(task).to.equal('task1');
                done();
            })
            .catch(done);
    });

    it('should finish the process', done => {
        worqr.finishProcess(processName)
            .then(() => done())
            .catch(done);
    });

    it('should start another task', done => {
        worqr.startTask('queue1')
            .then(process => {
                expect(process).to.exist;
                if (process) {
                    expect(process.processName).to.exist;
                    expect(process.task).to.exist;
                    expect(process.task).to.equal('task2');
                    processName = process.processName;
                }
                done();
            })
            .catch(done);
    });

    it('should stop the process', done => {
        worqr.stopProcess(processName)
            .then(() => done())
            .catch(done);
    });

    it('should ensure there are two tasks in the first queue', done => {
        worqr.getQueueCount('queue1')
            .then(count => {
                expect(count).to.equal(2);
                done();
            })
            .catch(done);
    });

    it('should subscribe to the first queue, enqueue a task, and get a work event', done => {
        function listener(event: QueueEvent) {
            expect(event.type).to.equal('work');
            worqr.removeListener('queue1', listener);
            done();
        }

        worqr.addListener('queue1', listener);

        worqr.enqueue('queue1', 'task4')
            .catch(done);
    });

    it('should finish three tasks on the first queue', done => {
        Promise.resolve()
            .then(() => worqr.startTask('queue1'))
            .then(process => {
                expect(process).to.exist;
                if (process)
                    return worqr.finishProcess(process.processName);
                else
                    return Promise.resolve();
            })
            .then(() => worqr.startTask('queue1'))
            .then(process => {
                expect(process).to.exist;
                if (process)
                    return worqr.finishProcess(process.processName);
                else
                    return Promise.resolve();
            })
            .then(() => worqr.startTask('queue1'))
            .then(process => {
                expect(process).to.exist;
                if (process)
                    return worqr.finishProcess(process.processName);
                else
                    return Promise.resolve();
            })
            .then(() => done())
            .catch(done);
    });

    it('should ensure the first queue is empty', done => {
        worqr.isQueue('queue1')
            .then(isQueue => {
                expect(isQueue).to.be.false;
                done();
            })
            .catch(done);
    });

    it('should subscribe to the first queue, enqueue a task, cancel the task, receive a cancel event, and stop the process', done => {
        function listener(event: QueueEvent) {
            if (event.type === 'cancel') {
                Promise.resolve()
                    .then(() => worqr.getMatchingProcesses(event.message))
                    .then(processNames => processNames.map(processName => worqr.stopProcess(processName)))
                    .then(() => {
                        worqr.removeListener('queue1', listener);
                        done();
                    })
                    .catch(done);
            }
        }

        worqr.addListener('queue1', listener);

        Promise.resolve()
            .then(() => worqr.enqueue('queue1', 'task1'))
            .then(() => worqr.cancelTasks('queue1', 'task1'))
            .catch(done);
    });

    it('should subscribe to the first queue, delete the queue, and receive a delete event, and stop work on the queue', done => {
        function listener(event: QueueEvent) {
            if (event.type === 'delete') {
                worqr.stopWork('queue1')
                    .then(() => {
                        worqr.removeListener('queue1', listener);
                        done();
                    })
                    .catch(done);
            }
        }

        worqr.addListener('queue1', listener);

        worqr.deleteQueue('queue1')
            .catch(done);
    });

    it('should fail the worker', done => {
        worqr.failWorker()
            .then(() => done())
            .catch(done);
    });

    it('should delete the other two queues', done => {
        Promise.all([
            worqr.deleteQueue('queue2'),
            worqr.deleteQueue('queue3')
        ])
            .then(() => done())
            .catch(done);
    });
});
