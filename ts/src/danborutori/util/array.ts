interface Array<T>{
    readonly first: T | null
    readonly last: T | null
    findClosestIndex( distanceFunc: (a: T, index: number)=>number, outInfo?: {minDistance: number} ): number
    insert( o: T, index: number): void
    remove(index: number): T
    swap( a: number, b: number ): void
    clear(): void
    pushAll( elements: Iterable<T> ): void
    
    flatMap<V>(transform:(item:T, index: number)=>V|V[]|undefined):V[]
}

Object.defineProperty(Array.prototype, "first", {
    get(){
        const arr = this as Array<any>
        
        if( arr.length>0 )
            return arr[0]
        return null
    }
})

Object.defineProperty(Array.prototype, "last", {
    get(){
        const arr = this as Array<any>
        
        if( arr.length>0 )
            return arr[arr.length-1]
        return null
    }
})

Array.prototype.findClosestIndex = function (distanceFunc: (element: any, index: number)=>number, outInfo?: {minDistance: number}){
    let index = -1
    let md = Infinity
    for( let i=0; i<this.length; i++ ){
        const d = distanceFunc(this[i], i)
        if( d<md ){
            md = d
            index = i
        }
    }
    if(outInfo)outInfo.minDistance = md
    return index
}

Array.prototype.insert = function( o, index: number ){
    this.splice( index, 0, o)
}

Array.prototype.remove = function( index: number ){
    const t = this[index]
    this.splice(index, 1)
    return t
}
    
Array.prototype.swap = function(a, b){
    const t = this[a]
    this[a] = this[b]
    this[b] = t
}

Array.prototype.clear = function(){
    this.length = 0
}

Array.prototype.pushAll = function(elements: Iterable<any>){
    for( let e of elements ){
        this.push(e)
    }
}


Array.prototype.flatMap = function(transform: (item:any, index: number)=>any){
    let result = new Array()
    
    for( let i=0; i<this.length; i++ ){
      let item = this[i]
      let t = transform(item, i)
      if( t instanceof Array  ){
        for( let a of t )
          if( a!=null && a!=undefined)
            result.push(a)
      }else if( t!=null && t!=undefined){
        result.push(t)
      }
    }
    
    return result
  }
