/* Single Thread, Event loop & Blocking code

NodeJS using only one sigle JavaScript thread(a process in operating system).
Evet loop is automatically get started when server starts.
Event loop keeps NodeJS running and hanldes the callbacks.
Event loop only handle(contain) callbacks that contain fast finishing code.

It has a certain order of the events:
1.At the beginning of each iteration, it checks if there are any Timers <---------| 
  (setTimeout(), setInterval() callbacks).                                        | (or jump to timer execution)
2.Next step it checks other Pending callbacks. <----------------------------------|
  (execute I/O (disk/networking/blocking) related, callbacks that were deferred). | (defer execution)
3.After finishing open callbacks it will go to the Poll face -------------------->|
  (retrieve new I/O events, execute their callbacks)
4.set immediate callbacks Check.
  (execute stImmediate() callbacks)
5.Close callbacks.
  (execute all 'close' event callbacks)

if there are no more registered callbacks to do, can use:
if refs == 0 then process.exit to finish and exit.
(not for server runs, but for other tasks based on NodeJS engine)

There is also a WorkerPool. That also start automatically by NodeJS.
Worker pool totally ditached from you JS code. And it runs on different threads.
This worker pool is doing all the heavy lifting.(e.g. big file operation).
Once a worker is done(e.g. reading file operation).
It will trigger a callback to the Event loop.
*/