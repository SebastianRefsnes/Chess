class Vector{
  constructor(x,y){
    this.x = x;
    this.y = y;
  }
  dotProduct(vectorA,vectorB){
    return  (vectorA.x*vectorB.x) + (vectorA.y*vectorB.y);
  }
  magnitude(vector=this){
    return Math.sqrt(Math.pow(vector.x,2) + Math.pow(vector.y,2));
  }
  angle(vector=this){
    return Math.atan(vector.y/vector.x) * 180 / Math.PI;
  }
  normalize(){
    let magn =Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2));
    this.x /= magn;
    this.y /= magn;
  }
}
function getDistance(vectorA,vectorB){
  let subVec = {x:0,y:0};
  subVec.x = vectorA.x - vectorB.x;
  subVec.y = vectorA.y - vectorB.y;

  let distance = Math.sqrt(Math.pow(subVec.x,2) + Math.pow(subVec.y,2));
  return distance;
}
function getMinimum(a,b){
  if(a < b){
    return a;
  }else{
    return b;
  }
}
function toRadian(degree){
  let radians = degree * Math.PI/180;
  return radians;
}
function toDegree(radian){
  let degree = radian * 180/Math.PI;
  return degree
}
function map(value, start1, stop1, start2, stop2) {
  return (value - start1) / (stop1-start1) * (stop2-start2) + start2;
}
