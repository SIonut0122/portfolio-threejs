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
import startechteam from '../assets/images/projects/startechteam.png';


export const GLOBAL_DATA = {
    author: "Ionut Stan",
    year: new Date().getFullYear(),
    email: "stanionut0122@gmail.com",
    github: "https://github.com/SIonut0122?tab=repositories",
    linkedin: "https://www.linkedin.com/in/stan-ionut/"
};

export const NAV_LINKS = [
    { id: "01", label: "HOME" },
    { id: "02", label: "MY WORK" },
    { id: "03", label: "ABOUT ME" }
];

export const FIRST_DATA = {
    title1: "Front-End",
    title2: "Developer",
    subtitle: "Turn ideas into reality",
    location: "Bucharest"
};

export const ABOUT_DATA = {
    titleSpan: "ME",
    titlePrefix: "ABOUT",
    location: "BUCHAREST, RO",
    coords: "LAT 44.4268° N  |  LONG 26.1025° E",
    desc1: "I'm a Front-End Developer with a passion for turning ideas into interactive and user-friendly digital experiences.",
    desc2: "My focus is on creative development and crafting interfaces that bring websites to life effectively.",
    contactTitle1: "SAY",
    contactTitle2: "HELLO",
    experience: [
        { years: "2023 - present", role: "Front-End Developer — EveryMatrix", type: "Hybrid" },
        { years: "2022 - 2023", role: "Front-End Developer — Optimum Desk", type: "Remote" },
        { years: "2019 - present", role: "Front-End Developer — Self-Taught", type: "Portfolio" }
    ],
    workingWith: [
        ["HTML5 / SCSS", "Javascript", "Typescript", "React / Hooks"],
        ["Angular / Svelte", "StencilJS / Web Comp", "Redux / Context API", "Laravel"],
        ["REST APIs / Swagger", "Firebase", "Playwright", "Git / GitLab"],
        ["Vite / Webpack"]
    ],
    familiarWith: [
        ["Three.js", "MySQL", "Wordpress", "Photoshop"]
    ]
};

