import JSMpeg from "jsmpeg-player"; 

const RTSP_SERVER_PORT = process.env.NEXT_PUBLIC_RTSP_SERVER_PORT || 9999;

export const accessCamera = (canvasRef) => {
    let player;
    import("jsmpeg-player").then((JSMpeg) => {
      if(JSMpeg && RTSP_SERVER_PORT){
      player = new JSMpeg.default.Player("ws://localhost:"+RTSP_SERVER_PORT, {
        canvas: canvasRef.current,
        autoplay: true,
        audio: false,
      });}
    });
}