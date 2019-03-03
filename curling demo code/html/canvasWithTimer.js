/*
Client-side javascript for 2406 collision geometry demo
(c) Louis D. Nel 2018

This demonstration provides a client-side only application. In this
demonstration the server is used only to serve the application to the client.
Once the application is running on the client the server is no longer involved.

This demonstration is a simulation of collisions based on the game of curling.
Collision dynamics is based on simple geometry (not physics).
Collision events are modelled using a Collision object and these objects are
placed in a Collsion set. This approach is to provide "Debouncing" and to
handle the "Tunneling Problem" common in such simulations.

There are many refactoring opportunies in this code including the following:

1)The shooting area and closeup area share a global co-ordinate system.
It would be better if each has its own local co-ordinate system.

2)Most objects are represented through an ES6 Class. However the main level
canvasWithTimer.js code is not. It would be better for the main level code
to also be represented through a class.

3)The constants and state variables a still a bit scattered through the code
It would be better to centralize them a bit more to re-enforced the MVC
model-view-controller pattern.

4)The code does not take advantage of closures. In many cases parameters
are being passed around which might be made accessible through closures.

5) The code does not take advantage of any modularization features of ES6
nor does it take particular advantage of closures.
Instead the .html file simply includes a <script></script> statement for each
required file. No attempt is made to bundle the files.
*/

//leave this moving word for fun and for using it to
//provide status info to client.
let movingString = {
  word: "Moving",
  x: 100,
  y: 100,
  xDirection: 1, //+1 for rightwards, -1 for leftwards
  yDirection: 1, //+1 for downwards, -1 for upwards
  stringWidth: 50, //will be updated when drawn
  stringHeight: 24
} //assumed height based on drawing point size

let timer //timer for animating motion
let canvas = document.getElementById('canvas1') //our drawing canvas
let iceSurface = new Ice(canvas)

allStones = new SetOfStones() //set of all stones. sorted by lying score
homeStones = new SetOfStones() //set of home stones in no particular order
visitorStones = new SetOfStones() //set of visitor stones in no particular order
shootingQueue = new Queue() //queue of stones still to be shot
let shootingArea = iceSurface.getShootingArea()
let stoneRadius = iceSurface.nominalStoneRadius()

//create stones
for(let i=0; i<STONES_PER_TEAM; i++){
  let homeStone = new Stone(0, 0, stoneRadius, HOME_COLOUR)
  let visitorStone = new Stone(0, 0, stoneRadius, VISITOR_COLOUR)
  homeStones.add(homeStone)
  visitorStones.add(visitorStone)
  allStones.add(homeStone)
  allStones.add(visitorStone)
}


function stageStones(){
  //stage the stones in the shooting area by lining them vertically on either side
  //add stones to the shooting order queue based on the value
  //of whosTurnIsIt state variable

  if(whosTurnIsIt === HOME_COLOUR){
    for(let i=0; i<STONES_PER_TEAM; i++){
      shootingQueue.enqueue(homeStones.elementAt(i))
      shootingQueue.enqueue(visitorStones.elementAt(i))
      homeStones.elementAt(i).setLocation({x:shootingArea.x + stoneRadius, y:shootingArea.height - (stoneRadius + (STONES_PER_TEAM-i-1)*stoneRadius*2)})
      visitorStones.elementAt(i).setLocation({x:shootingArea.x + shootingArea.width - stoneRadius, y:shootingArea.height - (stoneRadius + (STONES_PER_TEAM-i-1)*stoneRadius*2)})

    }
  }
  else {
    for(let i=0; i<STONES_PER_TEAM; i++){
      shootingQueue.enqueue(visitorStones.elementAt(i))
      shootingQueue.enqueue(homeStones.elementAt(i))
      homeStones.elementAt(i).setLocation({x:shootingArea.x + stoneRadius, y:shootingArea.height - (stoneRadius + (STONES_PER_TEAM-i-1)*stoneRadius*2)})
      visitorStones.elementAt(i).setLocation({x:shootingArea.x + shootingArea.width - stoneRadius, y:shootingArea.height - (stoneRadius + (STONES_PER_TEAM-i-1)*stoneRadius*2)})
    }

  }
}

stageStones()

//console.log(`stones: ${allStones.toString()}`)

let setOfCollisions = new SetOfCollisions()

let stoneBeingShot = null //Stone instance: stone being shot with mouse
let shootingCue = null //Cue instance: shooting cue used to shoot ball with mouse


let fontPointSize = 18 //point size for chord and lyric text
let editorFont = 'Courier New' //font for your editor -must be monospace font