export const MYWORK_DATA = {
projects: [
        { 
            name: 'Startech Team', 
            year: '2023', 
            tech: 'HTML5 • SCSS • JS • LARAVEL', 
            desc: 'Outsourced IT services and AI-driven digitalization.', 
            url: 'https://startechteam.ro', 
            img: startechteam, 
            top: '15%', 
            left: '10%', 
            speed: -0.02 
        },
        { 
            name: 'Sigurantapenet', 
            year: '2023', 
            tech: 'HTML5 • SCSS • JS • LARAVEL • REST API', 
            desc: 'Informational and prevention portal dedicated to cybersecurity and data protection.', 
            url: 'https://www.sigurantapenet.ro', 
            img: sigurantapenet, 
            top: '16%', 
            left: '42%', 
            speed: 0.02 
        },
        { 
            name: 'eCommerceTv', 
            year: '2019', 
            tech: 'HTML5 • SCSS • JS • REACT • REDUX • ROUTER • BOOTSTRAP • FIREBASE', 
            desc: 'Functional e-commerce integrating authentication (Google APIs) and Google Maps, behaving like a real online store.', 
            url: 'https://sionut0122.github.io/ecommercetv/', 
            img: ecommtv, 
            top: '24%', 
            left: '16%', 
            speed: -0.03 
        },
        { 
            name: 'Ecommlap', 
            year: '2023', 
            tech: 'REACT HOOKS • SCSS • JS • FAUNADB• MATERIAL UI • AUTH0 • BOOTSTRAP', 
            desc: 'E-commerce dedicated to laptop sales, featuring a backend database and a fluid shopping experience.', 
            url: 'https://sionut0122.github.io/ecommlap/', 
            img: ecommlap, 
            top: '22%', 
            left: '72%', 
            speed: 0.03 
        },
        { 
            name: 'eCommerceTDesign', 
            year: '2022', 
            tech: 'HTML5 • SCSS • JS • REACT • REDUX • ROUTER • BOOTSTRAP • WEBPACK • FIREBASE • FAUNADB', 
            desc: 'An application that mimics a real clothing e-commerce site, offering customers the experience of an original online store.', 
            url: 'https://sionut0122.github.io/ecommercetdesign/#/', 
            img: ecommtdesign, 
            top: '34%', 
            left: '8%', 
            speed: -0.04 
        },
        { 
            name: 'eCommerceJager', 
            year: '2022', 
            tech: 'REACT • REDUX • REACT ROUTER • THREE.JS • MATERIALUI', 
            desc: 'Minimalist online store design, optimized for conversion and speed.', 
            url: 'https://sionut0122.github.io/ecommercejager/#/', 
            img: ecommjager, 
            top: '33%', 
            left: '56%', 
            speed: 0.02 
        },
        { 
            name: 'musicPlayer', 
            year: '2019', 
            tech: 'HTML5 • SCSS • REACT • JS • MATERIALIZE FRAMEWORK', 
            desc: 'An application that allows playing songs from a playlist, supporting scrubbing, keyboard/scroll controls, and looping.', 
            url: 'https://sionut0122.github.io/musicplayer/', 
            img: musicplayer, 
            top: '44%', 
            left: '76%', 
            speed: -0.03 
        },
        { 
            name: 'Livechat v.2.0', 
            year: '2019', 
            tech: 'HTML5 • SCSS • JS • REACT • REDUX • BOOTSTRAP • FIREBASE', 
            desc: 'Free live chat web application with no installation needed, featuring account creation, guest mode, and real-time online user viewing.', 
            url: 'https://sionut0122.github.io/LiveChatV2.0/', 
            img: livechatv20, 
            top: '48%', 
            left: '30%', 
            speed: 0.04 
        },
        { 
            name: 'pizzaDelivery', 
            year: '2022', 
            tech: 'HTML5 • SCSS • JS • REACT • REDUX • ROUTER • BOOTSTRAP • WEBPACK • FIREBASE', 
            desc: 'A pizza e-commerce website allowing users to order favorite products with Google authentication, profile editing, shopping cart, and order checkout.', 
            url: 'https://sionut0122.github.io/pizzaDelivery/#/', 
            img: pizzadelivery, 
            top: '56%', 
            left: '55%', 
            speed: -0.01 
        },
        { 
            name: 'ImgFBHost', 
            year: '2019', 
            tech: 'REACT • REDUX • BOOTSTRAP • SCSS • FIREBASE', 
            desc: 'Utility for free image hosting via drag-and-drop, with quick link generation for websites and forums.', 
            url: 'https://sionut0122.github.io/imgfbhost/', 
            img: imgfbhost, 
            top: '65%', 
            left: '12%', 
            speed: 0.03 
        },
        { 
            name: 'CoffeeShop', 
            year: '2022', 
            tech: 'HTML5 • SCSS • JS • REACT • ROUTER • GOOGLE MAP REACT', 
            desc: 'A coffee template used to promote online coffee business products.', 
            url: 'https://sionut0122.github.io/CoffeeShop/#/', 
            img: coffeshop, 
            top: '67%', 
            left: '40%', 
            speed: -0.02 
        },
        { 
            name: 'foodDelivery', 
            year: '2020', 
            tech: 'HTML5 • SCSS • JS • REACT • MATERIALIZE FRAMEWORK • REDUX • ROUTER', 
            desc: 'An e-commerce site mimicking a fast-food platform for ordering food.', 
            url: 'https://sionut0122.github.io/fooddelivery/', 
            img: fooddelivery, 
            top: '72%', 
            left: '68%', 
            speed: 0.05 
        }
    ],
    crosshairs: [
        { top: '18%', left: '20%', delay: '0s', label: 'SEC // 01' },
        { top: '12%', left: '75%', delay: '2s' },
        { top: '45%', left: '12%', delay: '4s' },
        { top: '55%', left: '85%', delay: '1.5s', label: '[ 44.42, 26.10 ]' },
        { top: '80%', left: '28%', delay: '3.5s' },
        { top: '75%', left: '72%', delay: '5s', label: 'EET' }
    ]
};