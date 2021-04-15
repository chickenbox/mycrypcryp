namespace React {
  export function createElement(tag:string, properties?: any, ...args: any[] ): HTMLElement {
    let elem: HTMLElement
    switch( tag ){
    case "button":
      elem = <input type="button"/>
      break
    case "checkbox":
      elem = <input type="checkbox"/>
      break
    case "radio":
        elem = <input type="radio"/>
        break
    case "file":
      elem = <input type="file"/>
      break
    case "scroll":
      elem = <div/>
      elem.style.overflow = "scroll"
      break
    case "slider":
      elem = <input type="range"/>
      break
    default:
      elem = document.createElement(tag)
      break
    }
    
    if( properties )
      for( let property in properties ){
          if( properties.hasOwnProperty(property)){
            if( property.startsWith("on") ){
              elem.addEventListener(property.substring(2), properties[property])
            }else
              elem.setAttribute(property, properties[property])
        }
      }
    
    let flattenArgs = args.flatMap(elem=>elem)
    for( let arg of flattenArgs ){
      if(arg instanceof HTMLElement){
        elem.appendChild(arg)        
      }else{
        let textNode = document.createTextNode(arg)
        elem.appendChild(textNode)
      }
    }
     return elem
  }
}

declare namespace JSX {
  export class Element extends HTMLElement{
    
  }
  
  export class IntrinsicElements {
    a: any
    b: any
    br: any
    button: any
    canvas: any
    center: any
    checkbox: any
    datalist: any
    div: any
    file: any
    font: any
    h1: any
    h2: any
    h3: any
    h4: any
    h5: any
    h6: any
    h7: any
    hr: any
    iframe: any
    img: any
    input: any
    li: any
    ol: any
    option: any
    radio: any
    scroll: any
    select: any
    slider: any
    style: any
    table: any
    td: any
    textarea: any
    th: any
    tr: any
    ul: any
  }  
}