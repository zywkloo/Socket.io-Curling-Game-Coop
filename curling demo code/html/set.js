/*

*/

class Set {
  //let collection = []  //NOT ALLOWED WITH CLASSES
  constructor() {
    this.collection = []
  }
  add(x) {
    //add element x if no current element === x
    if (this.collection.indexOf(x) < 0) this.collection.push(x)
  }

  remove(x) {
    //remove first occurence of element === x
    let position = this.collection.indexOf(x)
    if (position > -1) this.collection.splice(position, 1)
  }

  contains(x) {
    //answer whether set contains element === x
    return this.collection.indexOf(x) > -1
  }

  toString() {
    return this.collection.toString()
  }
}
