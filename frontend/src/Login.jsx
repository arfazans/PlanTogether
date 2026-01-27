import React, { useState, useContext } from "react";
import styled from "styled-components";
import loginImage from "./assets/loginImage3.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { NoteContext } from "./ContextApi/CreateContext";
import toast, { Toaster } from 'react-hot-toast';


function Login() {
  const URL = "http://localhost:9860";
  const { setUserId } = useContext(NoteContext);
  const [checked, setchecked] = useState(false);
  const [loginData, setloginData] = useState({ email: "", password: "" });
  const [signUpData, setsignUpData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const signupsubmit = async (e) => {
    try {
      e.preventDefault();
      const result = await axios.post(`${URL}/user/signup`, signUpData, {
        withCredentials: true,
      });
      console.log(result);
      if (result.status === 200) {
        setUserId(result.data.userId);

        toast.success("SignUp Successful");

        setsignUpData({ name: "", email: "", password: "" }); // Reset all fields
        navigate("/dashboard");
      }
    } catch (err) {
      console.log(err);
      toast.error("SignUp Failed");
    }
  };

  const loginsubmit = async (e) => {
    try {
      e.preventDefault();
      const result = await axios.post(`${URL}/user/login`, loginData, {
        withCredentials: true,
      });

      if (result.status === 200) {
        setUserId(result.data.userId);

        toast.success("login Successful");
        setloginData({ email: "", password: "" }); // Reset all fields

        navigate("/dashboard");
      }
    } catch (err) {
      console.log(err);
      toast.error("Login Failed");
    }
  };

  return (
    <OuterContainer>
      <InnerContainer>
        <LoginWrapper>
          <StyledWrapper>
            <div className="wrapper">
              <div className="toggle-row">
                <span className={`toggle-label ${!checked && "active"}`}>
                  Log in
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    className="toggle"
                    checked={checked}
                    onChange={() => setchecked(!checked)}
                  />
                  <span className="slider" />
                </label>
                <span className={`toggle-label ${checked && "active"}`}>
                  Sign up
                </span>
              </div>
              <div className={`flip-card__inner${checked ? " flipped" : ""}`}>
                <div className="flip-card__front">
                  <div className="title">Log in</div>
                  <form onSubmit={loginsubmit} className="flip-card__form">
                    <input
                      className="flip-card__input"
                      name="email"
                      placeholder="Email"
                      type="email"
                      value={loginData.email}
                      required={true}
                      onChange={(e) =>
                        setloginData({
                          ...loginData,
                          [e.target.name]: e.target.value,
                        })
                      }
                    />
                    <input
                      className="flip-card__input"
                      name="password"
                      placeholder="Password"
                      type="password"
                      value={loginData.password}
                      required={true}
                      onChange={(e) =>
                        setloginData({
                          ...loginData,
                          [e.target.name]: e.target.value,
                        })
                      }
                    />
                    <button type="submit" className="flip-card__btn">
                     <span>Let`s go!</span>
                    </button>
                  </form>
                </div>
                <div className="flip-card__back">
                  <div className="title">Sign up</div>
                  <form onSubmit={signupsubmit} className="flip-card__form">
                    <input
                      className="flip-card__input"
                      placeholder="Name"
                      type="text"
                      name="name"
                      value={signUpData.name}
                      required={true}
                      onChange={(e) =>
                        setsignUpData({
                          ...signUpData,
                          [e.target.name]: e.target.value,
                        })
                      }
                    />
                    <input
                      className="flip-card__input"
                      name="email"
                      placeholder="Email"
                      type="email"
                      required={true}
                      value={signUpData.email}
                      onChange={(e) =>
                        setsignUpData({
                          ...signUpData,
                          [e.target.name]: e.target.value,
                        })
                      }
                    />
                    <input
                      className="flip-card__input"
                      name="password"
                      placeholder="Password"
                      type="password"
                      required={true}
                      value={signUpData.password}
                      onChange={(e) =>
                        setsignUpData({
                          ...signUpData,
                          [e.target.name]: e.target.value,
                        })
                      }
                    />
                    <button type="submit" className="flip-card__btn">
                        <span>Confirm!</span>

                    </button>
                  </form>
                </div>
              </div>

            </div>
          </StyledWrapper>
        </LoginWrapper>

        <ImageWrapper>
          <h1 className="text-3xl md:text-4xl lg:text-5xl text-blue-100 mb-2 font-extrabold text-center leading-tight">
            Welcome To chatNation!!
          </h1>
          <h3 className="text-lg md:text-xl lg:text-2xl text-blue-500 font-bold text-center">
            Your DigiTal World
          </h3>
          <img src={loginImage} alt="Login visual" />
        </ImageWrapper>
      </InnerContainer>
    </OuterContainer>
  );
}

const StyledWrapper = styled.div`
  width: 420px; /* or any desired px/em/rem/% value */
  max-width: 94vw; /* for responsiveness on small screens */
  margin: 0 auto; /* center horizontally */
  .wrapper {
    --input-focus: #2d8cf0;
    --font-color: #323232;
    --font-color-sub: #666;
    --bg-color: #fff;
    --bg-color-alt: #666;
    --main-color: #323232;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .card-switch {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
  }
  .switch {
    display: flex;
    align-items: center;
  }
  .card-side {
    position: relative;
    display: flex;
    align-items: center;
    width: 120px;
    justify-content: space-between;
    font-size: 15px;
    font-weight: 600;
    color: var(--font-color);
  }
  .card-side::before {
    content: "Log in";
    text-decoration: underline;
    margin-right: 14px;
    opacity: 1;
    transition: text-decoration 0.2s;
  }
  .card-side::after {
    content: "Sign up";
    text-decoration: none;
    margin-left: 14px;
    opacity: 0.8;
    transition: text-decoration 0.2s;
  }
  .toggle {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-bottom: 18px;
    gap: 20px;
  }
    .toggle-label{
    font-size:1.2rem;
    font-weight: 700;
    color: var(--font-color);
    opacity: 0.8;
    transition: opacity 0.3s, text-decoration 0.3s;
    }

  .toggle-label.active {
    opacity: 1;
    text-decoration: bold;
  }
  .slider {
    width: 45px;
    height: 22px;
    border-radius: 12px;
    border: 2px solid var(--main-color);
    background: var(--bg-color);
    position: relative;
    cursor: pointer;
    transition: background-color 0.3s;
    box-shadow: 2px 2px var(--main-color);
    display: inline-block;
  }
  .slider:before {
    content: "";
    position: absolute;
    height: 20px;
    width: 20px;
    left: 2px;
    bottom: 1px;
    border-radius: 10px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 0 2px 0 var(--main-color);
    transition: transform 0.3s;
  }
  .toggle:checked + .slider {
    background: var(--input-focus);
  }
  .toggle:checked + .slider:before {
    transform: translateX(23px);
  }
  .toggle:checked ~ .card-side::before {
    text-decoration: none;
    opacity: 0.8;
  }
  .toggle:checked ~ .card-side::after {
    text-decoration: underline;
    opacity: 1;
  }
  .toggle:checked ~ .flip-card__inner {
    transform: rotateY(180deg);
  }
  .flip-card__inner {
    width: 100%;
    max-width: 260px;
    min-width: 210px;
    height: 320px;
    position: relative;
    background-color: transparent;
    perspective: 800px;
    text-align: center;
    transition: transform 0.8s;
    transform-style: preserve-3d;
    margin: 0 auto;
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }
  .flip-card__inner.flipped {
    transform: rotateY(180deg);
  }
  .flip-card__outer {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .flip-card__front {
    pointer-events: auto; /* Enable pointer events on front */
    backface-visibility: hidden;
  }

  .flip-card__back {
    pointer-events: none; /* Disable pointer events when not flipped */
    backface-visibility: hidden;
  }
  .flip-card__inner.flipped .flip-card__front {
    pointer-events: none; /* Disable front when flipped */
  }

  .flip-card__inner.flipped .flip-card__back {
    pointer-events: auto; /* Enable back when flipped */
  }

  .flip-card__front,
  .flip-card__back {
    padding: 12px;
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    border: 2px solid var(--main-color);
    box-shadow: 3px 3px var(--main-color);
    background: #edf0f3;
    left: 0;
    top: 0;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  .flip-card__back {
    transform: rotateY(180deg);
  }
  .flip-card__form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 13px;
    width: 100%;
  }
  .title {
    font-size: 22px;
    font-weight: 900;
    color: var(--main-color);
    margin: 10px 0 16px 0;
  }
.flip-card__input {
  width: 98%;
  max-width: 220px;
  min-width: 145px;
  height: 36px;
  border-radius: 5px;
  border: 2px solid var(--main-color); /* Match button border color */
  background-color: var(--bg-color);
  box-shadow: 2px 2px var(--main-color); /* Match button shadow */
  font-size: 14px;
  font-weight: 600;
  color: var(--font-color);
  padding: 2px 10px;
  outline: none;
  margin: 0;
}

  .flip-card__input::placeholder {
    color: var(--font-color-sub);
    opacity: 0.8;
  }
  .flip-card__input:focus {
    border: 2px solid var(--input-focus);
  }
.flip-card__btn {
  position: relative;
  margin: 10px 0 0 0;
  width: 105px;
  height: 36px;
  border-radius: 5px;
  border: 2px solid var(--main-color);
  background: #fff;
  font-size: 15px;
  font-weight: 600;
  color: var(--main-color);
  box-shadow: 2px 2px var(--main-color);
  cursor: pointer;
  overflow: hidden;
  transition: box-shadow 0.1s, transform 0.1s;
}
  .flip-card__btn:hover {
  border: none;
}

.flip-card__btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;      /* Start hidden */
  height: 100%;
  background: #000;
  transition: width 0.4s;
  z-index: 1;      /* Sit underneath the span/text */
  border-radius: 5px;
}

.flip-card__btn:hover::before {
  width: 100%;    /* Fully covers the button on hover */

}

/* Make span (text) always above the sweep */
.flip-card__btn span {
  position: relative;
  z-index: 2;
  transition: color 0.2s;
}

/* Make text white for visibility on black */
.flip-card__btn:hover span {
  color: #fff;
}

.flip-card__btn:active {
  box-shadow: 0 0 var(--main-color);
  transform: translate(2px, 2px);
}

  /* Responsive */
  @media (max-width: 480px) {
    .flip-card__inner {
      max-width: 96vw;
      min-width: 0;
      height: 260px;
    }
    .flip-card__front,
    .flip-card__back {
      padding: 8px;
      gap: 10px;
    }
    .title {
      font-size: 16px;
    }
    .flip-card__input {
      max-width: 98vw;
      font-size: 13px;
      height: 30px;
    }
    .flip-card__btn {
      width: 76px;
      font-size: 13px;
      height: 27px;
    }
  }
`;

const OuterContainer = styled.div`
  height: 100vh;
  width: 100vw;
  overflow-x: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #232946;
  padding: 1rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;
const InnerContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
  border-radius: 12px;
  box-shadow: #A0AEC0;
  padding: 1.5rem;
  width: 100%;
  max-width: 1200px;
  height: 100%;
  max-height: calc(100vh - 2rem);
  box-sizing: border-box;
  background: #FFF9F3;

  & > div {
    flex-shrink: 1;
    overflow: hidden;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    max-height: calc(100vh - 1rem);
  }

  @media (max-width: 768px) {
    padding: 0.75rem;
    gap: 0.5rem;
  }
`;
const LoginWrapper = styled.div`
  flex: 1 1 45%;
  min-width: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  @media (max-width: 1024px) {
    flex: 1;
    min-width: 100%;
    height: auto;
  }
`;
const ImageWrapper = styled.div`
  flex: 1 1 55%;
  min-width: 300px;
  flex-direction: column;
  max-width: 800px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  border-radius: 2rem;
  box-shadow: 10px 10px 10px 5px rgba(0, 0, 0, 0.3);
  background: #232946;
  padding: 1rem;
  box-sizing: border-box;

  h1 {
    text-shadow: 0px 10px 10px rgba(0, 0, 0, 0.5);
    font-size: 2.5rem;
    text-align: center;
    white-space: normal;
    line-height: 1.2;
  }
  
  h3 {
    color: #8392ab;
    text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.5);
    text-align: center;
  }

  img {
    margin-top: 1rem;
    max-width: 100%;
    max-height: 300px;
    object-fit: contain;
    box-shadow: 10px 10px 10px 5px rgba(0, 0, 0, 0.3);
    border-radius: 2rem;
    animation: floatImage 3s ease-in-out infinite;
    display: block;
    &:hover {
      animation-play-state: paused;
    }
  }

  @media (max-width: 1024px) {
    flex: 1;
    min-width: 100%;
    height: auto;
    padding: 0.75rem;
    
    h1 {
      font-size: 2rem;
    }
    
    h3 {
      font-size: 1.25rem;
    }
    
    img {
      max-height: 200px;
    }
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 1.75rem;
    }
    
    h3 {
      font-size: 1rem;
    }
    
    img {
      max-height: 150px;
      margin-top: 0.5rem;
    }
  }

  @keyframes floatImage {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
    100% {
      transform: translateY(0);
    }
  }
`;

export default Login;
