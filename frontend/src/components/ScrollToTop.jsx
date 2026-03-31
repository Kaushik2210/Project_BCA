// Import the useEffect hook for running side effects after rendering.
import { useEffect } from 'react';
// Import useLocation to detect when the URL path changes.
import { useLocation } from 'react-router-dom';

// ScrollToTop is a utility component that automatically scrolls the page to the top
// whenever the user navigates to a new route.
// Without this, React Router keeps the scroll position when navigating between pages,
// which means users would land in the middle of a new page instead of at the top.
const ScrollToTop = () => {
  // Destructure the current URL pathname from useLocation.
  const { pathname } = useLocation();

  // useEffect runs every time `pathname` changes (i.e., the user navigated to a new page).
  useEffect(() => {
    // Scroll the browser window to the very top-left corner (0, 0).
    window.scrollTo(0, 0);
  }, [pathname]); // Dependency array: re-run this effect whenever the URL path changes.

  // This component doesn't render any visible UI — it returns null.
  return null;
};

// Export the component.
export default ScrollToTop;
