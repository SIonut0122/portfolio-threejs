import { useEffect, useState, useContext } from 'react';
import isLogo from '../assets/images/is-logo.png';


function Header() {

    
    useEffect(() => {
        document.querySelectorAll('.header-hov-icon').forEach(el => el.addEventListener('mouseover', handleMouseOver));
        document.querySelectorAll('.header-hov-icon').forEach(el => el.addEventListener('mouseleave', handleMouseLeave));
    
        let hamburger = document.querySelector('.hamburger');
        let mobilemenu = document.querySelector('.mobile-menu-cont');

        hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('isactive');
        mobilemenu.classList.toggle('mobilemenu-active');
        document.querySelector('body').classList.toggle('fixed-body');
        });
        
       
    },[])
    
    
    const handleMouseOver = () => {
        if(document.querySelector('.mywork_sec_cursor')) {
            document.querySelector('.mywork_sec_cursor').setAttribute('style','opacity:0');
        }
    }
    const handleMouseLeave = () => {
           setTimeout(() => {
            if(document.querySelector('.mywork_sec_cursor')) {
                document.querySelector('.mywork_sec_cursor').setAttribute('style','opacity:1');
            }
           }, 200);
    }

    return (
        <header>
           <div className='header-sm header-logo header-hov-icon'>
            <img className="header-nav-home" src={isLogo} alt=''/>
           </div>
           <div className='header-bg header-mid'>
            <p>Ionut Stan</p>
           </div>
           <div className='header-sm header-nav header-hov-icon header-wrpall'>
                <div className='header-nav-wrapper'>
                    <div className='headernavwrp-home'>
                        <button id='header-nav-mywork' className='btn header-nav-btn header-nav-mywork' type='button'>MY WORK</button>
                        <span>/</span>
                        <button className='btn header-nav-btn header-nav-aboutme' type='button'>ABOUT ME</button>
                    </div>
                    <div className='headernavwrp-mywork d-none'>
                        <button className='btn header-nav-btn header-nav-home' type='button'>BACK TO HOME</button>
                        <span>/</span>
                        <button  className='btn header-nav-btn header-nav-aboutme' type='button'>ABOUT ME</button>
                    </div>
                    <div className='headernavwrp-aboutme d-none'>
                    <button className="item-1 btn header-nav-btn header-nav-home">
                        <span className="inner">
                        <span className="label">GO BACK</span>
                        </span>
                    </button>
                    
                    </div>
                </div>

                <div className="hamburger">
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                </div>
                    
           </div>
           <div className='mobile-menu-cont'>
                <ul>
                    <li><button className='btn header-nav-home mobnav-btn mobnav-home' type='button'>Home</button></li>
                    <li><button className='btn header-nav-mywork mobnav-btn mobnav-mywork' type='button'>My work</button></li>
                    <li><button className='btn header-nav-aboutme mobnav-btn mobnav-aboutme' type='button'>About me</button></li>
                </ul>
           </div>
        </header>
    )
}

export default Header;