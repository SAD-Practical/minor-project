import jsPDF from 'jspdf'
import React,{useRef,useEffect} from 'react'
import io from 'socket.io-client'
import './styles/board.css'

const Board=()=>{
    const canvasRef=useRef(null)
    const colorsRef=useRef(null)
    const socketRef=useRef()
    
    useEffect(()=>{
        const canvas=canvasRef.current
        const context=canvas.getContext('2d')
        //colors
        const colors=document.getElementsByClassName('color')
        console.log(colors, 'the colors');
        const current={
            color:'black'
        }
        const onColorUpdate=(e)=>{
            current.color=e.target.className.split(' ')[1]
            console.log(e.target.className)
        }

        for(let i=0;i<colors.length;i++){
            colors[i].addEventListener('click',onColorUpdate,false)
        }

        let drawing=false
        
        //draw line

        const drawLine=(x0,y0,x1,y1,color,emit)=>{
            context.beginPath()
            context.moveTo(x0,y0)
            context.lineTo(x1,y1)
            context.strokeStyle=color
            context.lineWidth=2
            context.stroke()
            context.closePath()
            if(!emit){
                return
            }
            const w=canvas.width
            const h=canvas.height

            socketRef.current.emit('drawing',{
                x0:x0/w,
                y0:y0/h,
                x1:x1/w,
                y1:y1/h,
                color
            })
        }

        //mouseEvents

        const onMouseDown=(e)=>{
            drawing=true
            current.x=e.clientX || e.touches[0].clientX
            current.y=e.clientY || e.touches[0].clientY
        }

        const onMouseMove=(e)=>{
            if(!drawing){return}
            drawLine(current.x,current.y,e.clientX || e.touches[0].clientX,e.clientY || e.touches[0].clientY,current.color,true)
            current.x=e.clientX || e.touches[0].clientX
            current.y=e.clientY || e.touches[0].clientY
        }

        const onMouseUp=(e)=>{
            if(!drawing){return}
            drawing=false
            drawLine(current.x,current.y,e.clientX || e.touches[0].clientX,e.clientY || e.touches[0].clientY,current.color,true)
        }
        
        //limits the number of events per second
        const throttle=(callback,delay)=>{
            let previousCall=new Date().getTime()
            return function(){
                const time=new Date().getTime()
                if((time-previousCall)>=delay){
                    previousCall=time
                    callback.apply(null,arguments)
                }
            }
        }


        //event listeners to canvas
        canvas.addEventListener('mousedown',onMouseDown,false)
        canvas.addEventListener('mouseup',onMouseUp,false)
        canvas.addEventListener('mouseout',onMouseUp,false)
        canvas.addEventListener('mousemove',throttle(onMouseMove,10),false)

        //touch support for mobile
        canvas.addEventListener('touchstart',onMouseDown,false)
        canvas.addEventListener('touchend',onMouseUp,false)
        canvas.addEventListener('touchcancel',onMouseUp,false)
        canvas.addEventListener('touchmove',throttle(onMouseMove,10),false)

        //resize canvas
        const onResize=()=>{
            canvas.width=window.innerWidth
            canvas.height=window.innerHeight
        }
        window.addEventListener('resize',onResize,false)
        onResize()

        //socket io connection

        const onDrawingEvent=(data)=>{
            const w=canvas.width
            const h=canvas.height
            drawLine(data.x0*w,data.y0*h,data.x1*w,data.y1*h,data.color)
        }
        
        socketRef.current=io.connect('http://localhost:3000')
        socketRef.current.on('drawing',onDrawingEvent)
        
    },[])

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d")
        context.fillStyle = "white"
        context.fillRect(0, 0, canvas.width, canvas.height)
    }

    const drawLine=()=>{
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d")
        //context.beginPath()
        context.moveTo(600,700)
        context.lineTo(800,500)
        context.strokeStyle="black"
        context.lineWidth=2
        context.stroke()
        //context.closePath()
    }
    const drawRectangle=()=>{
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d")
        context.moveTo(400,500)
        context.lineTo(700,500)
        context.lineTo(700,300)
        context.lineTo(400,300)
        context.lineTo(400,500)
        context.strokeStyle="black"
        context.lineWidth=2
        context.stroke()
    }

    const drawCircle=()=>{
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d")
        context.beginPath();
        context.arc(1000, 500, 80, 0, 2 * Math.PI);
        context.strokeStyle="black"
        context.lineWidth=2
        context.stroke()
    }

    const drawTriangle=()=>{
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d")
        context.moveTo(1000,375)
        context.lineTo(1400,375)
        context.lineTo(1000,200)
        context.lineTo(1000,375)
        context.strokeStyle="black"
        context.lineWidth=2
        context.stroke()
    }

    const sketch=(x,y,w,h,ctx,colors)=>{
    ctx.fillStyle=colors[0];
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x+w/2,y+0.7*h);
    ctx.lineTo(x+w/2,y);
    ctx.fill();
    
    ctx.fillStyle=colors[1];
    ctx.beginPath();
    ctx.moveTo(x+w/2, y);
    ctx.lineTo(x+w/2,y+0.7*h);
    ctx.lineTo(x+w,y);
    ctx.fill();
    
    // Upper left triangle
    ctx.beginPath();
    ctx.moveTo(x+w/4,y-0.3*h);
    ctx.lineTo(x,y);
    ctx.lineTo(x+w/2,y);
    ctx.fill();
    
    // centre inverted triangle
    ctx.fillStyle=colors[2];
    ctx.beginPath();
    ctx.moveTo(x+w/4,y-0.3*h);
    ctx.lineTo(x+w/2,y);
    ctx.lineTo(x+0.75*w,y-0.3*h);
    ctx.fill();
    
    //Upper left triangle.
    ctx.fillStyle=colors[0];
    ctx.beginPath();
    ctx.moveTo(x+0.75*w,y-0.3*h);
    ctx.lineTo(x+w/2,y);
    ctx.lineTo(x+w,y);
    ctx.fill();
    }
    const drawDiamond=()=>{
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d")
        var x=275; var y=175;
        var w=200; var h=200;
        const colors=['#E3170D','#9D1309','#F22C1E'];
        sketch(x,y,w,h,context,colors);
    }

    const downloadImage=()=>{
        const canvas = canvasRef.current;
        const image=canvas.toDataURL("image/png").replace("image/png","image/octet-stream")
        var link=document.createElement('a')
        link.download="my-img.png"
        link.href=image
        link.click()
    }

    const downloadPdf=()=>{
        const canvas = canvasRef.current;
        const image=canvas.toDataURL("image/png").replace("image/png","image/octet-stream")
        var pdf=new jsPDF("l", "mm", "a4");
        pdf.addImage(image,'PNG',10, 10, 180, 160);
        pdf.save('my_image.pdf');
    }

    
    return(
      <div className="container">
          <div className="row">
          <canvas ref={canvasRef} className="whiteboard"/>
          </div>
          <div className="row">
          <div ref={colorsRef} className="colors mt-3 col-4">
             <h6 className="bold">Strokes</h6>
             <div className="color black rounded-circle mr-2" />
             <div className="color red rounded-circle mr-2" />
             <div className="color green rounded-circle mr-2" />
             <div className="color blue rounded-circle mr-2" />
             <div className="color yellow rounded-circle mr-2" />
          </div>
          <div className="col-2 mt-3">
          <h6 className="bold ">Clear Screen</h6>
          <button className="p-2" onClick={clearCanvas}><i className="fa fa-trash-o " style={{fontSize:'24px'}}></i></button>
          
          </div>

          <div className="col-3 mt-3">
          <h6 className="bold ">Click on the shapes you want</h6>
          <button className="mr-2" onClick={drawLine}><i className="fa fa-long-arrow-right" style={{fontSize:'24px'}}></i></button>
          <button className="mr-2" onClick={drawRectangle}><i className="far fa-square" style={{fontSize:'24px'}}></i></button>
          <button className="mr-2" onClick={drawCircle}><i className="fa fa-circle-thin" style={{fontSize:'24px'}}></i></button>
          <button className="mr-2" onClick={drawTriangle}><i className="fa fa-caret-up" style={{fontSize:'24px'}}></i></button>
          <button className="mr-2" onClick={drawDiamond}><i className="fa fa-diamond" style={{fontSize:'24px'}}></i></button>
          </div>

          <div className="col-3 mt-3">
          <h6 className="bold ">Click here to download</h6>
          <button className="mr-2" onClick={downloadImage}><i className="fa fa-download" style={{fontSize:'24px'}}></i></button>
          <button className="mr-2" onClick={downloadPdf}><i className="fa fa-file-pdf-o" style={{fontSize:'24px'}}></i></button>
          </div>

          </div>
      </div>
    )
}
export default Board