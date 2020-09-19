import User from "./User";
import ICardData from "./ICardData";
import Card from "./Card";
import Room from "./Room";

/**
 * Player e de fapt user intrat intr-o camera
 */

export default class Player
{
    private static instances:{[key:string]:Player} = {};
    public static find(id:string) {
        return Player.instances[id];
    }

    private user:User; // in modul asta, user poate fi inlocuit oricand, in cazul in care se reconecteaza cu un alt socket id
    private cards:Array<Card>; // nu va avea cards in hand/cards in pack, ci doar cards, iar fiecare card va avea un state
    
    private room:Room|null = null;

    public getId():string {
        return this.user.getId();
    }
    public getSocket():any {
        return this.user.getSocket();
    }

    constructor(user:User) {
        this.user = user;
        this.cards = user.getCardsPack().map((cardData:ICardData) => Card.create(cardData));

        Player.instances[this.user.getId()] = this;
        console.log(`Player with id ${this.getId()} created`);
        this.io();
    }

    public setRoom(room:Room) {
        this.room = room;
    }

    private io() {
        console.log("setting up player io events");
        this.getSocket().on("gameTableSceneLoaded", () => {
            this.getSocket().emit("gameTableSceneData", this.room.getData())
            console.log(`Sending room data to player ${this.getId()}`);
        });
    }
}