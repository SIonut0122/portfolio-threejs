import { useContext, useEffect } from 'react';
import { MainContext } from "./Home";
import Aboutme from "./Aboutme";
import Mywork from "./Mywork";
import First from "./First";
import ScrollIndicator from './ScrollIndicator';

function Content() {
    const context = useContext(MainContext);
    
    const { openAboutme = false, openMyWork = false, openFirst = true } = context || {};

    const renderActiveContent = () => {
        if (openFirst) return <First />;
        if (openAboutme) return <Aboutme />;
        if (openMyWork) return <Mywork />;
        return null;
    };


    return (
        <div className='content_container'>
            <div className='content_cont_sm content_cont_sm_left'>
                {!openAboutme && (
                <p>Portfolio {new Date().getFullYear()}</p>
                )}
            </div>

            <div className='content_cont_mid content_cont_bg_mid'>
                {renderActiveContent()}
            </div>

            <div className='content_cont_sm content_cont_sm_right'>
                {openAboutme && (
                    <div className='csmright_dmore_wrp active'>
                        <ScrollIndicator />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Content;