
/** @typedef {import("./EventDispatcher").EventDispatcher} EventDispatcher */

const PREFIX = "🚩";

/**
 * 
 * @class Event
  */
export class Event {

    static nextId = 0;

    static PREFIX = PREFIX;

    target;
    callCount;


    /**
     *Creates an instance of Event.
     * @param {string|Event} [nameOrEvent]
     * @param {object} [extendedValues]
     * @memberof Event
     */
    constructor( nameOrEvent, extendedValues ) {

        if ( typeof nameOrEvent === 'object' ) {

            Object.assign( this,nameOrEvent );
        
        }
        if ( extendedValues ) {

            Object.assign( this, extendedValues );
        
        }
        if ( typeof nameOrEvent === 'string' && nameOrEvent.length > 0 ) {

            this.name = nameOrEvent;
                
        } else {

             this.name = Event.PREFIX + "unnamed" + ( ++Event.nextId )

        }
    
    }
    
    stopPropagation() {

        this.stopped = true;
    
    }

    setResult( result, id ) {
    
        this.result = result;
        
        // @ts-ignore
        this.resultDetails ??= {};

        // @ts-ignore
        id ??= Object.keys( this.resultDetails ).length;

        // @ts-ignore
        this.resultDetails[id] = result;

    }

    getCallCount() {

        // @ts-ignore
        return this.callCount ?? 0;

    }


    getTarget() {

        // @ts-ignore
        return this.target;
    
    }

    getResult( id ) {
        
        // @ts-ignore
        return id == null ? this.result : this.resultDetails[id];

    }

}

