import React, { useEffect } from 'react';
 



function First() {

    useEffect(() => {
      // hightlight nav mobile menu btn
      document.querySelectorAll('.mobnav-btn').forEach(el => el.classList.remove('mobmenu-btn-active'));
      document.querySelector('.mobnav-home').classList.add('mobmenu-btn-active');


      document.querySelector('.headernavwrp-home').classList.remove('d-none');

      setTimeout(() => {
      document.querySelector('.headernavwrp-home').style.opacity = '1';
      document.querySelector('.home_container_cont').style.opacity = '1';
      document.querySelector('.first_container').style.opacity = '1';
      document.querySelector('.first_cont_section').style.display = 'block';
      
      document.querySelector('.csmright_dmore_wrp').style.opacity = '1';
    
      document.querySelector('.headernavwrp-aboutme').classList.remove('disabled-nav');
      document.querySelector('.headernavwrp-home').classList.remove('disabled-nav');
      }, 1200);
    },[])

  
    return (
      <div className='first_container w-100'>
        <section className='first_cont_section'>
           <h3>Front-End</h3>
           <h3><span>Dev</span>eloper</h3>

        </section>
        <p className='first_bott_bb'>Bucharest</p>
      </div>
    )
}

export default First;