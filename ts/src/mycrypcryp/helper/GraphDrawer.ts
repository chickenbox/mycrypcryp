namespace mycrypcryp { export namespace helper {

    export class GraphDrawer {

        constructor(
            readonly canvas: HTMLCanvasElement
        ){
            const ctx = this.canvas.getContext("2d")

            ctx.fillStyle = "white"
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
            ctx.lineWidth = 1
        }

        drawGrid( segment: number, x: number, width: number ){
            const ctx = this.canvas.getContext("2d")
            ctx.lineWidth = devicePixelRatio
            ctx.strokeStyle = "#eeeeee"
            ctx.beginPath()
            for( let i=0; i<segment; i++ ){
                const _x = x+i*width/(segment-1)
                ctx.moveTo(_x,0)
                ctx.lineTo(_x,this.canvas.height)
            }
            ctx.stroke()
        }

        drawCurve(
            data: number[],
            color: string,
            x: number,
            width: number,
            high: number,
            low: number ){
            if( data.length>0 ){                
                const ctx = this.canvas.getContext("2d")
                ctx.lineWidth = devicePixelRatio

                // x-axis
                ctx.strokeStyle = color
                ctx.setLineDash([4*devicePixelRatio,4*devicePixelRatio])
                ctx.beginPath()
                ctx.moveTo(0,(1+low/(high-low))*this.canvas.height)
                ctx.lineTo(this.canvas.width,(1+low/(high-low))*this.canvas.height)
                ctx.stroke()


                ctx.strokeStyle = color
                ctx.setLineDash([])
                ctx.beginPath()
                for( let i=0; i<data.length; i++ ){
                    const d = data[i]

                    const _x = x+i*width/(data.length-1)
                    const y = (1.0-(d-low)/(high-low))*this.canvas.height

                    if( i== 0 ){
                        ctx.moveTo(_x, y)
                    }else{
                        ctx.lineTo(_x, y)
                    }
                }
                ctx.stroke()
            }
        }

        private isTurningPoint( data: {
            value: number,
            dvdx: number
            dvddx: number
        }[], index: number ){
            return index>0 && Math.sign(data[index].dvddx)*Math.sign(data[index-1].dvddx)<=0
        }

        private isPeak( data: {
            value: number,
            dvdx: number
            dvddx: number
        }[], index: number ){
            return index>0 && Math.sign(data[index].dvdx)*Math.sign(data[index-1].dvdx)<=0 && data[index].dvddx <= 0
        }

        private isValley( data: {
            value: number,
            dvdx: number
            dvddx: number
        }[], index: number ){
            return index>0 && Math.sign(data[index].dvdx)*Math.sign(data[index-1].dvdx)<=0 && data[index].dvddx > 0
        }

        visualizeTurningPoint(
            data: {
                value: number,
                dvdx: number
                dvddx: number
            }[],
            x: number, width: number,
            high: number,
            low: number
        ){
            if( data.length>0 ){
                const ctx = this.canvas.getContext("2d")

                for( let i=0; i<data.length; i++ ){
                    let arrow: {
                        text: string
                        color: string
                    } | undefined

                    if( this.isTurningPoint(data, i) ){
                        arrow = {
                            text: "t",
                            color: "purple"
                        }
                    }else if( this.isPeak(data, i) ){
                        arrow = {
                            text: "p",
                            color: "green"
                        }
                    }else if( this.isValley(data, i) ){
                        arrow = {
                            text: "v",
                            color: "red"
                        }
                    }

                    if( arrow ) {
                        const _x = x+i*width/(data.length-1)
                        const y = (1-(data[i].value-low)/(high-low))*this.canvas.height

                        ctx.fillStyle = arrow.color
                        ctx.textAlign = "center"
                        ctx.font = `${10*devicePixelRatio}px sans-serif`;
                        ctx.fillText(arrow.text,_x,y)
                    }
                }
            }
        }
    }

}}