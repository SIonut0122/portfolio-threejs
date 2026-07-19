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

    if (headerHome) headerHome.classList.remove('d-none');

    setTimeout(() => {
      if (headerHome) headerHome.style.opacity = '1';
      if (homeCont) homeCont.style.opacity = '1';
      if (firstCont) firstCont.style.opacity = '1';
      if (firstSection) firstSection.style.display = 'block';
      if (csmMore) csmMore.style.opacity = '1';
      
      document.querySelector('.headernavwrp-aboutme')?.classList.remove('disabled-nav');
      document.querySelector('.headernavwrp-home')?.classList.remove('disabled-nav');
    }, 1200);
  }, []);

  return (
    <div className='first_container w-100'>
      <section className='first_cont_section'>
        <h3>Front-End</h3>
        <h3><span>Dev</span>eloper</h3>
        <p className='first_subtitle'>Turn ideas into reality</p>
      </section>
      <p className='first_bott_bb'>Bucharest</p>
    </div>
  )
}

export default First;