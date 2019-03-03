/*
(c) 2018 Louis D. Nel
This class represents a ball like a pool, or billiard, ball

*/
const OUTER_SHADOW_OFFSET = 2 //pixels
const INNER_SHADOW_OFFSET = 1 //pixels

class Stone {
  constructor(x,y, radius, colour){
    this.x = x  //x location of centre
    this.y = y  //y location of centre
    this.radius = radius
    this.colour = colour
    this.velocityX = 0
    this.velocityY = 0
    this.isMoving = false
  }
  static FRICTION_FACTOR(){return 0.995} //multiplier to slow velocity
  static COLOUR(){return 'red'}
  static OUTERCOLOUR() {return 'gray'}
  static SHADOWCOLOUR() {return 'black'}

  draw(context, ice){
    //context provides the graphical context for drawing
    //ice provides the co-ordinate system for shooting and closeup view areas

    //draw outer stone coloured circle
    context.beginPath()
    context.arc(
      this.x, //x co-ord
      this.y, //y co-ord
      this.radius, //radius
      0, //start angle
      2 * Math.PI //end angle
    )
    context.fillStyle = Stone.OUTERCOLOUR()
    context.strokeStyle = Stone.OUTERCOLOUR()
    context.fill()
    context.stroke()

    //draw inner coloured circle
    context.beginPath()
    context.arc(
      this.x, //x co-ord
      this.y, //y co-ord
      this.radius/2, //radius
      0, //start angle
      2 * Math.PI //end angle
    )
    context.fillStyle = this.colour
    context.strokeStyle = this.colour
    context.fill()
    context.stroke()


    //draw closeup view of stone

    //draw outer stone shadow circle
    context.beginPath()
    context.arc(
      ice.getCloseUpArea().x + (this.x - ice.getShootingArea().x)*ice.getZoomFactor() + OUTER_SHADOW_OFFSET, //x co-ord
      ice.getCloseUpArea().y + (this.y - ice.getShootingArea().y)*ice.getZoomFactor() + OUTER_SHADOW_OFFSET, //y co-ord
      this.radius*ice.getZoomFactor(), //radius
      0, //start angle
      2 * Math.PI //end angle
    )
    context.fillStyle = Stone.SHADOWCOLOUR()
    context.strokeStyle = Stone.SHADOWCOLOUR()
    context.fill()
    context.stroke()
    //draw outer stone coloured circle
    context.beginPath()
    context.arc(
      ice.getCloseUpArea().x + (this.x - ice.getShootingArea().x)*ice.getZoomFactor(), //x co-ord
      ice.getCloseUpArea().y + (this.y - ice.getShootingArea().y)*ice.getZoomFactor(), //y co-ord
      this.radius*ice.getZoomFactor(), //radius
      0, //start angle
      2 * Math.PI //end angle
    )
    context.fillStyle = Stone.OUTERCOLOUR()
    context.strokeStyle = Stone.OUTERCOLOUR()
    context.fill()
    context.stroke()

    //draw inner coloured shadow circle
    context.beginPath()
    context.arc(
      ice.getCloseUpArea().x + (this.x - ice.getShootingArea().x)*ice.getZoomFactor() + INNER_SHADOW_OFFSET, //x co-ord
      ice.getCloseUpArea().y + (this.y - ice.getShootingArea().y)*ice.getZoomFactor() + INNER_SHADOW_OFFSET, //y co-ord
      this.radius/2*ice.getZoomFactor(), //radius
      0, //start angle
      2 * Math.PI //end angle
    )
    context.fillStyle = Stone.SHADOWCOLOUR()
    context.strokeStyle = Stone.SHADOWCOLOUR()
    context.fill()
    context.stroke()

    //draw inner coloured circle
    context.beginPath()
    context.arc(
      ice.getCloseUpArea().x + (this.x - ice.getShootingArea().x)*ice.getZoomFactor(), //x co-ord
      ice.getCloseUpArea().y + (this.y - ice.getShootingArea().y)*ice.getZoomFactor(), //y co-ord
      this.radius/2*ice.getZoomFactor(), //radius
      0, //start angle
      2 * Math.PI //end angle
    )
    context.fillStyle = this.colour
    context.strokeStyle = this.colour
    context.fill()
    context.stroke()
  }
  getColour(){return this.colour}
  getRadius(){return this.radius}
  getLocation(){return {x:this.x, y:this.y}}
  setLocation(aLocation){this.x = aLocation.x; this.y = aLocation.y}
  getVelocity(){return {vx: this.velocityX, vy: this.velocityY}}
  setVelocity(aVelocity){this.velocityX = aVelocity.vx; this.velocityY = aVelocity.vy}
  getSpeed(){
    return Math.sqrt(Math.pow(this.getVelocity().vx, 2) + Math.pow(this.getVelocity().vy, 2))
  }
  isStoneMoving(){return this.isMoving}
  isStoneStopped(){return !this.isMoving()}

  toString(){return `stone: ${this.x}, ${this.y}`}

  stop(){
    this.velocityX = 0
    this.velocityY = 0
    this.isMoving = false
  }
  addVelocity(aVelocity){
    //aVelocity is assumed to be {vx: xVelValue, vy: yVelValue}
    this.velocityX += aVelocity.vx
    this.velocityY += aVelocity.vy
  }
  isTouching(aBall){
    //Answer whether this ball is touching aBall
    //answer whether the point x,y lies within this Stone's area
    let distanceBetweenCentres = Math.sqrt(Math.pow(this.x - aBall.x, 2) + Math.pow(this.y - aBall.y, 2))
    return distanceBetweenCentres <= this.getRadius() + aBall.getRadius()
  }
  
  distanceToLocation(aLocation){
    return Math.sqrt(Math.pow(this.x - aLocation.x, 2) + Math.pow(this.y - aLocation.y, 2))
  }

  isMoving(){
    return isMoving
  }
  advance(area){
    /*
    area = {x,y,width,height}
    Advance this ball based on its position and velocity. Keep it within the
    area bounds by bouncing off the area borders.
    */
    //move ball position based on current velocity
    this.x += this.velocityX
    this.y += this.velocityY
    //slow moving ball based on friction
    this.velocityX *= Stone.FRICTION_FACTOR()
    this.velocityY *= Stone.FRICTION_FACTOR()

    //keep moving string within area bounds
    if (this.x + this.radius > area.x + area.width) {this.x = area.x + area.width -this.radius; this.stop()}
    if (this.x - this.radius < area.x) {this.x = area.x + this.radius; this.stop()}
    if (this.y + this.radius> area.height) {this.y = area.height - this.radius; this.stop()}
    if (this.y - this.radius < area.y) {this.y = area.y + this.radius; this.stop()}


    //stop if both x and y velocity is sufficiently small.
    const TOLERENCE = 0.12
    if(Math.abs(this.velocityX) < TOLERENCE && Math.abs(this.velocityY) < TOLERENCE)
       this.stop()
    else
       this.isMoving = true
  }

  containsPoint(x,y){
    //answer whether the point x,y lies within this Stone's area
    let distance = Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2))
    return distance <= this.radius
  }

  containsLocation(aLocation){
    //aLocation assumed to be {x: xValue, y: yValue}
    return this.containsPoint(aLocation.x, aLocation.y)
  }
}
