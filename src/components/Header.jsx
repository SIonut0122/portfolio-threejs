import React, { useContext, useEffect, useState } from 'react';
import { MainContext } from "./Home";
import { GLOBAL_DATA, NAV_LINKS } from '../data/portfolioData';
import isLogo from '../assets/images/is-logo.png';
import { playClickSound } from '../utils/soundUtils';

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
        return () => document.body.classList.remove('overflow-disabled');
    }, [openMyWork, openAboutme]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsNavReady(false);
        const delay = openFirst ? 2800 : 1200; 
        const timer = setTimeout(() => setIsNavReady(true), delay);
        return () => clearTimeout(timer);
    }, [openFirst, openAboutme, openMyWork]);

    const toggleMenu = () => {
        if (!isNavReady) return;
        playClickSound();
        document.querySelector('.hamburger')?.classList.toggle('isactive');
        document.querySelector('.mobile-menu-cont')?.classList.toggle('mobilemenu-active');
        document.body.classList.toggle('fixed-body');
    };

    const handleTransition = (nextAction) => {
        playClickSound();
        setIsNavReady(false);

        const hamburger = document.querySelector('.hamburger');
        if (hamburger?.classList.contains('isactive')) {
            hamburger.classList.remove('isactive');
            document.querySelector('.mobile-menu-cont')?.classList.remove('mobilemenu-active');
            document.body.classList.remove('fixed-body');
        }

        document.querySelectorAll('.mywork_container, .aboutme_container, .first_container, .home_container_cont')
            .forEach(container => {
                container.style.opacity = '0';
                container.style.transition = 'opacity 1.5s ease-in-out';
            });

        setTimeout(() => nextAction(), 1500);
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
                <p>{GLOBAL_DATA.author}</p>
            </div>
            
            <div 
                className='header-nav-container'
                style={{
                    opacity: isNavReady ? 1 : 0,
                    pointerEvents: isNavReady ? 'auto' : 'none',
                    transition: isNavReady ? 'opacity 0.8s ease-in-out' : 'opacity 0.15s ease-out'
                }}
            >
                <div className='header-nav-wrapper'>
                    {openFirst && (
                        <div className='headernavwrp-dynamic fade-in-nav'>
                            <button className='btn header-nav-btn' type='button' onClick={goToMyWork}>
                                <span className='nav-indicator'></span>
                                <span className='nav-text'>MY WORK</span>
                            </button>
                            <span className='nav-slash'>/</span>
                            <button className='btn header-nav-btn' type='button' onClick={goToAboutMe}>
                                <span className='nav-indicator'></span>
                                <span className='nav-text'>ABOUT ME</span>
                            </button>
                        </div>
                    )}
                    {!openFirst && (
                        <div className='headernavwrp-dynamic fade-in-nav'>
                            <button className='btn header-nav-btn' type='button' onClick={goToHome}>
                                <span className='nav-indicator'></span>
                                <span className='nav-text'>BACK TO HOME</span>
                            </button>
                            <span className='nav-slash'>/</span>
                            <button className='btn header-nav-btn' type='button' onClick={openAboutme ? goToMyWork : goToAboutMe}>
                                <span className='nav-indicator'></span>
                                <span className='nav-text'>{openAboutme ? 'MY WORK' : 'ABOUT ME'}</span>
                            </button>
                        </div>
                    )}
                </div>

                <button 
                  className="hamburger" 
                  onClick={toggleMenu} 
                  aria-label="Toggle mobile menu"
                  style={{ background: 'transparent', border: 'none' }}
                >
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                </button>
            </div>

            <div className='mobile-menu-cont'>
                <div className="mmenu-grid-bg"></div>
                <div className="mmenu-wireframe">
                    <div className="mmenu-ticks"></div>
                    <ul>
                        <li className={openFirst ? 'is-active-item' : ''}>
                            <span className="mmenu-idx">{NAV_LINKS[0].id}</span>
                            <button className="btn" type='button' onClick={goToHome}>{NAV_LINKS[0].label}</button>
                            <div className="mmenu-oct-target"></div>
                        </li>
                        <li className={openMyWork ? 'is-active-item' : ''}>
                            <span className="mmenu-idx">{NAV_LINKS[1].id}</span>
                            <button className="btn" type='button' onClick={goToMyWork}>{NAV_LINKS[1].label}</button>
                            <div className="mmenu-oct-target"></div>
                        </li>
                        <li className={openAboutme ? 'is-active-item' : ''}>
                            <span className="mmenu-idx">{NAV_LINKS[2].id}</span>
                            <button className="btn" type='button' onClick={goToAboutMe}>{NAV_LINKS[2].label}</button>
                            <div className="mmenu-oct-target"></div>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}

export default Header;