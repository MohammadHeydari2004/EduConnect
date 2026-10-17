import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const main = document.getElementById("main-content");
    if (main) {
      main.scrollTop = 0;
    }
  }, [pathname]);

  return null;
}

export default ScrollToTop;
