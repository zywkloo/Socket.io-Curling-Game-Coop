/*
  (c) 2018 Louis D. Nel
  This class represents a collection of ball objects
*/

class SetOfStones {
  //let collection = []  //NOT ALLOWED WITH CLASSES
  constructor() {
    this.collection = []
  }

  getCollection(){return this.collection}

  size(){return this.collection.length}

  add(aStone) {
    //add element x if no current element === x
    if (this.collection.indexOf(aStone) < 0) this.collection.push(aStone)
  }
  addAll(aSetOfStones) {
    //add element x if no current element === x
    for(let stone of aSetOfStones.collection)
    this.add(stone)
  }

  remove(aStone) {
    //remove first occurence of element === x
    let position = this.collection.indexOf(aStone)
    if (position > -1) this.collection.splice(position, 1)
  }

  elementAt(i){
    if(i >=0 && i < this.collection.length) return this.collection[i]
    return null
  }

  contains(aStone) {
    //answer whether set contains element === x
    return this.collection.indexOf(aStone) > -1
  }

  toString() {
    return this.collection.toString()
  }

  stoneAtLocation(aCanvasX, aCanvasY) {
    //locate a stoneRadius whose area contains point aCanvasX,aCanvasY co-ordinates
    //aCanvasX and aCanvasY are assumed to be X,Y loc
    //relative to upper left origin of canvas

    //used to get the word mouse is clicked on
    for (let stone of this.collection) {
      if(stone.containsPoint(aCanvasX, aCanvasY)) return stone
    }
    return null
  }

  isAllStonesStopped(){
    for (let stone of this.collection) {
      if(stone.isStoneMoving()) return false
    }
    return true

  }

  advance(shootingArea) {
    for (let stone of this.collection) {
      stone.advance(shootingArea)
    }
  }

  draw(context, ice) {
    //console.log(`set_of_stones::draw()`)
    for (let stone of this.collection) {
      stone.draw(context, ice)
    }
  }
}
