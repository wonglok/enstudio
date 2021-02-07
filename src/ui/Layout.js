import React, { useEffect, useState } from "react";
// import Link from 'next/link'

export function Layout({ title, children }) {
  useEffect(() => {
    document.body.style.backgroundColor = `#003E42`;
    return () => {
      // document.body.style.backgroundColor = "";
    };
  });

  return (
    <div
      className="font-beauty"
      style={{
        height: "100%",
        fontFamily: "CronosPro, sans-serif",
        color: "#EAEAEA",
      }}
    >
      <NavBar title={title}></NavBar>
      {children}
    </div>
  );
}

function Link({ to, style, children }) {
  return (
    <a style={style} href={`/index.html#${to}`}>
      {children}
    </a>
  );
}

export function NavBar({ title = "" }) {
  const [isMobile, setIsMobile] = useState(true);
  const [isMenOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    let resizer = () => {
      let mediaQuery = "(min-width: 1024px)";
      let output = !window.matchMedia(mediaQuery).matches;
      setIsMobile(output);
    };
    resizer();
    window.addEventListener("resize", resizer, { passive: false });
    return () => {
      window.removeEventListener("resize", resizer, { passive: false });
    };
  }, []);

  let toggleMenu = () => {
    setIsMenuOpen(!isMenOpen);
  };

  return (
    <div>
      {isMobile && <NavBarMobile toggleMenu={toggleMenu}></NavBarMobile>}
      {!isMobile && (
        <NavBarDesk title={title} toggleMenu={toggleMenu}></NavBarDesk>
      )}
      {isMenOpen && <MenuArea toggleMenu={toggleMenu}></MenuArea>}
      {isMenOpen && (
        <MenuCloseBtn
          toggleMenu={toggleMenu}
          isMobile={isMobile}
        ></MenuCloseBtn>
      )}
      {!isMenOpen && (
        <MenuOpenBtn toggleMenu={toggleMenu} isMobile={isMobile}></MenuOpenBtn>
      )}
    </div>
  );
}

function MenuArea({ toggleMenu }) {
  return (
    <div
      className="fixed z-20 top-0 left-0 h-full w-full bg-black bg-opacity-90"
      style={{ fontSize: "24px", zIndex: 100000000 }}
    >
      <div
        className={"mb-4"}
        style={{ height: "60px", borderBottom: "#A9A9A9 solid 1px" }}
      ></div>
      <div className={"text-right mr-6"}>
        <div onClick={toggleMenu} className={"mb-3 inline-block"}>
          <Link style={{ color: "#EAEAEA" }} to="/">
            EffectNode
          </Link>
        </div>
      </div>
    </div>
  );
}

function MenuCloseBtn({ toggleMenu, isMobile }) {
  return (
    <div
      className="fixed z-20 top-0 right-0"
      style={{
        marginRight: isMobile ? "20px" : "25px",
        marginTop: isMobile ? "20px" : "20px",
        zIndex: 100000000,
      }}
    >
      <svg
        onClick={toggleMenu}
        width="24px"
        height="24px"
        viewBox="0 0 24 24"
        version="1.1"
      >
        <g
          id="Page-1"
          stroke="none"
          strokeWidth="1"
          fill="none"
          fillRule="evenodd"
          strokeLinecap="square"
        >
          <g
            id="Mobile-Copy"
            transform="translate(-371.000000, -58.000000)"
            stroke="#A9A9A9"
          >
            <g id="Group-2" transform="translate(371.000000, 58.000000)">
              <line
                x1="-2.57142857"
                y1="12"
                x2="26.5714286"
                y2="12"
                id="Line-2"
                transform="translate(12.000000, 12.000000) rotate(45.000000) translate(-12.000000, -12.000000) "
              ></line>
              <line
                x1="-2.57142857"
                y1="12"
                x2="26.5714286"
                y2="12"
                id="Line-2-Copy-2"
                transform="translate(12.000000, 12.000000) rotate(-45.000000) translate(-12.000000, -12.000000) "
              ></line>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

function MenuOpenBtn({ toggleMenu, isMobile }) {
  return (
    <div
      className="fixed z-20 top-0 right-0"
      style={{
        boxShadow: `0px 0px 15px 0px rgb(0, 62, 66)`,
        backgroundColor: "rgb(0, 62, 66)",
        marginRight: isMobile ? "20px" : "20px",
        marginTop: isMobile ? "17px" : "17px",
      }}
    >
      <svg
        onClick={toggleMenu}
        className={"inline-block"}
        width="32px"
        height="14px"
        viewBox="0 0 32 14"
        version="1.1"
      >
        <g
          id="Page-1"
          stroke="none"
          strokeWidth="1"
          fill="none"
          fillRule="evenodd"
          strokeLinecap="square"
        >
          <g
            id="Mobile"
            transform="translate(-364.000000, -64.000000)"
            stroke="#ffffff"
          >
            <g id="Group-2" transform="translate(365.000000, 64.000000)">
              <line
                x1="0.428571429"
                y1="1"
                x2="29.5714286"
                y2="1"
                id="Line-1"
              ></line>
              <line
                x1="0.428571429"
                y1="7"
                x2="29.5714286"
                y2="7"
                id="Line-2"
              ></line>
              <line
                x1="0.428571429"
                y1="13"
                x2="29.5714286"
                y2="13"
                id="Line-3"
              ></line>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

export function NavBarDesk({ title }) {
  return (
    <div
      style={{
        height: "60px",
        borderBottom: "#EAEAEA solid 1px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          color: `#EAEAEA`,
          fontSize: `24px`,
          marginLeft: "20px",
          width: `185px`,
        }}
      >
        <Link to="/">EffectNode</Link>
      </div>
      <div style={{ color: `#F3C978`, fontSize: `24px` }}>{title}</div>
      <div
        style={{
          color: `#EAEAEA`,
          fontSize: `24px`,
          textAlign: "right",
          marginRight: "20px",
          width: `185px`,
        }}
      ></div>
    </div>
  );
}

export function NavBarMobile() {
  return (
    <div
      style={{
        height: "60px",
        borderBottom: "#EAEAEA solid 1px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          color: `#EAEAEA`,
          marginTop: `5px`,
          fontSize: `24px`,
          marginLeft: "15px",
          width: `185px`,
        }}
      >
        <Link to="/">EffectNode</Link>
      </div>
      <div
        style={{
          color: `#EAEAEA`,
          fontSize: `24px`,
          textAlign: "right",
          marginRight: "15px",
          width: `185px`,
        }}
      ></div>
    </div>
  );
}
