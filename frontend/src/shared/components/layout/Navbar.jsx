import axios from "axios";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { NoteContext } from "../../../ContextApi/CreateContext";
import Logo from "../../../assets/LogoBG.png";
import styled from "styled-components";
import toast from "react-hot-toast";
import NavItem from "../ui/NavItem";

function Navbar({ showMobileMessages, setShowMobileMessages }) {
  const URL = "http://localhost:9860";
  const { socket, userId, setUserId } = useContext(NoteContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (socket.current) {
      socket.current.emit("user-logout", userId);
      socket.current.disconnect();
    }
    try {
      const response = await axios.post(
        `${URL}/user/logout`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("Logout Successfully");
        setUserId(null); // <-- Clear userId in context here
        navigate("/");
      }
    } catch (err) {
      console.log(err);
      alert("Logout Failed, Please try again");
    }
  };



  return (
    <header className="sticky max-sm:mx-4 border-black border-1 shadow-[0px_8px_6px_-6px_white]  top-4 inset-x-0 z-50 max-w-5xl w-full mx-auto rounded-4xl bg-[#FFF9F3]">
      <nav className="relative max-w-5xl w-full flex flex-wrap md:flex-nowrap items-center justify-between py-2 ps-5 pe-2 md:py-0">
        <div className="flex  items-center">

          {/* Removed py-2 here; we'll use ps-5 on the image itself */}
              <FloatingLogo src={Logo} alt="ChatNation Logo" />

        </div>

        {/* Button Group */}
        <div className="md:order-3 flex items-center gap-x-3">
          <div className="md:ps-3">
            <button
              onClick={handleLogout}
              className="group cursor-pointer  inline-flex items-center gap-x-2 py-2 px-3 bg-[#ff0] font-medium text-sm text-nowrap text-neutral-800 rounded-full focus:outline-hidden"
            >
              Logout
            </button>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              className="hs-collapse-toggle size-9 flex justify-center items-center text-sm font-semibold rounded-full bg-neutral-800 text-white disabled:opacity-50 disabled:pointer-events-none"
              id="hs-navbar-floating-dark-collapse"
              aria-expanded="false"
              aria-controls="hs-navbar-floating-dark"
              aria-label="Toggle navigation"
              data-hs-collapse="#hs-navbar-floating-dark"
            >
              <svg
                className="hs-collapse-open:hidden shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" x2="21" y1="6" y2="6" />
                <line x1="3" x2="21" y1="12" y2="12" />
                <line x1="3" x2="21" y1="18" y2="18" />
              </svg>
              <svg
                className="hs-collapse-open:block hidden shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>
        {/* End Button Group */}

        {/* Collapse */}
        <div
          id="hs-navbar-floating-dark"
          className="hs-collapse hidden overflow-hidden transition-all duration-500 ease-in-out basis-full grow md:block"
          aria-labelledby="hs-navbar-floating-dark-collapse"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-y-3 py-2 md:py-0 md:ps-7">
            <NavItem to="/dashboard" onClick={() => setShowMobileMessages(false)} showMobileMessages={showMobileMessages}>
              Home
            </NavItem>
            <NavItem to="/stories" showMobileMessages={showMobileMessages}>
              Stories
            </NavItem>
            <NavItem to="/userProfile" showMobileMessages={showMobileMessages}>
              Profile
            </NavItem>
            <NavItem to="/groupsFunctionality" showMobileMessages={showMobileMessages}>
              Groups
            </NavItem>
            <NavItem 
              isMessagesTab={true}
              onClick={() => {
                if (window.location.pathname !== '/dashboard') {
                  navigate('/dashboard?messages=true');
                } else {
                  setShowMobileMessages(!showMobileMessages);
                }
              }}
              showMobileMessages={showMobileMessages}
            >
              Messages
            </NavItem>
          </div>
        </div>
        {/* End Collapse */}
      </nav>
    </header>
  );

}

const FloatingLogo = styled.img`
  height: 3rem;
  width: 18rem;
  object-fit: cover;
  margin-left:-2rem;
  animation: float-x 5.5s ease-in-out infinite;

  @keyframes float-x {
    0%   { transform: translateX(0); }
    50%  { transform: translateX(0.5rem); }
    100% { transform: translateX(0); }
  }
`;


export default Navbar;