function distance(fromPoint, toPoint) {
  //point1 and point2 assumed to be objects like {x:xValue, y:yValue}
  //return "as the crow flies" distance between fromPoint and toPoint
  return Math.sqrt(Math.pow(toPoint.x - fromPoint.x, 2) + Math.pow(toPoint.y - fromPoint.y, 2))
}

function drawCanvas() {

  const context = canvas.getContext('2d')

  context.fillStyle = 'white'
  context.fillRect(0, 0, canvas.width, canvas.height) //erase canvas


  //draw playing surface
  iceSurface.draw(context, whosTurnIsIt)

  context.font = '' + fontPointSize + 'pt ' + editorFont
  context.strokeStyle = 'blue'
  context.fillStyle = 'red'

  //used for debugging. No used in the simulation
  movingString.stringWidth = context.measureText(movingString.word).width
  context.fillText(movingString.word, movingString.x, movingString.y)

  //draw the stones
  allStones.draw(context, iceSurface)
  if (shootingCue != null) shootingCue.draw(context)

  //draw the score (as topmost feature).
  iceSurface.drawScore(context, score)
}

function getCanvasMouseLocation(e) {
  //provide the mouse location relative to the upper left corner
  //of the canvas

  /*
  This code took some trial and error. If someone wants to write a
  nice tutorial on how mouse-locations work that would be great.
  */
  let rect = canvas.getBoundingClientRect()

  //account for amount the document scroll bars might be scrolled
  let scrollOffsetX = $(document).scrollLeft()
  let scrollOffsetY = $(document).scrollTop()

  let canX = e.pageX - rect.left - scrollOffsetX
  let canY = e.pageY - rect.top - scrollOffsetY

  return {
    x: canX,
    y: canY
  }
}

function handleMouseDown(e) {
  if(enableShooting === false) return //cannot shoot when stones are in motion
  if(!isClientFor(whosTurnIsIt)) return //only allow controlling client

  let canvasMouseLoc = getCanvasMouseLocation(e)
  let canvasX = canvasMouseLoc.x
  let canvasY = canvasMouseLoc.y
  //console.log("mouse down:" + canvasX + ", " + canvasY)

  stoneBeingShot =allStones.stoneAtLocation(canvasX, canvasY)

  if(stoneBeingShot === null){
    if(iceSurface.isInShootingCrosshairArea(canvasMouseLoc)){
      if(shootingQueue.isEmpty()) stageStones()
      //console.log(`shooting from crosshair`)
      stoneBeingShot = shootingQueue.front()
      stoneBeingShot.setLocation(canvasMouseLoc)
      //we clicked near the shooting crosshair
    }
  }

  if (stoneBeingShot != null) {
    shootingCue = new Cue(canvasX, canvasY)
    $("#canvas1").mousemove(handleMouseMove)
    $("#canvas1").mouseup(handleMouseUp)
  }

  // Stop propagation of the event and stop any default
  //  browser action
  e.stopPropagation()
  e.preventDefault()

  drawCanvas()
}

function handleMouseMove(e) {


  let canvasMouseLoc = getCanvasMouseLocation(e)
  let canvasX = canvasMouseLoc.x
  let canvasY = canvasMouseLoc.y

  //console.log("mouse move: " + canvasX + "," + canvasY)

  if (shootingCue != null) {
    shootingCue.setCueEnd(canvasX, canvasY)
  }

  e.stopPropagation()

  drawCanvas()
}

function handleMouseUp(e) {
  //console.log("mouse up")
  e.stopPropagation()
  if (shootingCue != null) {
    let cueVelocity = shootingCue.getVelocity()
    if (stoneBeingShot != null) stoneBeingShot.addVelocity(cueVelocity)
    shootingCue = null
    shootingQueue.dequeue()
    enableShooting = false //disable shooting until shot stone stops
  }

  //remove mouse move and mouse up handlers but leave mouse down handler
  $("#canvas1").off("mousemove", handleMouseMove) //remove mouse move handler
  $("#canvas1").off("mouseup", handleMouseUp) //remove mouse up handler

  drawCanvas() //redraw the canvas
}


