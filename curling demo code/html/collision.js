/*
(c) 2018 Louis D. Nel
This class represents a collision between two Stones
*/

class Collision {

  constructor(stone1, stone2) {
    this.stone1 = stone1
    this.stone2 = stone2
  }

  getStone1(){return this.stone1}
  getStone2(){return this.stone2}

  includes(aStone) {
    //answer whether collsion contains aBall
    if (aStone === this.stone1) return true
    if (aStone === this.stone2) return true
    return false
  }

  equals(aCollision) {
    //answer whether this collision is equal to aCollision.
    //two collision objects are equal if they contain the same balls
    return (aCollision.includes(this.stone1) && aCollision.includes(this.stone2))
  }

  isTouching(){
    return this.stone1.isTouching(this.stone2)
  }
  hasMovingBalls(){
    return this.stone1.isStoneMoving() ||this.stone2.isStoneMoving()
  }

  toString() {
    return `Collsion: ${this.stone1} with ${this.stone2}`
  }
}
