import { useEffect, useState, useContext } from 'react';
import { MainContext} from "./Home";
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


    useEffect(() => {
      
       // hightlight nav mobile menu btn
       document.querySelectorAll('.mobnav-btn').forEach(el => el.classList.remove('mobmenu-btn-active'));
       document.querySelector('.mobnav-mywork').classList.add('mobmenu-btn-active');

       
      const posDoc = document.querySelector('.mywork_section');
      posDoc.addEventListener('mousemove', (e) => posHandler(e));


      document.querySelector('.headernavwrp-mywork').classList.remove('d-none');
      document.querySelector('.mywork_container').classList.remove('d-none');

    setTimeout(() => {
      document.querySelector('.headernavwrp-mywork').style.opacity = '1';
      document.querySelector('.mywork_container').style.opacity = '1';
      document.querySelector('.headernavwrp-mywork').classList.remove('disabled-nav');
    }, 1200);
      
    },[])

    const posHandler = (e) => {
      const posDoc = document.querySelector('.mywork_section');
      posDoc.style.setProperty('--x', e.clientX + "px");
      posDoc.style.setProperty('--y', e.clientY + "px");
    }
    return (
      <div className='mywork_container w-100 d-none'>
        <section className='mywork_section'>
            <div id="mywork_sec_wrpul_id" className='mywork_sec_wrpul'>
              <ul className='mywork_section_ul'>
                  <li><a href='https://www.sigurantapenet.ro' target="_blank" data-text='Sigurantapenet'><img src={sigurantapenet} alt=''/>Sigurantapenet <span>(job related)</span></a></li>
                  <li><a href='https://sionut0122.github.io/ecommlap/' target="_blank" data-text='Ecommlap'><img src={ecommlap} alt=''/>Ecommlap <span>(in progress)</span></a></li>
                  <li><a href='https://sionut0122.github.io/ecommercetdesign/#/' target="_blank" data-text='eCommerceTDesign'><img src={ecommtdesign} alt=''/>eCommerceTDesign</a></li>
                  <li><a href='https://sionut0122.github.io/ecommercejager/#/' target="_blank" data-text='eCommerceJager '><img src={ecommjager} alt=''/>eCommerceJager </a></li>
                  <li><a href='https://sionut0122.github.io/musicplayer/' target="_blank" data-text='musicPlayer'><img src={musicplayer} alt=''/>musicPlayer</a></li>
                  <li><a href='https://sionut0122.github.io/LiveChatV2.0/' target="_blank" data-text='Livechat v.2.0'><img src={livechatv20} alt=''/>Livechat v.2.0</a></li>
                  <li><a href='https://sionut0122.github.io/pizzaDelivery/#/' target="_blank" data-text='pizzaDelivery'><img src={pizzadelivery} alt=''/>pizzaDelivery</a></li>
                  <li><a href='https://sionut0122.github.io/imgfbhost/' target="_blank" data-text='ImgFBHost'><img src={imgfbhost} alt=''/>ImgFBHost</a></li>
                  <li><a href='https://sionut0122.github.io/CoffeeShop/#/' target="_blank" data-text='CoffeeShop'><img src={coffeshop} alt=''/>CoffeeShop</a></li>
                  <li><a href='https://sionut0122.github.io/fooddelivery/' target="_blank" data-text='foodDelivery'><img src={fooddelivery} alt=''/>foodDelivery</a></li>
                  <li><a href='https://sionut0122.github.io/ecommercetv/' target="_blank" data-text='eCommerceTv'><img src={ecommtv} alt=''/>eCommerceTv</a></li>
                  <span className='mywork_sec_cursor'></span>
                </ul>
            </div>

        </section>
      </div>
    )
}

export default Mywork;