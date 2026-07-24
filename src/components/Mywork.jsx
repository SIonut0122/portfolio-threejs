import { useEffect, useState, useRef } from 'react';
import { MYWORK_DATA } from '../data/portfolioData';
import { playClickSound, playProjectTransitionSound, playProjectSelectedSound } from '../utils/soundUtils';

function Mywork() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767.98);
  
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const mobileTimeoutRef = useRef(null);
  const cursorRef = useRef(null);
  const infoBoxRef = useRef(null);
  const hoverTimerRef = useRef(null);
  
  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);

  const { projects, crosshairs } = MYWORK_DATA;

  useEffect(() => {
    document.querySelectorAll('.mobnav-btn').forEach(el => el.classList.remove('mobmenu-btn-active'));
    document.querySelector('.mobnav-mywork')?.classList.add('mobmenu-btn-active');
    document.title = '] MY WORK [ Ionut Stan - Front-End Developer';

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
        
    const posDoc = containerRef.current;

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767.98);
    };

    window.addEventListener('resize', handleResize);
    
    const handleMouseMove = (e) => {
      if (!posDoc || window.innerWidth <= 767.98) return;
      const rect = posDoc.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      posDoc.style.setProperty('--x', mouseX + "px");
      posDoc.style.setProperty('--y', mouseY + "px");

      let dynamicSize = 500;
      if (e.clientY < 250) dynamicSize = Math.max(300, e.clientY * 2);
      
      const minHorizontalDist = Math.min(e.clientX, window.innerWidth - e.clientX);
      if (minHorizontalDist < 250) dynamicSize = Math.min(dynamicSize, Math.max(300, minHorizontalDist * 2));

      posDoc.style.setProperty('--cursor-size', dynamicSize + "px");

      if (infoBoxRef.current) {
        infoBoxRef.current.classList.toggle('flip-y', e.clientY > window.innerHeight * 0.55);
        infoBoxRef.current.classList.toggle('flip-x', e.clientX < 350);
      }

      const items = posDoc.querySelectorAll('.scatter_item');
      const centerX = window.innerWidth / 2, centerY = window.innerHeight / 2;
      items.forEach((item) => {
        const speed = parseFloat(item.getAttribute('data-speed')) || 0.02;
        item.style.transform = `translate(${(e.clientX - centerX) * speed}px, ${(e.clientY - centerY) * speed}px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.title = 'Ionut Stan - Front-End Developer';
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (window.innerWidth > 767.98) return;

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const triggerDetailsTimeout = () => {
      if (mobileTimeoutRef.current) clearTimeout(mobileTimeoutRef.current);
      mobileTimeoutRef.current = setTimeout(() => {
        setShowMobileDetails(true);
        playProjectTransitionSound();
      }, 500); 
    };

    triggerDetailsTimeout();

    const navigateToItem = (nextIndex) => {
      if (nextIndex < 0 || nextIndex >= projects.length || isScrollingRef.current) return;
      
      setHasScrolled(true);
      isScrollingRef.current = true;
      setShowMobileDetails(false);
      setMobileActiveIndex(nextIndex);

      playProjectSelectedSound();

      scrollContainer.scrollTo({ top: nextIndex * 110, behavior: 'smooth' });
      
      setTimeout(() => { 
        isScrollingRef.current = false; 
        triggerDetailsTimeout(); 
      }, 350); 
    };

    const handleWheel = (e) => { 
      e.preventDefault(); 
      if (!isScrollingRef.current) {
        navigateToItem(mobileActiveIndex + Math.sign(e.deltaY)); 
      }
    };

    const handleTouchStart = (e) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (isScrollingRef.current) return;
      const diffY = touchStartYRef.current - e.changedTouches[0].clientY;
      if (Math.abs(diffY) > 25) {
        navigateToItem(mobileActiveIndex + Math.sign(diffY));
      }
    };

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    scrollContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollContainer.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
      scrollContainer.removeEventListener('touchstart', handleTouchStart);
      scrollContainer.removeEventListener('touchend', handleTouchEnd);
      if (mobileTimeoutRef.current) clearTimeout(mobileTimeoutRef.current);
    };
  }, [mobileActiveIndex, projects.length]);

  const currentProject = projects[isMobile ? mobileActiveIndex : activeIndex];
  const rawTech = currentProject?.tech || "";
  const formattedTech = rawTech.replaceAll('•', '//');
  const formattedText = currentProject ? `${formattedTech} // ` : "";

  return (
    <div ref={containerRef} className='mywork_container w-100'>
      
      <div className="ambient-crosshairs-grid">
        {crosshairs.map((c, i) => (
          <div key={i} className="crosshair-mark" style={{ top: c.top, left: c.left, animationDelay: c.delay }}>
            <div className="cross-lines"></div>
            {c.label && <span className="cross-label">{c.label}</span>}
          </div>
        ))}
      </div>

      {isMobile && (
        <>
          {!hasScrolled && <div className="mobile-swipe-hint">Swipe</div>}

          <div className={`mobile-nav-arrow arrow-top ${showMobileDetails && mobileActiveIndex > 0 ? 'visible' : ''}`}><span></span></div>
          <div className={`mobile-nav-arrow arrow-bottom ${showMobileDetails && mobileActiveIndex < projects.length - 1 ? 'visible' : ''}`}><span></span></div>
        </>
      )}

      <div ref={scrollContainerRef} className={`scatter_grid_wrapper ${isMobile && showMobileDetails ? 'is-darkened' : ''}`}>
        {projects.map((project, index) => {
          const isFocusedMobile = isMobile && mobileActiveIndex === index;
          return (
            <div 
              key={index} 
              className={`scatter_item ${isFocusedMobile ? 'is-focused' : ''} ${isFocusedMobile && showMobileDetails ? 'show-details' : ''}`}
              data-speed={project.speed} style={{ top: project.top, left: project.left }}
              onMouseEnter={() => {
                if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                
                hoverTimerRef.current = setTimeout(() => {
                  setActiveIndex(index);
                  playClickSound();
                }, 70);
              }}
              onMouseLeave={() => {
                if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
              }}
            >
              <a href={project.url} target="_blank" rel="noreferrer" data-text={project.name} aria-label={`View project ${project.name}`}>
                <img className="desktop-preview" src={project.img} alt=''/>
                <span className="project_title_text">{project.name}</span>
              </a>
              <p className="mobile-tech-text">{project.tech}</p>
              <p className="mobile-year-text">{project.year}</p>

              {isFocusedMobile && (
                <div className="mobile-reveal-panel">
                  <a href={project.url} target="_blank" rel="noreferrer" className="mobile-img-wrapper" aria-label={`View project ${project.name}`}>
                    <img src={project.img} alt="Preview" />
                  </a>
                  <div className='mobile_cursor_info_box'>
                    <span className='info-label'>// SYS_DESC</span>
                    <p className='info-desc'>{project.desc}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!isMobile && (
          <>
            <div ref={cursorRef} className='mywork_sec_cursor'>
              <div className='cursor_circle_visual'>
                <div className='cursor-plus-mark'></div>
                <span className='orbit-band'>
                  <div className='band-front'><span className='marquee'>{(formattedText + " ").repeat(10)}</span></div>
                </span>
                <span className='desktop-bg-giant-year'>{currentProject?.year}</span>
              </div>
            </div>

            <div ref={infoBoxRef} className='cursor_info_box_wrapper'>
              <div className='cursor_info_box'>
                <span className='info-label'>// SYS_DESC</span>
                <p className='info-desc'>{currentProject?.desc}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Mywork;