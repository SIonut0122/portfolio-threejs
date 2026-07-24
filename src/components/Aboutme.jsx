import { useEffect, useRef, useContext, useState } from 'react';
import { MainContext } from "./Home";
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import gsap from 'gsap';
import SplitType from 'split-type';
import Lenis from '@studio-freight/lenis';
import { ABOUT_DATA, GLOBAL_DATA } from '../data/portfolioData';
import { playClickSound } from '../utils/soundUtils';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';

function ScrambleText({ text, delay = 0, duration = 1000 }) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    document.title = '] ABOUT ME [ Ionut Stan - Front-End Developer';

    let frame = 0;
    const totalFrames = 25; 
    let interval;
    const timer = setTimeout(() => {
      interval = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const revealedLength = Math.floor(progress * text.length);

        const current = text.split('').map((char, i) => {
          if (char === ' ' || char === ',') return char;
          if (i < revealedLength) return text[i];
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }).join('');

        setDisplayText(current);
        if (frame >= totalFrames) {
          clearInterval(interval);
          setDisplayText(text);
        }
      }, duration / totalFrames);
    }, delay);

    return () => { 
      clearTimeout(timer); if (interval) clearInterval(interval);
      document.title = 'Ionut Stan - Front-End Developer';

    };
  }, [text, delay, duration]);

  return <>{displayText || text.split('').map(() => SCRAMBLE_CHARS[0]).join('')}</>;
}

function Aboutme() {
  const progressBarRef = useRef(null);
  const { setOpenAboutme, setOpenMyWork, setOpenFirst } = useContext(MainContext);
  const [localTime, setLocalTime] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const options = { timeZone: 'Europe/Bucharest', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      setLocalTime(new Intl.DateTimeFormat([], options).format(new Date()));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.querySelectorAll('.mobnav-btn').forEach(el => el.classList.remove('mobmenu-btn-active'));
    document.querySelector('.mobnav-aboutme')?.classList.add('mobmenu-btn-active');
    document.body.style.overflow = 'visible';
    document.body.style.overflowX = 'hidden';
    document.body.style.height = 'auto';

    gsap.registerPlugin(ScrollTrigger);
    
    const lenis = new Lenis({ 
      lerp: 0.1, 
      smoothWheel: true,
      smoothTouch: true,
      syncTouch: true
    });

    lenis.on('scroll', (e) => {
      if (progressBarRef.current) {
        const progress = e.limit > 0 ? (e.scroll / e.limit) * 100 : 0;
        progressBarRef.current.style.width = `${progress}%`;
      }
      ScrollTrigger.update();
    });

    document.querySelectorAll('.reveal-type').forEach((char) => {
      const bg = char.dataset.bgColor;
      const fg = char.dataset.fgColor;
      const text = new SplitType(char, { types: 'char' });
      gsap.fromTo(text.chars, 
        { color: bg },
        { color: fg, duration: 0.5, stagger: 0.01, scrollTrigger: { trigger: char, start: 'top 80%', end: 'top 20%', scrub: true } }
      );
    });

    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
      document.body.style.overflow = '';
      document.body.style.overflowX = '';
      document.body.style.height = '';
    };
  }, [setOpenAboutme, setOpenMyWork, setOpenFirst]);

  const handleCopyEmail = (e) => {
    e.preventDefault();
    playClickSound();
    navigator.clipboard.writeText(GLOBAL_DATA.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkClick = () => {
    playClickSound();
  };

  return (
    <div className='aboutme_container'>
      <div className="ccsml-fill-scr"><span ref={progressBarRef}></span></div>

      <section className='aboutme_section aboutme_section_one'>
        <div className='aboutmesecone_wrp'>
          <h1>{ABOUT_DATA.titlePrefix} <span>{ABOUT_DATA.titleSpan}</span></h1>  
          <p>Portfolio {GLOBAL_DATA.year}</p>
        </div>

        <div className='about_extra_details'>
          <div className='about_meta_info'>
            <div className='location_wrapper'>
              <div className='radar_dot'></div>
              <span className='location_text'>
                <ScrambleText text={ABOUT_DATA.location} delay={300} duration={1000} />
              </span>
            </div>
            <p className='coords_text'>{ABOUT_DATA.coords}</p>
            <div className='time_wrapper'>
              <span className='time_label'>LOCAL TIME:</span>
              <span className='time_value'>{localTime} EET</span>
            </div>
          </div>
        </div>
      </section>

      <section className='aboutme_section aboutme_section_two'>
        <p className="p_style">I'm <span>a</span> Front-End Developer with a <span>passion for</span> turning ideas into interactive and user-friendly <span>digital</span> experiences.</p>
        <p className="p_style">My focus is on <span>creative development</span> and crafting interfaces that bring <span>websites to life</span> effectively.</p>
      </section>

      <section className='aboutme_section aboutme_section_three'>
        <p className="aboutme_p_title">Experience</p>
        <div className="aboutme_sec_exp_wrp aboume_secexp">
          <ul>
            {ABOUT_DATA.experience.map((item, i) => (
              <li key={i}>
                <div className='abme_years abm_ul_li_div'>{item.years}</div>
                <div className='abme_role abm_ul_li_div'>{item.role}</div>
                <div className='abme_type abm_ul_li_div'>{item.type}</div>
              </li>
            ))}
          </ul>
        </div>

        <p className="aboutme_p_title mt-5">Working with</p>
        <div className="aboutme_sec_exp_wrp aboutmesec_exp_workingwith">
          <ul>
            {ABOUT_DATA.workingWith.map((row, i) => (
              <li key={i}>{row.map((tech, idx) => <span key={idx}>{tech}</span>)}</li>
            ))}
          </ul>
        </div>

        <p className="aboutme_p_title mt-5">Familiar with</p>
        <div className="aboutme_sec_exp_wrp aboutmesec_exp_workingwith">
          <ul>
            {ABOUT_DATA.familiarWith.map((row, i) => (
              <li key={i}>{row.map((tech, idx) => <span key={idx}>{tech}</span>)}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className='aboutme_section aboutme_section_contact'>
        <div className='aboutme_row'>
          <p className="reveal-type p_style" data-bg-color="transparent" data-fg-color="white">{ABOUT_DATA.contactTitle1}</p>
          <p className="reveal-type p_style p_style_two" data-bg-color="transparent" data-fg-color="white">{ABOUT_DATA.contactTitle2}</p>
          
          <div className='mailto_wrapper_row'>
            <a className='mailto_contact' href={`mailto:${GLOBAL_DATA.email}`} onClick={handleLinkClick}>
              {GLOBAL_DATA.email}
            </a>
            <button className='copy_icon_btn' onClick={handleCopyEmail} aria-label="Copy email address" title="Copy email">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
              </svg>
              {copied && <span className="copied_popup">Copied!</span>}
            </button>
          </div>

          <div className='aboutme_social'>
            <a href={GLOBAL_DATA.github} target='_blank' rel="noreferrer" aria-label="Visit my GitHub" onClick={handleLinkClick}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
            </a>
            <a href={GLOBAL_DATA.linkedin} target='_blank' rel="noreferrer" aria-label="Visit my LinkedIn" onClick={handleLinkClick}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>
            </a>
          </div>
        </div>
        <div className='aboutme_row'>
          <div className='aboutme_credits'>
            <p>©{GLOBAL_DATA.year} — {GLOBAL_DATA.author}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Aboutme;