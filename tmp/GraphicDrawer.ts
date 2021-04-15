namespace myCrypto {

    export class GraphicDrawer {

        constructor(
            readonly canvas: HTMLCanvasElement
        ){
            const ctx = this.canvas.getContext("2d")

            ctx.fillStyle = "white"
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
            ctx.lineWidth = 1
        }

        drawGrid( segment: number ){
            const ctx = this.canvas.getContext("2d")
            ctx.lineWidth = 1
            ctx.strokeStyle = "#eeeeee"
            ctx.beginPath()
            for( let i=0; i<segment; i++ ){
                const x = i*this.canvas.width/(segment-1)
                ctx.moveTo(x,0)
                ctx.lineTo(x,this.canvas.height)
            }
            ctx.stroke()
        }

        draw( data: number[], color: string){
            if( data.length>0 ){
                const maxD = data.reduce((a,b)=>Math.max(a,b), data[0])
                const minD = data.reduce((a,b)=>Math.min(a,b), data[0])

                const ctx = this.canvas.getContext("2d")
                ctx.lineWidth = 1

                ctx.strokeStyle = color
                ctx.setLineDash([4,4])
                ctx.beginPath()
                ctx.moveTo(0,(1+minD/(maxD-minD))*this.canvas.height)
                ctx.lineTo(this.canvas.width,(1+minD/(maxD-minD))*this.canvas.height)
                ctx.stroke()


                ctx.strokeStyle = color
                ctx.setLineDash([])
                ctx.beginPath()
                for( let i=0; i<data.length; i++ ){
                    const d = data[i]

                    const x = i*this.canvas.width/(data.length-1)
                    const y = (1.0-(d-minD)/(maxD-minD))*this.canvas.height

                    if( i== 0 ){
                        ctx.moveTo(x, y)
                    }else{
                        ctx.lineTo(x, y)
                    }
                }
                ctx.stroke()
            }
        }

        visualizeTurningPoint(
            data: {
                value: number,
                dvdx: number
                dvddx: number
            }[]
        ){
            if( data.length>0 ){
                const min = data.reduce((a,b)=>Math.min(a,b.value), data[0].value)
                const max = data.reduce((a,b)=>Math.max(a,b.value), data[0].value)

                const ctx = this.canvas.getContext("2d")

                for( let i=0; i<data.length; i++ ){
                    let isTurningPoint = i>0 && Math.sign(data[i].dvddx)*Math.sign(data[i-1].dvddx)<=0
                    let isPeak = i>0 && Math.sign(data[i].dvdx)*Math.sign(data[i-1].dvdx)<=0

                    let arrow: {
                        text: string
                        color: string
                    } | undefined

                    if( isTurningPoint ){
                        arrow = {
                            text: "t",
                            color: "red"
                        }
                    }

                    if( isPeak ){
                        arrow = {
                            text: "p",
                            color: "green"
                        }
                    }

                    if( arrow ) {
                        const x = i*this.canvas.width/(data.length-1)
                        const y = (1-(data[i].value-min)/(max-min))*this.canvas.height

                        ctx.fillStyle = arrow.color
                        ctx.textAlign = "center"
                        ctx.fillText(arrow.text,x,y)
                    }
                }
            }
        }
    }

}