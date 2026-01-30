import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import "./NotFound.css";

interface ErrorState {
  code?: string | number;
  message?: string;
}

const NotFound = ({ code: defaultCode = "404", message: defaultMessage = "We can't find the page that you're looking for :(" }) => {
  const location = useLocation();
  
  // Try to get error details from navigation state (e.g., passed from an API catch block)
  const state = location.state as ErrorState;
  
  const errorCode = state?.code?.toString() || defaultCode.toString();
  const errorMessage = state?.message || defaultMessage;

  useEffect(() => {
  }, [location.pathname, errorCode]);

  // Split the code into digits for the 3D design
  const firstDigit = errorCode.charAt(0) || "4";
  const lastDigit = errorCode.length > 1 ? errorCode.charAt(errorCode.length - 1) : (errorCode.length === 1 ? "" : "4");

  return (
    <div className="error-page-container">
      <div className="room">
        <div className="cuboid">
          <div className="side"></div>
          <div className="side"></div>
          <div className="side"></div>
        </div>
        <div className="oops">
          <h2>OOPS! {errorCode}</h2>
          <p>{errorMessage}</p>
        </div>
        <div className="center-line">
          <div className="hole">
            <div className="ladder-shadow"></div>
            <div className="ladder"></div>
          </div>
          <div className="four">{firstDigit}</div>
          <div className="four">{lastDigit}</div>
          <div className="btn">
            <Link to="/">BACK TO HOME</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
