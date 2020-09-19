const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
const http = require('http').createServer(app);
const HTMLing = require('htmling');
import User from "./src/app/User";
import socketIORoutes from "./src/routes/socket-io";
import Host from "./src/app/Host";
import Room from "./src/app/Room";
import Player from "./src/app/Player";
var path = require('path');
var cookie = require("cookie"); // npm install --save cookies

declare global {
    namespace NodeJS {
        interface Global {
            io: any,
            host: Host
        }
    }
}
global.io = require('socket.io')(http);
global.host = new Host();

function checkOrSetCookie (req: any, res: any, next: any) {
    // check if client sent cookie
    var cookie = req.cookies.cookieName;
    if (cookie === undefined)
    {
      // no: set a new cookie
      var randomNumber=Math.random().toString();
      randomNumber=randomNumber.substring(2,randomNumber.length);
      res.cookie('cookieName',randomNumber, { maxAge: 900000, httpOnly: true });
      //console.log('cookie created successfully');
    } 
    else
    {
      // yes, cookie was already present 
      //console.log('cookie exists', cookie);
    } 
    next();
}

app.use(cookieParser());
app.use(checkOrSetCookie);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine('html', HTMLing.express(__dirname + '/views/', {watch: true}));
app.set('view engine', 'html');

app.use(express.static('../client'));

app.get('/', (req: any, res: any) => {
    res.sendFile('index.html');
});
app.get('/dev', (req: any, res: any) => {
    res.sendFile(path.resolve(__dirname + '/../client/index.html'));
});

var testRoom:{} = {
    players: {
        session_id_1: {
            cards: []
        },
        session_id_2: {
            cards: []
        },
    }
};

app.get('/dev/GameTableDev', (req: any, res: any) => {
    res.render("GameTableDev", {data: JSON.stringify(testRoom, null, "\t")});
});
app.post('/dev/GameTableDev', (req: any, res: any) => {
    testRoom = req.body.data
});

global.io.of("/dev").on("connect", function(socket:any) {
    let cookief = socket.handshake.headers.cookie; 
    let cookies = cookie.parse(socket.handshake.headers.cookie);  
    console.log(`Dev connection from cookie ${cookies.cookieName}`);
    let user = User.find(cookies.cookieName) || new User({id:cookies.cookieName, cardsPack:[]}); // disconnect = delete cookie
    user.setSocket(socket);
    if (socket.handshake.query.test && socket.handshake.query.test == "GameTableTestScene") {
        let room = Room.find("admin_room") || new Room({id:"admin_room"});
        let player = Player.find(user.getId()) || new Player(user);
        if (!room.hasPlayer(player)) {
            room.addPlayer(player);
        }
    }
    // room-ul ii transmite mesaj user-ului mesaj: please wait for opponent to enter in room
    // acelasi lucru se va intampla si de pe un alt browser (voi avea 2 admini)
    // cand user 2 intra in room, start 
});
global.io.on('connection', socketIORoutes); // socketIORoutes
// nu am treaba cu asta momentan

http.listen(3000, () => {
    console.log('Server started!');
});

/*

io.on connection
    actualizam datele de socket la user

    socket.on card player
        am socket... gaseste room-ul, gaseste player ul...

*/
