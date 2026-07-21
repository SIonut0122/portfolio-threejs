import React, { useEffect } from 'react';

function First() {
  useEffect(() => {
    document.querySelectorAll('.mobnav-btn').forEach(el => el.classList.remove('mobmenu-btn-active'));
    document.querySelector('.mobnav-home')?.classList.add('mobmenu-btn-active');
    document.querySelector('body')?.classList.remove('fixed-body');

    const headerHome = document.querySelector('.headernavwrp-home');
    const homeCont = document.querySelector('.home_container_cont');
    const firstCont = document.querySelector('.first_container');
    const firstSection = document.querySelector('.first_cont_section');
    const csmMore = document.querySelector('.csmright_dmore_wrp');

    if (headerHome) {
      headerHome.classList.remove('d-none');
      setTimeout(() => {
        headerHome.style.opacity = '1';
        headerHome.classList.remove('disabled-nav');
      }, 50);
    }

    if (homeCont) homeCont.style.opacity = '1';
    if (firstSection) firstSection.style.display = 'block';

    if (firstCont) {
      setTimeout(() => {
        firstCont.style.opacity = '1';
      }, 50);
    }

    if (csmMore) csmMore.style.opacity = '1';
    
    document.querySelector('.headernavwrp-aboutme')?.classList.remove('disabled-nav');

    return () => {
      if (firstCont) firstCont.style.opacity = '0';
    };
  }, []);

  const subtitleText = "Turn ideas into reality";
  let globalCharIndex = 0;

  return (
    <div className='first_container w-100'>
      <section className='first_cont_section'>
        <h3>Front-End</h3>
        <h3><span>Dev</span>eloper</h3>
        
        <p className='first_subtitle'>
          {subtitleText.split(' ').map((word, wordIndex) => (
            <span key={wordIndex} className="subtitle_word">
              {word.split('').map((char, charIndex) => {
                const randomX = (Math.random() - 0.5) * 120;
                const randomY = (Math.random() - 0.5) * 120;
                const randomRot = (Math.random() - 0.5) * 90;
                
                const delay = 0.6 + globalCharIndex * 0.05; 
                globalCharIndex++;

                return (
                  <span key={charIndex} className="letter_wrapper">
                    <span 
                      className="subtitle_letter"
                      style={{
                        '--x': `${randomX}px`,
                        '--y': `${randomY}px`,
                        '--r': `${randomRot}deg`,
                        '--delay': `${delay}s`
                      }}
                    >
                      {char}
                    </span>
                  </span>
                );
              })}
            </span>
          ))}
        </p>
      </section>
      <p className='first_bott_bb'>Bucharest</p>
    </div>
  );
}

export default First;