import ICardData from "./ICardData";

/**
 * User devine player atunci cand intra intr-o camera
 */

export default class User 
{
    private static instances:{[key:string]:User} = {};
    public static find(id:string) {
        return User.instances[id];
    }

    private socket:any = null;
    private id:string;
    private cardsPack:Array<ICardData>;
    
    public getId():string {
        return this.id;
    }
    public getCardsPack():Array<ICardData> {
        return this.cardsPack;
    }
    public getSocket():any {
        return this.socket;
    }

    constructor(data:{id:string, cardsPack:Array<ICardData>}) {
        this.id = data.id;
        this.cardsPack = data.cardsPack;

        User.instances[this.id] = this;

        console.log(`User with id ${this.id} created`);
    }

    public setSocket(socket:any):void {
        if (this.socket) {
            //this.socket._events = socket._events;
        } else {
            this.socket = socket;
        }
    }
}