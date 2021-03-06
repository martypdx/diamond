export default class Observable {
    constructor(value) {
        this.value = value;
        this.subscribers = null;
    }

    get firstValue() {
        return this.value;
    }

    subscribe(subscriber) {
        if(!this.subscribers) {
            this.subscribers = subscriber;
        } 
        else if(Array.isArray(this.subscribers)) {
            this.subscribers.push(subscriber);
        }
        else {
            this.subscribers = [this.subscribers, subscriber];
        }

        subscriber(this.firstValue);

        return {
            unsubscribe: () => {
                this.unsubscribe(subscriber);
            }
        };
    }

    destroy() {
        this.subscribers = null;
    }

    unsubscribe(subscriber) {
        const { subscribers } = this;        
        if(!subscribers) return;
        else if(Array.isArray(subscribers)) {
            const index = subscribers.indexOf(subscriber);
            if(index > -1) subscribers.splice(index, 1);
        }
        else {
            this.subscribers = null;
        }    
    }

    next(value) {
        if(this.value === value) return;
        this.value = value;
        
        const { subscribers } = this;
        if(!subscribers) return;
        else if(Array.isArray(subscribers)) {
            for(let i = 0; i < subscribers.length; i++) {
                subscribers[i](value);
            }
        }
        else {
            subscribers(value);
        }      
    }

    child(prop) {
        const val = this.value;
        const subject = new Observable(val ? val[prop] : undefined);
        this.subscribe(val => subject.next(val ? val[prop] : undefined));
        return subject;
    }
}