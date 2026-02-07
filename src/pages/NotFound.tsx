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

  const cordRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cordCanvas = cordRef.current;
    if (!cordCanvas) return;

    const cordCtx = cordCanvas.getContext("2d");
    if (!cordCtx) return;

    let y1 = 0.35;
    let y2 = 0.45;
    let y3 = 0.7;
    let y1Forward = true;
    let y2Forward = false;
    let y3Forward = true;
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
      cordCtx.moveTo(w * 0.05, h * 0.25);
      cordCtx.bezierCurveTo(w * 0.35, y1 * h, w * 0.7, y2 * h, w * 0.98, y3 * h);
      cordCtx.strokeStyle = "#f2f2f2";
      cordCtx.lineWidth = 6;
      cordCtx.stroke();

      if (y1 <= 0.2) y1Forward = true;
      if (y1 >= 0.75) y1Forward = false;
      if (y2 <= 0.2) y2Forward = true;
      if (y2 >= 0.85) y2Forward = false;
      if (y3 <= 0.3) y3Forward = true;
      if (y3 >= 0.9) y3Forward = false;

      y1Forward ? (y1 += 0.003) : (y1 -= 0.003);
      y2Forward ? (y2 += 0.0025) : (y2 -= 0.0025);
      y3Forward ? (y3 += 0.002) : (y3 -= 0.002);
    };

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
          <a className="error__button" href="/#contact">
            CONTACT
          </a>
        </div>
      </div>

      <div className="astronaut-container">
        <div className="astronaut__cord">
          <canvas ref={cordRef} id="cord" height="240" width="360"></canvas>
        </div>
        <img 
          src="/images/astronaut.png" 
          alt="Astronaut" 
          className="astronaut-image"
        />
      </div>
    </div>
  );
};

export default NotFound;
