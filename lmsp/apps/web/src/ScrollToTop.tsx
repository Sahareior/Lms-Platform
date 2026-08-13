import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll position to the top on every route change.
 *
 * The app layouts (user app + admin panel) scroll inside an inner div
 * (`overflow-y-auto`) rather than the window, so those containers are
 * tagged with `data-scroll-container` and reset here as well.
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document
      .querySelectorAll('[data-scroll-container]')
      .forEach((el) => {
        el.scrollTop = 0;
      });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
