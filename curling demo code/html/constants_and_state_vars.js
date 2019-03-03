/*
constants and state variables used to model the curling collision simulation
*/

const STONES_PER_TEAM = 4 //number of stones per team
const HOME_COLOUR = 'red' //represents both the actual colour and identifier for home stones
const VISITOR_COLOUR = 'yellow' //represents both the actual colour and identifier for visitor stones
const HOME_PROMPT_COLOUR = '#ffcccc' //colour to prompt home player (e.g. colour buttons)
const VISITOR_PROMPT_COLOUR = '#ffffcc' //colour to prompt home player (e.g. colour buttons)
const SPECTATOR_PROMPT_COLOUR = '#ccffcc' //colour to prompt spectator client (e.g. colour buttons)

let whosTurnIsIt = HOME_COLOUR //who shoots next, or starts an end
let enableShooting = true //false when stones are in motion
let score = {home: 0, visitor: 0} //updated to reflect how stones lie

let isHomePlayerAssigned = false //true when a player (client) is assigned to HOME_COLOUR
let isVisitorPlayerAssigned = false //true when a player (client) is assigned to VISITOR_COLOUR

let isHomeClient = false //true when this client application can control (e.g. shoot) HOME_COLOUR stones
let isVisitorClient = false //true when this client application can control (e.g. shoot) VISITOR_COLOUR stones
let isSpectatorClient = false //true when this client application is a spectator

let allStones = null //set of all stones. sorted periodically by lying score distance
let homeStones = null //set of home stones in no particular order
let visitorStones = null //set of visitor stones in no particular order
let shootingQueue = null //queue of stones still to be shot during game round, or "end"

function isClientFor(stoneColour){
  //answer whether this client can control (e.g. shoot) stoneColour
  if(stoneColour === HOME_COLOUR && isHomeClient === true) return true
  if(stoneColour === VISITOR_COLOUR && isVisitorClient === true) return true
  return false

}
