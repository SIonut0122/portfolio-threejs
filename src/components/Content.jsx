import { useEffect, useState, useContext } from 'react';
import { MainContext} from "./Home";
import Aboutme from "./Aboutme";
import Mywork from "./Mywork";
import First from "./First";
import topArrow from '../assets/images/hm_more_arrow.png';


function Content() {
    const {openAboutme, setOpenAboutme} = useContext(MainContext);
    const {openMyWork, setOpenMyWork} = useContext(MainContext);
    const {openFirst, setOpenFirst} = useContext(MainContext);

    useEffect(() => {
    },[openAboutme])

    return (
            <div className='content_container'>
                <div className='content_cont_sm content_cont_sm_left'>
                    <p>Portfolio 2023</p>

                    {openAboutme && (
                    <div className='ccsml-fill-scr'><span></span></div>
                    )}
                    
                </div>
                <div className='content_cont_mid content_cont_bg_mid'>
                    {openFirst && (
                        <First/>
                    )}
                    {openAboutme && (
                        <Aboutme/>
                    )}
                    {openMyWork && (
                        <Mywork/>
                    )}
                </div>
                <div className='content_cont_sm content_cont_sm_right'>
                    <div className='csmright_dmore_wrp'>
                    <div className='octagon'>
                        <img src={topArrow} alt='More arrow'/>
                        <div className='inner'>
                            <p>more</p>
                        </div>
                    </div>
                     </div>
                </div>
            </div>
    )
}

export default Content;