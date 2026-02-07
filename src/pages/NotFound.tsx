import { useLocation, Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import SpaceBackground from "../components/portfolio/SpaceBackground";
import "./NotFound.css";

interface ErrorState {
  code?: string | number;
  message?: string;
}

const NotFound = ({
  code: defaultCode = "404",
  message: defaultMessage = "We can't find the page that you're looking for :(",
}) => {
  const location = useLocation();

  // Try to get error details from navigation state (e.g., passed from an API catch block)
  const state = location.state as ErrorState;

  const errorCode = state?.code?.toString() || defaultCode.toString();
  const errorMessage = state?.message || defaultMessage;

  const visorRef = useRef<HTMLCanvasElement | null>(null);
  const cordRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const visor = visorRef.current;
    const cordCanvas = cordRef.current;
    if (!visor || !cordCanvas) return;

    const visorCtx = visor.getContext("2d");
    const cordCtx = cordCanvas.getContext("2d");
    if (!visorCtx || !cordCtx) return;

    const drawVisor = () => {
      visorCtx.clearRect(0, 0, visor.width, visor.height);
      visorCtx.beginPath();
      visorCtx.moveTo(5, 45);
      visorCtx.bezierCurveTo(15, 64, 45, 64, 55, 45);
      visorCtx.lineTo(55, 20);
      visorCtx.bezierCurveTo(55, 15, 50, 10, 45, 10);
      visorCtx.lineTo(15, 10);
      visorCtx.bezierCurveTo(15, 10, 5, 10, 5, 20);
      visorCtx.lineTo(5, 45);
      visorCtx.fillStyle = "#2f3640";
      visorCtx.strokeStyle = "#f5f6fa";
      visorCtx.fill();
      visorCtx.stroke();
    };

    let y1 = 0.35;
    let y2 = 0.45;
    let y1Forward = true;
    let y2Forward = false;
    let animationId = 0;

    const resize = () => {
      const rect = cordCanvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      cordCanvas.width = Math.round(rect.width);
      cordCanvas.height = Math.round(rect.height);
    };

    const animate = () => {
      animationId = window.requestAnimationFrame(animate);
      const w = cordCanvas.width || 1;
      const h = cordCanvas.height || 1;
      cordCtx.clearRect(0, 0, w, h);
      cordCtx.beginPath();
      
      // Start from the top-left (connected to astronaut)
      cordCtx.moveTo(0, 0); 
      
      // Draw a shorter, curved "cut" cord as seen in the image
      cordCtx.bezierCurveTo(
        w * 0.4, h * (0.6 + y1 * 0.1), 
        w * 0.7, h * (0.8 + y2 * 0.1), 
        w * 0.9, h * 0.4 
      );
      
      cordCtx.strokeStyle = "#f2f2f2";
      cordCtx.lineWidth = 8;
      cordCtx.lineCap = "round";
      cordCtx.stroke();

      if (y1 <= 0.2) y1Forward = true;
      if (y1 >= 0.75) y1Forward = false;
      if (y2 <= 0.2) y2Forward = true;
      if (y2 >= 0.85) y2Forward = false;

      y1Forward ? (y1 += 0.001) : (y1 -= 0.001);
      y2Forward ? (y2 += 0.0008) : (y2 -= 0.0008);
    };

    drawVisor();
    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [location.pathname, errorCode]);

  return (
    <div className="space-404">
      <SpaceBackground />

      <div className="moon"></div>
      <div className="moon__crater moon__crater1"></div>
      <div className="moon__crater moon__crater2"></div>
      <div className="moon__crater moon__crater3"></div>

      <div className="error">
        <div className="error__title">{errorCode}</div>
        <div className="error__subtitle">Oops...</div>
        <div className="error__description">{errorMessage}</div>
        <div className="error__actions">
          <Link className="error__button error__button--active" to="/">
            HOME
          </Link>
        </div>
      </div>

      <div className="astronaut">
        <div className="astronaut__backpack"></div>
        <div className="astronaut__body"></div>
        <div className="astronaut__body__chest"></div>
        <div className="astronaut__arm-left1"></div>
        <div className="astronaut__arm-left2"></div>
        <div className="astronaut__arm-right1"></div>
        <div className="astronaut__arm-right2"></div>
        <div className="astronaut__arm-thumb-left"></div>
        <div className="astronaut__arm-thumb-right"></div>
        <div className="astronaut__leg-left"></div>
        <div className="astronaut__leg-right"></div>
        <div className="astronaut__foot-left"></div>
        <div className="astronaut__foot-right"></div>
        <div className="astronaut__wrist-left"></div>
        <div className="astronaut__wrist-right"></div>

        <div className="astronaut__cord">
          <canvas ref={cordRef} id="cord"></canvas>
        </div>

        <div className="astronaut__head">
          <canvas ref={visorRef} id="visor" width="60" height="60"></canvas>
          <div className="astronaut__head-visor-flare1"></div>
          <div className="astronaut__head-visor-flare2"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
