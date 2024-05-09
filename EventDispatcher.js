
import { Event } from './Event';


/**
 * EventDispatcher
 *
 * @export
 * @class EventDispatcher
 */
export class EventDispatcher {

    _events;

    constructor() {

        Object.defineProperty( this,"_events",{ enumerable: false } );  

        const propertyNames = Object.getOwnPropertyNames( Object.getPrototypeOf( this ) );

        for ( const propertyName of propertyNames ) {

            if ( propertyName.startsWith( Event.PREFIX ) ) {

                const eventNames = propertyName.split( Event.PREFIX );

                for ( let i = 1; i < eventNames.length; i++ ) {

                    const eventName = Event.PREFIX + eventNames[i];

                    this.addEventListener( eventName, this[propertyName].bind( this ) );
                
                }
            
            }
        
        }
    
    }

    hasEventListener( eventName ) {

        return Object.keys( this._events ).length > 0;
    
    }

    /**
     *
     *
     * @param {string} eventName
     * @param {function} func
     * @param {any=} context
     * @param {boolean} [isOnce=false]
     * @returns {EventDispatcher}
     * @memberof EventDispatcher
     */
    addEventListener( eventName, func, context = undefined, isOnce = false ) {

        this._events = this._events ?? {};
        this._events[eventName] = this._events[eventName] ?? [];
        this._events[eventName].push( [ func,context === undefined ? this : context,isOnce ] );

        return this;
    
    }

    /**
     *
     *
     * @param {string} eventName
     * @param {function} func
     * @param {any=} context
     * @param {boolean} [isOnce=false]
     * @returns {EventDispatcher}
     * @memberof EventDispatcher
     */
    addUniqueEventListener( eventName, func, context, isOnce = false ) {

        this.removeEventListener( eventName, func, context );
        return this.addEventListener( eventName, func, context, isOnce );

    }

    /**
     *
     *
     * @param {string} eventName
     * @param {function} func
     * @param {any=} context
     * @param {boolean} [isOnce=false]
     * @returns {EventDispatcher}
     * @memberof EventDispatcher
     */
    addWeakEventListener( eventName, func, context, isOnce = false ) {

        return this.addEventListener( eventName, func, new WeakRef( context ?? this ), isOnce );

    }
    
    /**
     *
     *
     * @param {Event|string} eventOrName
     * @param {object=} extendedValues
     * @returns {Event} event
     * @memberof EventDispatcher
     */
    dispatchEvent( eventOrName,extendedValues ) {

        let event;

        if ( typeof eventOrName == "string" ) {

            event = new Event( eventOrName );
        
        } else {

            event = eventOrName;
        
        }

        event.target = this;
        Object.assign( event,extendedValues );

        if ( this._events == null || this._events[event.name] == null ) return event;

        let calledListenerCount = 0;

        for ( let wildCardPhase = false, listeners = this._events[event.name]; wildCardPhase == false || this._events['*'] != null; listeners = this._events['*'],wildCardPhase = true ) {

            for ( let i = 0; i < listeners.length; i++ ) {

                const [listenerFunc,listenerContext,listenerIsOnce] = listeners[i];

                if ( listenerContext != null ) {

                    if ( listenerContext != null && listenerContext instanceof WeakRef ) {

                        const weakContext = listenerContext.deref();
                        
                        if ( weakContext === undefined ) {

                            listeners.splice( i, 1 );
                            i--;
                            continue;

                        } else {

                            listenerFunc.call( weakContext, event );

                        }

                    } else {

                        listenerFunc.call( listenerContext, event );

                    }
                
                } else {

                    listenerFunc( event );
                
                }
                calledListenerCount++;

                if ( listenerIsOnce ) {

                    listeners.splice( i, 1 );
                    i--;
                
                }

            }
        
        }
        event.callCount = calledListenerCount;

        return event;
    
    }

    /**
     *
     *
     * @param {string} eventName
     * @param {function} func
     * @param {any=} context
     * @returns {EventDispatcher}
     * @memberof EventDispatcher
     */
    removeEventListener( eventName, func, context = undefined ) {

        if ( this._events[eventName] == null ) return this;
        
        const listeners = this._events[eventName];

        for ( let i = 0; i < listeners.length; i++ ) {

            const [listenerFunc,listenerContext] = listeners[i];

            if ( listenerFunc == func ) {

                const targetContext = ( context === undefined ? this : context );

                if ( listenerContext == targetContext || ( listenerContext instanceof WeakRef && listenerContext.deref() == targetContext ) ) {

                    listeners.splice( i, 1 );
                    i--;

                }
            
            }

        }
        if ( listeners.length === 0 ) {

            delete this._events[eventName];
        
        }
   
        return this;

    }


    /**
     *
     *
     * @param {string=} eventName
     * @returns {EventDispatcher}
     * @memberof EventDispatcher
     */
    removeAllEventListeners( eventName ) {

        if ( eventName == null ) {

            this._events = null;
        
        } else if ( this._events[eventName] != null ) {

            this._events[eventName] = null;
        
        }

        return this;
    
    }

    /**
     *
     *
     * @param {string} eventName
     * @param {function} func
     * @param {any=} context
     * @returns {EventDispatcher}
     * @memberof EventDispatcher
     */
    on( eventName, func, context ) {

        return this.addEventListener( eventName, func, context );
    
    }

    
    /**
     *
     *
     * @param {string} eventName
     * @param {function} func
     * @param {any=} context
     * @returns {EventDispatcher} 
     * @memberof EventDispatcher
     */
    onWeak( eventName, func, context ) {

        return this.addWeakEventListener( eventName, func, context );
    
    }

    /**
     *
     *
     * @param {string} eventName
     * @param {function} [func]
     * @param {any} [context]
     * @returns {EventDispatcher|Promise<any>}
     * @memberof EventDispatcher
     */
    once( eventName, func, context ) {

        if ( func == null && context == null ) {
    
            return new Promise( ( resolve ) => {

                this.addEventListener( eventName, resolve, this, true );
            
            } );

        } else {

            return this.addEventListener( eventName, func, context,true );
        
        }
    
    }


    /**
     *
     *
     * @param {string} eventName
     * @param {function} func
     * @param {any=} context
     * @returns {EventDispatcher} 
     * @memberof EventDispatcher
     */
    off( eventName, func, context ) {
            
        return this.removeEventListener( eventName, func, context );

    }


    /**
     *
     *
     * @param {string} eventName
     * @returns {Promise<Event>} 
     * @memberof EventDispatcher
     */
    eventPromise( eventName ) {

        return new Promise( ( resolve, reject ) => {

            this.addEventListener( eventName, e =>{

                resolve( e );
            
            }, this, true );
        
        } );
    
    }

    /**
     *
     *
     * @param {string[]} eventNames
     * @returns {Promise<Event[]>} 
     * @memberof EventDispatcher
     */
    eventPromiseAll( eventNames ) {
            
        const promises = [];

        for ( const eventName of eventNames ) {

            promises.push( this.eventPromise( eventName ) );
        
        }

        return Promise.all( promises );
    
    }

}
