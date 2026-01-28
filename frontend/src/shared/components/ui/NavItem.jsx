import { NavLink } from "react-router-dom";

const NavItem = ({ to, children, onClick, showMobileMessages, isMessagesTab = false }) => {
  if (isMessagesTab) {
    return (
      <a
        onClick={onClick}
        className={`md:hidden pe-3 ps-px sm:px-3 md:py-4 text-sm transition-colors cursor-pointer ${
          showMobileMessages ? 'text-blue-600' : 'text-black hover:text-neutral-700'
        }`}
        data-hs-collapse="#hs-navbar-floating-dark"
      >
        {children}
      </a>
    );
  }

  return (
    <NavLink
      className={({ isActive }) => `pe-3 ps-px sm:px-3 md:py-4 text-sm transition-colors focus:outline-none ${
        isActive && (!showMobileMessages || to !== '/dashboard') ? 'text-blue-600' : 'text-black hover:text-neutral-700 focus:text-neutral-700'
      }`}
      to={to}
      onClick={onClick}
      data-hs-collapse="#hs-navbar-floating-dark"
    >
      {children}
    </NavLink>
  );
};

export default NavItem;