import { useContext, useEffect, useState } from 'react';
import { MainContext } from "./Home";
import isLogo from '../assets/images/is-logo.png';

function Header() {
    const context = useContext(MainContext);
    const { openAboutme, openMyWork, openFirst, setOpenAboutme, setOpenMyWork, setOpenFirst } = context || {};
    const [isScrolled, setIsScrolled] = useState(false);
    const [isNavReady, setIsNavReady] = useState(false);

    useEffect(() => {
        if (!openMyWork && !openAboutme) {
            document.body.classList.add('overflow-disabled');
        } else {
            document.body.classList.remove('overflow-disabled');
        }
        return () => {
            document.body.classList.remove('overflow-disabled');
        };
    }, [openMyWork, openAboutme]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsNavReady(false);
        const delay = openFirst ? 2500 : 800; 
        const timer = setTimeout(() => {
            setIsNavReady(true);
        }, delay);
        return () => clearTimeout(timer);
    }, [openFirst, openAboutme, openMyWork]);

    const toggleMenu = () => {
        if (!isNavReady) return;
        const hamburger = document.querySelector('.hamburger');
        const mobilemenu = document.querySelector('.mobile-menu-cont');
        hamburger?.classList.toggle('isactive');
        mobilemenu?.classList.toggle('mobilemenu-active');
        document.body.classList.toggle('fixed-body');
    };

    const handleTransition = (nextAction) => {
        const hamburger = document.querySelector('.hamburger');
        const mobilemenu = document.querySelector('.mobile-menu-cont');
        if (hamburger?.classList.contains('isactive')) {
            hamburger.classList.remove('isactive');
            mobilemenu?.classList.remove('mobilemenu-active');
            document.body.classList.remove('fixed-body');
        }

        const containers = document.querySelectorAll('.mywork_container, .aboutme_container, .first_container, .home_container_cont');
        
        containers.forEach(container => {
            container.style.opacity = '0';
            container.style.transition = 'opacity 1.5s ease-in-out';
        });

        setTimeout(() => {
            nextAction();
        }, 1500);
    };

    const goToHome = () => handleTransition(() => { setOpenFirst(true); setOpenAboutme(false); setOpenMyWork(false); });
    const goToMyWork = () => handleTransition(() => { setOpenFirst(false); setOpenAboutme(false); setOpenMyWork(true); });
    const goToAboutMe = () => handleTransition(() => { setOpenFirst(false); setOpenAboutme(true); setOpenMyWork(false); });

    return (
        <header className={isScrolled ? 'header-scrolled' : ''}>
            <div className='header-logo'>
                <img src={isLogo} alt='Logo' />
            </div>
            
            <div className='header-mid'>
                <p>Ionut Stan</p>
            </div>
            
            <div 
                className='header-nav-container'
                style={{
                    opacity: isNavReady ? 1 : 0,
                    pointerEvents: isNavReady ? 'auto' : 'none',
                    transition: 'opacity 0.6s ease-in-out'
                }}
            >
                <div className='header-nav-wrapper'>
                    {openFirst && (
                        <div className='headernavwrp-dynamic fade-in-nav'>
                            <button className='btn header-nav-btn' type='button' onClick={goToMyWork}>MY WORK</button>
                            <span>/</span>
                            <button className='btn header-nav-btn' type='button' onClick={goToAboutMe}>ABOUT ME</button>
                        </div>
                    )}
                    {!openFirst && (
                        <div className='headernavwrp-dynamic fade-in-nav'>
                            <button className='btn header-nav-btn' type='button' onClick={goToHome}>BACK TO HOME</button>
                            <span>/</span>
                            <button className='btn header-nav-btn' type='button' onClick={openAboutme ? goToMyWork : goToAboutMe}>
                                {openAboutme ? 'MY WORK' : 'ABOUT ME'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="hamburger" onClick={toggleMenu}>
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                </div>
            </div>

            <div className='mobile-menu-cont'>
                <div className="mmenu-grid-bg"></div>
                <div className="mmenu-wireframe">
                    <div className="mmenu-ticks"></div>
                    <ul>
                        <li>
                            <span className="mmenu-idx">01</span>
                            <button className="btn" type='button' onClick={goToHome}>Home</button>
                            <div className="mmenu-oct-target"></div>
                        </li>
                        <li>
                            <span className="mmenu-idx">02</span>
                            <button className="btn" type='button' onClick={goToMyWork}>My work</button>
                            <div className="mmenu-oct-target"></div>
                        </li>
                        <li>
                            <span className="mmenu-idx">03</span>
                            <button className="btn" type='button' onClick={goToAboutMe}>About me</button>
                            <div className="mmenu-oct-target"></div>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}

export default Header;