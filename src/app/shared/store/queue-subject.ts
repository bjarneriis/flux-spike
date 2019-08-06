import { Subject } from 'rxjs';

export class QueueSubject<T> extends Subject<T> {
    private busy = false;
    private queuedValues: T[] = [];

    next(value: T) {
        this.queuedValues.push(value);

        if (this.busy) {
            return;
        }

        this.busy = true;

        while (this.queuedValues.length > 0) {
            const nextValue = this.queuedValues.shift();
            super.next(nextValue);
        }

        this.busy = false;
    }
}
