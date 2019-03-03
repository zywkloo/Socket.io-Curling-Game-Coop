/*
(c) 2018 Louis D. Nel
This class represents a set of collisions between two Stones
Duplicate collisions are not added
Collisions are removed if the stones are no longer touching
or both stones have stopped moving
This class handles the redirecting the stones that collide using the
handleCollision() method
*/

class SetOfCollisions {
  constructor() {
    this.collisions = []
  }
  addCollision(aCollision) {
    //add aCollision if no current element equals aCollision
    let found = false
    for (let c of this.collisions) {
      if (c.equals(aCollision)) found = true
    }

    if (found === false) { //don't handle same collision twice
      this.collisions.push(aCollision)
      //console.log(`collision added ${this.collisions.toString()}`)
      this.handleCollision(aCollision) //redirect the colliding Balls
    }
  }

  addBalls(ball1, ball2) {
    this.addCollision(new Collision(ball1, ball2))
  }

  remove(aCollision) {
    //remove first occurence of element === x
    let position = this.collisions.indexOf(aCollision)
    if (position > -1) this.collisions.splice(position, 1)
  }

  removeOldCollisions() {
    let old = null
    for (let c of this.collisions) {
      if (!c.isTouching()) old = c
      if (!c.hasMovingBalls()) old = c
    }
    while (old !== null) {
      old = null
      for (let c of this.collisions) {
        if (!c.isTouching()) old = c
        if (!c.hasMovingBalls()) old = c
      }
      if (old != null) {
        this.remove(old)
        //console.log(`removing collision: `)
      }
    }
  }

  includesCollision(aCollision) {
    //answer whether set contains element === x
    for (let c of this.collisions) {
      if (c.equals(aCollision)) return true
    }
    return false
  }

  includesBalls(stone1, stone2) {
    let aCollision = new Collision(stone1, stone2)
    return this.includesCollision(aCollision)
  }

  toString() {
    return this.collection.toString()
  }

  handleCollision(aCollision) {
    //set the new velocities of the Balls in the collision c
    //Here are simplifying assumptions:
    //Ball 1 moving and strikes Ball2
    //disregard initial motion of Ball 2 --its probably stopped
    //if Ball 1 is going up, both will have upwards final velocity
    //if Ball 1 is going down, both should have downward velocity
    //if Ball 1 is going left it will bounce right & vice vera
    //Using these simplifications we do all the math in one quadrant
    //using absolute values and use Ball 1's initial directions to
    //set the directions for the final velocities

    let stone1 = aCollision.getStone1() //FOR NOW
    let stone2 = aCollision.getStone2()

    if (!stone1.isStoneMoving() && !stone2.isStoneMoving()) return

    let movingStone = stone1
    let otherStone = stone2

    if (stone2.getSpeed() >= stone1.getSpeed()) {
      movingStone = stone2
      otherStone = stone1
    }

    let speed = movingStone.getSpeed()

    let dx = Math.abs(otherStone.getLocation().x - movingStone.getLocation().x) //hor dist between balls
    let dy = Math.abs(otherStone.getLocation().y - movingStone.getLocation().y) //ver dist between balls

    distance = Math.sqrt(dx * dx + dy * dy)
    if (distance < 0.00001) return //cannot divide by 0

    //determine angle of line of impact with horizontal
    let angle_b = Math.asin(dy / distance)

    //determine angle of Ball 1 velocity with vertical
    let angle_d = Math.asin(Math.abs(movingStone.getVelocity().vx) / speed)

    //determine angle of movingBall velocity with line of impact
    let angle_a = (3.14159 / 2.0) - angle_b - angle_d

    //determine angle of Ball 1 departure with horizontal
    let angle_c = angle_b - angle_a

    //new velocity vectors;
    let v1 = speed * Math.abs(Math.sin(angle_a))
    let v2 = speed * Math.abs(Math.cos(angle_a))


    let v1x = v1 * Math.abs(Math.cos(angle_c))
    let v1y = v1 * Math.abs(Math.sin(angle_c))
    let v2x = v2 * Math.abs(Math.cos(angle_b))
    let v2y = v2 * Math.abs(Math.sin(angle_b))

    //set directions based on initial direction of hitting Ball
    //set horizontal directions
    if (movingStone.getVelocity().vx > 0) { //movingBall is going right
      if (movingStone.getLocation().x < otherStone.getLocation().x)
        v1x = -v1x
      else v2x = -v2x
    } else {
      if (movingStone.getLocation().x > otherStone.getLocation().x)
        v2x = -v2x
      else v1x = -v1x
    }

    //set vertical directions
    if (movingStone.getVelocity().vy > 0) { //ball1 is going right
      if (movingStone.getLocation().y < otherStone.getLocation().y)
        v1y = -v1y
      else v2y = -v2y
    } else {
      if (movingStone.getLocation().y > otherStone.getLocation().y)
        v2y = -v2y
      else v1y = -v1y
    }


   movingStone.setVelocity({vx: v1x, vy: v1y}) //set new velocities for Balls
   otherStone.setVelocity({vx: v2x, vy: v2y})

  }

  handleCollisions() {
    for (let collision of this.collisions) {
      this.handleCollision(collision)
    }
  }
}
