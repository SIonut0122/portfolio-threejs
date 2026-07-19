import { useEffect, useState, useRef, useContext } from 'react';
import { MainContext } from "./Home";
import sigurantapenet from '../assets/images/projects/sigurantapenet.png';
import ecommlap from '../assets/images/projects/ecommlap.png';
import ecommtdesign from '../assets/images/projects/ecommtdesign.png';
import ecommjager from '../assets/images/projects/ecommjager.png';
import musicplayer from '../assets/images/projects/musicplayer.png';
import livechatv20 from '../assets/images/projects/livechatv20.png';
import pizzadelivery from '../assets/images/projects/pizzadelivery.png';
import imgfbhost from '../assets/images/projects/imgfbhost.png';
import coffeshop from '../assets/images/projects/coffeshop.png';
import fooddelivery from '../assets/images/projects/fooddelivery.png';
import ecommtv from '../assets/images/projects/ecommtv.png';

function Mywork() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const mobileTimeoutRef = useRef(null);
  
  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);

  const projects = [
    { name: 'Startech Team', year: '2023', tech: 'HTML • CSS • JS • LARAVEL', url: 'https://startechteam.ro/acasa', img: sigurantapenet, top: '15%', left: '10%', speed: -0.02 },
    { name: 'Sigurantapenet', year: '2024', tech: 'HTML • CSS • JS • PHP', url: 'https://www.sigurantapenet.ro', img: sigurantapenet, top: '16%', left: '42%', speed: 0.02 },
    { name: 'eCommerceTv', year: '2019', tech: 'THREEJS • WEBGL • SHADERS • CSS', url: 'https://sionut0122.github.io/ecommercetv/', img: ecommtv, top: '24%', left: '16%', speed: -0.03 },
    { name: 'Ecommlap', year: '2023', tech: 'REACT • SCSS • THREEJS • GSAP', url: 'https://sionut0122.github.io/ecommlap/', img: ecommlap, top: '22%', left: '72%', speed: 0.03 },
    { name: 'eCommerceTDesign', year: '2022', tech: 'REACT • REDUX • BOOTSTRAP', url: 'https://sionut0122.github.io/ecommercetdesign/#/', img: ecommtdesign, top: '34%', left: '8%', speed: -0.04 },
    { name: 'eCommerceJager', year: '2022', tech: 'REACT • CONTEXT • MATERIALUI', url: 'https://sionut0122.github.io/ecommercejager/#/', img: ecommjager, top: '33%', left: '56%', speed: 0.02 },
    { name: 'musicPlayer', year: '2019', tech: 'VANILLA JS • CSS3 • AUDIO API', url: 'https://sionut0122.github.io/musicplayer/', img: musicplayer, top: '44%', left: '76%', speed: -0.03 },
    { name: 'Livechat v.2.0', year: '2019', tech: 'NODEJS • SOCKETIO • REACT', url: 'https://sionut0122.github.io/LiveChatV2.0/', img: livechatv20, top: '48%', left: '30%', speed: 0.04 },
    { name: 'pizzaDelivery', year: '2022', tech: 'REACT • ROUTER • FIREBASE', url: 'https://sionut0122.github.io/pizzaDelivery/#/', img: pizzadelivery, top: '56%', left: '55%', speed: -0.01 },
    { name: 'ImgFBHost', year: '2019', tech: 'JS • FETCH API • LIVE STORAGE', url: 'https://sionut0122.github.io/imgfbhost/', img: imgfbhost, top: '65%', left: '12%', speed: 0.03 },
    { name: 'CoffeeShop', year: '2022', tech: 'HTML5 • SASS • FLEXBOX', url: 'https://sionut0122.github.io/CoffeeShop/#/', img: coffeshop, top: '67%', left: '40%', speed: -0.02 },
    { name: 'foodDelivery', year: '2020', tech: 'REACT • HOOKS • REST API', url: 'https://sionut0122.github.io/fooddelivery/', img: fooddelivery, top: '72%', left: '68%', speed: 0.05 }
  ];

  useEffect(() => {
    document.querySelectorAll('.mobnav-btn').forEach(el => el.classList.remove('mobmenu-btn-active'));
    document.querySelector('.mobnav-mywork')?.classList.add('mobmenu-btn-active');
    
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
        
    const posDoc = containerRef.current;
    
    const handleMouseMove = (e) => {
      if (!posDoc || window.innerWidth <= 767.98) return;
      const rect = posDoc.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      posDoc.style.setProperty('--x', mouseX + "px");
      posDoc.style.setProperty('--y', mouseY + "px");

      const maxCircleSize = 500;
      let dynamicSize = maxCircleSize;
      
      if (e.clientY < 250) {
        dynamicSize = Math.max(300, e.clientY * 2);
      }
      
      const distFromLeft = e.clientX;
      const distFromRight = window.innerWidth - e.clientX;
      const minHorizontalDist = Math.min(distFromLeft, distFromRight);

      if (minHorizontalDist < 250) {
        const edgeSize = Math.max(300, minHorizontalDist * 2);
        dynamicSize = Math.min(dynamicSize, edgeSize);
      }

      posDoc.style.setProperty('--cursor-size', dynamicSize + "px");

      const items = posDoc.querySelectorAll('.scatter_item');
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const moveX = e.clientX - centerX;
      const moveY = e.clientY - centerY;

      items.forEach((item) => {
        const speed = parseFloat(item.getAttribute('data-speed')) || 0.02;
        item.style.transform = `translate(${moveX * speed}px, ${moveY * speed}px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
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
      }, 500); 
    };

    const navigateToItem = (nextIndex) => {
      if (nextIndex < 0 || nextIndex >= projects.length) return;
      
      isScrollingRef.current = true;
      setShowMobileDetails(false);
      setMobileActiveIndex(nextIndex);

      const itemHeight = 110; 
      scrollContainer.scrollTo({
        top: nextIndex * itemHeight,
        behavior: 'smooth'
      });

      setTimeout(() => {
        isScrollingRef.current = false;
        triggerDetailsTimeout();
      }, 450); 
    };

    const handleWheel = (e) => {
      e.preventDefault();
      if (isScrollingRef.current) return;

      if (e.deltaY > 0) {
        navigateToItem(mobileActiveIndex + 1);
      } else if (e.deltaY < 0) {
        navigateToItem(mobileActiveIndex - 1);
      }
    };

    const handleTouchStart = (e) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (isScrollingRef.current) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartYRef.current - touchEndY;

      if (Math.abs(diffY) > 30) { 
        if (diffY > 0) {
          navigateToItem(mobileActiveIndex + 1);
        } else {
          navigateToItem(mobileActiveIndex - 1);
        }
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

  const currentActiveIndex = window.innerWidth <= 767.98 ? mobileActiveIndex : activeIndex;
  const currentProject = projects[currentActiveIndex];
  const formattedText = currentProject ? `${currentProject.tech} • ` : "";

  const hasItemsAbove = mobileActiveIndex > 0;
  const hasItemsBelow = mobileActiveIndex < projects.length - 1;

  return (
    <div ref={containerRef} className='mywork_container w-100'>
      {window.innerWidth <= 767.98 && (
        <>
          <div className={`mobile-nav-arrow arrow-top ${showMobileDetails && hasItemsAbove ? 'visible' : ''}`}>
            <span></span>
          </div>
          <div className={`mobile-nav-arrow arrow-bottom ${showMobileDetails && hasItemsBelow ? 'visible' : ''}`}>
            <span></span>
          </div>
        </>
      )}

      <div 
        ref={scrollContainerRef} 
        className={`scatter_grid_wrapper ${window.innerWidth <= 767.98 && showMobileDetails ? 'is-darkened' : ''}`}
      >
        {projects.map((project, index) => {
          const isFocusedMobile = window.innerWidth <= 767.98 && mobileActiveIndex === index;
          return (
            <div 
              key={index} 
              className={`scatter_item ${isFocusedMobile ? 'is-focused' : ''} ${isFocusedMobile && showMobileDetails ? 'show-details' : ''}`}
              data-speed={project.speed}
              style={{ top: project.top, left: project.left }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <a href={project.url} target="_blank" rel="noreferrer" data-text={project.name}>
                <img className="desktop-preview" src={project.img} alt=''/>
                <span className="project_title_text">
                  {project.name}
                </span>
              </a>

              <p className="mobile-tech-text">{project.tech}</p>
              <p className="mobile-year-text">{project.year}</p>

              {isFocusedMobile && (
                <div className="mobile-reveal-panel">
                  <a href={project.url} target="_blank" rel="noreferrer" className="mobile-img-wrapper">
                    <img src={project.img} alt="Preview" />
                  </a>
                </div>
              )}
            </div>
          );
        })}

        <span className='mywork_sec_cursor'>
          <span className='orbit-band'>
            <div className='band-front'>
              <span className='marquee'>{(formattedText + " ").repeat(10)}</span>
            </div>
          </span>
          <span className='desktop-bg-giant-year'>{currentProject?.year}</span>
        </span>
      </div>
    </div>
  );
}

export default Mywork;