function handleTimer() {
  movingString.x = (movingString.x + 1 * movingString.xDirection)
  movingString.y = (movingString.y + 1 * movingString.yDirection)

  allStones.advance(iceSurface.getShootingArea())
  for (let stone1 of allStones.getCollection()) {
    for (let stone2 of allStones.getCollection()) {
      //check for possible collisions
      if ((stone1 !== stone2) && stone1.isTouching(stone2) && (stone1.isStoneMoving() || stone2.isStoneMoving())) setOfCollisions.addCollision(new Collision(stone1, stone2))
    }
  }

  setOfCollisions.removeOldCollisions()

  if(allStones.isAllStonesStopped()){
    if(!shootingQueue.isEmpty()) whosTurnIsIt = shootingQueue.front().getColour()
    score = iceSurface.getCurrentScore(allStones)
    enableShooting = true
  }

  //keep moving string within canvas bounds
  if (movingString.x + movingString.stringWidth > canvas.width) movingString.xDirection = -1
  if (movingString.x < 0) movingString.xDirection = 1
  if (movingString.y > canvas.height) movingString.yDirection = -1
  if (movingString.y - movingString.stringHeight < 0) movingString.yDirection = 1

  drawCanvas()
}

//KEY CODES
//should clean up these hard coded key codes
const ENTER = 13
const RIGHT_ARROW = 39
const LEFT_ARROW = 37
const UP_ARROW = 38
const DOWN_ARROW = 40

function handleKeyDown(e) {
  //console.log("keydown code = " + e.which );
  let keyCode = e.which
  if (keyCode == UP_ARROW | keyCode == DOWN_ARROW) {
    //prevent browser from using these with text input drop downs
    e.stopPropagation()
    e.preventDefault()
  }
}

function handleKeyUp(e) {
  //console.log("key UP: " + e.which);
  if (e.which == RIGHT_ARROW | e.which == LEFT_ARROW | e.which == UP_ARROW | e.which == DOWN_ARROW) {
    //do nothing for now
  }

  if (e.which == ENTER) {
    handleSubmitButton() //treat ENTER key like you would a submit
    $('#userTextField').val('') //clear the user text field
  }

  e.stopPropagation()
  e.preventDefault()
}

function handleSubmitButton() {

  let userText = $('#userTextField').val() //get text from user text input field
  //clear lines of text in textDiv
  let textDiv = document.getElementById("text-area")
  textDiv.innerHTML = ''

  if (userText && userText !== '') {
    let userRequestObj = {
      text: userText
    }
    let userRequestJSON = JSON.stringify(userRequestObj)
    $('#userTextField').val('') //clear the user text field

    //alert ("You typed: " + userText);
    $.post("post_data", userRequestJSON, function(data, status) {
      console.log("data: " + data)
      console.log("typeof: " + typeof data)
      let responseObj = data
      movingString.word = responseObj.text
    })
  }
}

function handleJoinAsHomeButton(){
  console.log(`handleJoinAsHomeButton()`)
  let btn = document.getElementById("JoinAsHomeButton")
  btn.disabled = true //disable button
  btn.style.backgroundColor="lightgray"
  if(!isHomePlayerAssigned){
    isHomePlayerAssigned = true
    isHomeClient = true
  }

}
function handleJoinAsVisitorButton(){
  console.log(`handleJoinAsVisitorButton()`)
  let btn = document.getElementById("JoinAsVisitorButton")
  btn.disabled = true //disable button
  btn.style.backgroundColor="lightgray"

  if(!isVisitorPlayerAssigned) {
    isVisitorPlayerAssigned = true
    isVisitorClient = true
  }
}
function handleJoinAsSpectatorButton(){
  console.log(`handleJoinAsSpectatorButton()`)
  let btn = document.getElementById("JoinAsSpectatorButton")
  btn.disabled = true //disable button
  btn.style.backgroundColor="lightgray"

  if(!isSpectatorClient) isSpectatorClient = true

}

$(document).ready(function() {
  //This is called after the browswer has loaded the web page

  //add mouse down listener to our canvas object
  $("#canvas1").mousedown(handleMouseDown)

  //add key handler for the document as a whole, not separate elements.
  $(document).keydown(handleKeyDown)
  $(document).keyup(handleKeyUp)

  timer = setInterval(handleTimer, 5) //animation timer
  //clearTimeout(timer); //to stop timer

  let btn = document.getElementById("JoinAsHomeButton")
  btn.disabled = false //enable button
  btn.style.backgroundColor = HOME_PROMPT_COLOUR
  btn = document.getElementById("JoinAsVisitorButton")
  btn.disabled = false //enable button
  btn.style.backgroundColor= VISITOR_PROMPT_COLOUR
  btn = document.getElementById("JoinAsSpectatorButton")
  btn.disabled = false //enable button
  btn.style.backgroundColor= SPECTATOR_PROMPT_COLOUR



  drawCanvas()
})
