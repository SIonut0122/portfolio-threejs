import React, {useEffect, useState, useContext, createContext} from "react";
import HomeCanvas from './Home_canvas';
import Content from './Content';
import Header from './Header';

export const MainContext = React.createContext();

function Home() {
  const [canvasIsVisible, setCanvasIsVisible] = useState(true);
  const [wireFrameOn, setWireFrameOn] = useState(false);
  const [openAboutme, setOpenAboutme] = useState(false);
  const [openMyWork, setOpenMyWork] = useState(false);
  const [openFirst, setOpenFirst] = useState(true);

  return (
    <>
      <div className='home_container_full w-100'>
      <Header />
        <MainContext.Provider value={{  
            canvasIsVisible, setCanvasIsVisible,
            wireFrameOn, setWireFrameOn,
            openAboutme, setOpenAboutme,
            openMyWork, setOpenMyWork,
            openFirst, setOpenFirst
        }}>
        <button className="d-none" id='whitefireframe' type='button'>White / wireframe</button>
        <button className="d-none" id='blackwhiteframe' type='button'>Black / wireframe</button>

          <HomeCanvas />
          <Content />
              
        </MainContext.Provider>
      </div>
    </>
  );
}

export default Home;
