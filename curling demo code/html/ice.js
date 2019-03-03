/*
(c) 2018 Louis D. Nel
This class represents ice surface with the shooting and close up areas

Refactoring: TODO:
Currently the simpulatin uses a global co-ordinate system that includes
both the shooting area and the close-up area. This should be refactored to
provide each area with its own local co-ordiante system.

*/

const SHOOTING_AREA_FRACTION = 25/100 //fraction of canvas width taken up by shooting area
const SCORE_FONT_POINT_SIZE = 80 //point size for chord and lyric text
const SCORE_FONT = 'Courier New' //font for your editor -must be monospace font

class Ice {

  constructor(canvas) {
    this.x = 0
    this.y = 0
    this.width = canvas.width
    this.height = canvas.height

  }
  shootingAreaWidth(){
    return this.width*SHOOTING_AREA_FRACTION
  }
  shootingAreaHeight(){
    return this.height
  }
  closeUpAreaWidth(){
    return this.width - this.shootingAreaWidth()
  }

  getShootingArea(){
    return {
      x: this.x + this.closeUpAreaWidth(),
      y: this.y,
      width: this.shootingAreaWidth(),
      height: this.shootingAreaHeight()
    }
  }

  getShootingCrossHairArea(){
    const shootingArea = this.getShootingArea()
    const CROSSHAIR_BOTTOM_MARGIN = 140
    const CROSSHAIR_LEFT_MARGIN = 20
    const CROSSHAIR_AREA_HEIGHT = 60
    const CROSSHAIR_LINE_LENGTH = 10
    return {
      x: shootingArea.x + CROSSHAIR_LEFT_MARGIN,
      y: shootingArea.y + shootingArea.height - CROSSHAIR_BOTTOM_MARGIN -CROSSHAIR_AREA_HEIGHT,
      width: shootingArea.width - CROSSHAIR_LEFT_MARGIN*2,
      height: CROSSHAIR_AREA_HEIGHT
    }
  }


  isInShootingCrosshairArea(aLocation){
    //answer whether the point x,y lies within this Stone's area
    let cx = this.getShootingCrossHairArea()
    if(aLocation.x < cx.x) return false
    if(aLocation.x > cx.x + cx.width) return false
    if(aLocation.y < cx.y) return false
    if(aLocation.y > cx.y + cx.height) return false
    return true

  }

  getZoomFactor(){
    return this.closeUpAreaWidth()/this.shootingAreaWidth()
  }

  getCloseUpArea(){
    return {
      x:this.x,
      y:this.y,
      width: this.closeUpAreaWidth(),
      height: this.height
    }
  }

  ringThickness(){
    //base ring thickness as one tength of shooting area width
    return this.getShootingArea().width/10
  }
  ringCentre(){
    //centre point of shooting area rings
    return {x: this.getShootingArea().x + this.getShootingArea().width/2,
            y: this.ringThickness()*6
          }
  }

  nominalStoneRadius(){
    //base stone radius on ring thickness
    return this.ringThickness()/2
  }

  getCurrentScore(stones){
    /*
    Answer a score for the set of stones: stones.
    The score counts the number of stones of the same colour that
    lay closer to the centre than any of the opposing colour

    Returns an object {home:visitor:} one of who's property will be zero
    */
    let score = {home:0,visitor:0}
    let outerDistance = this.ringThickness()*5 //dist to just touch outer ring
    let centre = this.ringCentre()


    stones.getCollection().sort(function(stoneA, stoneB){
      /*
      Sort the stones collection based on how far the stones are from the target ringCentre
      Stone at index location 0 will be the closest.
      */
      if(stoneA.distanceToLocation(centre) < stoneB.distanceToLocation(centre)) return -1
      if(stoneA.distanceToLocation(centre) === stoneB.distanceToLocation(centre)) return 0
      if(stoneA.distanceToLocation(centre) > stoneB.distanceToLocation(centre)) return 1
    })

    let closestStone = stones.elementAt(0)
    let closestColour = closestStone.getColour()

    if(closestStone.distanceToLocation(centre) > outerDistance) return {home:0,visitor:0}
    let lyingStonesCount = 0
    for(let i = 0; i<stones.size(); i++){
      if(stones.elementAt(i).getColour() === closestColour) lyingStonesCount++
      else break
    }
    if(stones.elementAt(0).getColour() === HOME_COLOUR) return {home:lyingStonesCount, visitor:0}
    else if(stones.elementAt(0).getColour() === VISITOR_COLOUR) return {home:0, visitor:lyingStonesCount}
    else return {home: '0', visitor: '0'}
  }

