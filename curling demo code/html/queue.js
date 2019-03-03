/*
  (c) 2018 Louis D. Nel
  This class represents a first-in last-out queue  elements
*/

class Queue {
  //let collection = []  //NOT ALLOWED WITH CLASSES
  constructor() {
    this.collection = []
  }

  getCollection(){return this.collection}

  size(){return this.collection.length}

  isEmpty(){return this.size() === 0}

  front(){
    if(this.isEmpty()) return null
    return this.collection[0]
  }

  enqueue(anElement) {
    //add anElemen to the tail for the queue
    this.collection.push(anElement)
  }
  dequeue(){
    //dequeue and return the front element of the queue
    if(this.size() === 0) return null
    let front = this.collection[0]
    this.collection = this.collection.splice(1)
    return front
  }
  addAll(...elements) {
    //add element x if no current element === x
    for(let anElement of elements)
       this.enqueue(anElement)
  }

  remove(anElement) {
    //remove first occurence of element === x
    let position = this.collection.indexOf(anElement)
    if (position > -1) this.collection = this.collection.splice(position, 1)
  }

  contains(anElement) {
    //answer whether set contains element === x
    return this.collection.indexOf(anElement) > -1
  }

  toString() {
    return this.collection.toString()
  }
}