  drawScore(context, score){
    let closeUpArea = this.getCloseUpArea()
    //draw score for home and visitor team.
    const HOME_SCORE_LEFT_MARGIN = 100
    const VISITOR_SCORE_RIGHT_MARGIN = 160
    const SCORE_TOP_MARGIN = 100
    const PROMPT_RECTANGLE_TOP_MARGIN = 20
    const PROMPT_RECTANGLE_WIDTH = 60
    const PROMPT_RECTANGLE_HEIGHT = 100

    //draw prompt rectangle around score to indicate which
    //colour stones this application can shoot.

    if(isClientFor(HOME_COLOUR)){
      let rect =  { x: closeUpArea.x + HOME_SCORE_LEFT_MARGIN,
            y: closeUpArea.y + PROMPT_RECTANGLE_TOP_MARGIN,
            width: PROMPT_RECTANGLE_WIDTH,
            height: PROMPT_RECTANGLE_HEIGHT
      }

      context.fillStyle = HOME_PROMPT_COLOUR
      context.fillRect(rect.x, rect.y, rect.width, rect.height)
    }
    if(isClientFor(VISITOR_COLOUR)){
      let rect =  { x: closeUpArea.x + closeUpArea.width - VISITOR_SCORE_RIGHT_MARGIN,
            y: closeUpArea.y + PROMPT_RECTANGLE_TOP_MARGIN,
            width: PROMPT_RECTANGLE_WIDTH,
            height: PROMPT_RECTANGLE_HEIGHT
      }

      context.fillStyle = VISITOR_PROMPT_COLOUR
      context.fillRect(rect.x, rect.y, rect.width, rect.height)
    }

    //draw the score of which team (HOME_COLOUR or VISITOR_COLOUR)
    //has stones lying closest to target circle

    context.font = '' + SCORE_FONT_POINT_SIZE + 'pt ' + SCORE_FONT
    context.strokeStyle = 'black'
    context.fillStyle = 'red'
    context.fillText(`${score.home}`, closeUpArea.x + HOME_SCORE_LEFT_MARGIN, closeUpArea.y + SCORE_TOP_MARGIN)
    context.strokeText(`${score.home}`, closeUpArea.x + HOME_SCORE_LEFT_MARGIN, closeUpArea.y + SCORE_TOP_MARGIN)
    context.strokeStyle = 'black'
    context.fillStyle = 'yellow'
    context.fillText(`${score.visitor}`, closeUpArea.x + closeUpArea.width - VISITOR_SCORE_RIGHT_MARGIN, closeUpArea.y + SCORE_TOP_MARGIN)
    context.strokeText(`${score.visitor}`, closeUpArea.x + closeUpArea.width - VISITOR_SCORE_RIGHT_MARGIN, closeUpArea.y + SCORE_TOP_MARGIN)

  }

  draw(context) {


    //draw dividing line between shooting area and closeup view area
    context.fillStyle = 'blue'
    context.strokeStyle = 'blue'

    context.beginPath()
    context.moveTo(this.closeUpAreaWidth(), 0)
    context.lineTo(this.closeUpAreaWidth(), this.height)
    context.stroke()

    //draw crosshair shooting area

    let cx = this.getShootingCrossHairArea()

    if(whosTurnIsIt === HOME_COLOUR) context.fillStyle = HOME_PROMPT_COLOUR
    else context.fillStyle = VISITOR_PROMPT_COLOUR

    context.strokeStyle = 'lightgray'
    context.fillRect(cx.x, cx.y, cx.width, cx.height)

    //draw shooting crosshair
    const CROSSHAIR_LINE_LENGTH = 20
    context.strokeStyle = 'gray'
    context.beginPath()
    context.moveTo(cx.x + cx.width/2 - CROSSHAIR_LINE_LENGTH/2, cx.y + cx.height/2)
    context.lineTo(cx.x + cx.width/2 + CROSSHAIR_LINE_LENGTH/2, cx.y + cx.height/2)
    context.stroke()
    context.beginPath()
    context.moveTo(cx.x + cx.width/2, cx.y + cx.height/2 - CROSSHAIR_LINE_LENGTH/2)
    context.lineTo(cx.x + cx.width/2 ,cx.y + cx.height/2 + CROSSHAIR_LINE_LENGTH/2)
    context.stroke()



    //draw blue ring
    context.beginPath()
    context.arc(
      this.ringCentre().x, //x co-ord
      this.ringCentre().y, //y co-ord
      this.ringThickness()*4, //radius
      0, //start angle
      2 * Math.PI //end angle
    )
    context.fillStyle = 'blue'
    context.strokeStyle = 'blue'
    context.fill()
    context.stroke()

    //draw closeup view blue ring

    context.beginPath()
    context.arc(
      this.getCloseUpArea().x + (this.ringCentre().x - this.getShootingArea().x)*this.getZoomFactor(), //x co-ord
      this.getCloseUpArea().y + (this.ringCentre().y - this.getShootingArea().y)*this.getZoomFactor(), //y co-ord
      this.ringThickness()*4*this.getZoomFactor(), //radius
      0, //start angle
      2 * Math.PI //end angle
    )
    context.fillStyle = 'blue'
    context.strokeStyle = 'blue'
    context.fill()
    context.stroke()


    //draw white ring
    context.beginPath()
    context.arc(
      this.ringCentre().x, //x co-ord
      this.ringCentre().y, //y co-ord
      this.ringThickness()*3, //radius
      0, //start angle
      2 * Math.PI //end angle
    )
    context.fillStyle = 'white'
    context.strokeStyle = 'white'
    context.fill()
    context.stroke()

    //draw closeup view white ring

    context.beginPath()
    context.arc(
      this.getCloseUpArea().x + (this.ringCentre().x - this.getShootingArea().x)*this.getZoomFactor(), //x co-ord
      this.getCloseUpArea().y + (this.ringCentre().y - this.getShootingArea().y)*this.getZoomFactor(), //y co-ord
      this.ringThickness()*3*this.getZoomFactor(), //radius
      0, //start angle
      2 * Math.PI //end angle
    )
    context.fillStyle = 'white'
    context.strokeStyle = 'white'
    context.fill()
    context.stroke()

    //draw red ring
    context.beginPath()
    context.arc(
      this.ringCentre().x, //x co-ord
      this.ringCentre().y, //y co-ord
      this.ringThickness()*2, //radius
      0, //start angle
      2 * Math.PI //end angle
    )
    context.fillStyle = 'red'
    context.strokeStyle = 'red'
    context.fill()
    context.stroke()

    //draw closeup view red ring

    context.beginPath()
    context.arc(
      this.getCloseUpArea().x + (this.ringCentre().x - this.getShootingArea().x)*this.getZoomFactor(), //x co-ord
      this.getCloseUpArea().y + (this.ringCentre().y - this.getShootingArea().y)*this.getZoomFactor(), //y co-ord
      this.ringThickness()*2*this.getZoomFactor(), //radius
      0, //start angle
      2 * Math.PI //end angle
    )
    context.fillStyle = 'red'
    context.strokeStyle = 'red'
    context.fill()
    context.stroke()

    //draw white centre
    context.beginPath()
    context.arc(
      this.ringCentre().x, //x co-ord
      this.ringCentre().y, //y co-ord
      this.ringThickness(), //radius
      0, //start angle
      2 * Math.PI //end angle
    )
    context.fillStyle = 'white'
    context.strokeStyle = 'white'
    context.fill()
    context.stroke()

    //draw closeup view white centre

    context.beginPath()
    context.arc(
      this.getCloseUpArea().x + (this.ringCentre().x - this.getShootingArea().x)*this.getZoomFactor(), //x co-ord
      this.getCloseUpArea().y + (this.ringCentre().y - this.getShootingArea().y)*this.getZoomFactor(), //y co-ord
      this.ringThickness()*this.getZoomFactor(), //radius
      0, //start angle
      2 * Math.PI //end angle
    )
    context.fillStyle = 'white'
    context.strokeStyle = 'white'
    context.fill()
    context.stroke()

    //draw circles crosshair
    context.strokeStyle = 'gray'
    context.beginPath()
    context.moveTo(this.ringCentre().x - this.ringThickness()*4.6, this.ringCentre().y)
    context.lineTo(this.ringCentre().x + this.ringThickness()*4.6, this.ringCentre().y)
    context.stroke()
    context.beginPath()
    context.moveTo(this.ringCentre().x, this.ringCentre().y - this.ringThickness()*4.6)
    context.lineTo(this.ringCentre().x, this.ringCentre().y + this.ringThickness()*4.6)
    context.stroke()

    //draw closeup view circles crosshair
    let chx = this.getCloseUpArea().x + (this.ringCentre().x - this.getShootingArea().x)*this.getZoomFactor()
    let chy = this.getCloseUpArea().y + (this.ringCentre().y - this.getShootingArea().y)*this.getZoomFactor()
    context.strokeStyle = 'gray'
    context.beginPath()
    context.moveTo(chx - this.ringThickness()*4.6*this.getZoomFactor(), chy)
    context.lineTo(chx + this.ringThickness()*4.6*this.getZoomFactor(), chy)
    context.stroke()
    context.beginPath()
    context.moveTo(chx, chy - this.ringThickness()*4.6*this.getZoomFactor())
    context.lineTo(chx, chy + this.ringThickness()*4.6*this.getZoomFactor())
    context.stroke()


  }
}
