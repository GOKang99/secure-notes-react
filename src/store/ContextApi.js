import React, { createContext, useContext, useState } from "react";
import { useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const ContextApi = createContext();

export const ContextProvider = ({ children }) => {
  //로컬 스토리지 토큰을 가지고 온다.
  const getToken = localStorage.getItem("JWT_TOKEN")
    ? JSON.stringify(localStorage.getItem("JWT_TOKEN"))
    : null;
  //find is the user status from the localstorage
  const isADmin = localStorage.getItem("IS_ADMIN")
    ? JSON.stringify(localStorage.getItem("IS_ADMIN"))
    : false;

  //토큰 상태관리
  const [token, setToken] = useState(getToken);

  //현재 로그인 유저 관리
  const [currentUser, setCurrentUser] = useState(null);
  //관리자 패널 관리
  const [openSidebar, setOpenSidebar] = useState(true);
  //관리자 인지 확인
  const [isAdmin, setIsAdmin] = useState(isADmin);

  const fetchUser = async () => {
    const user = JSON.parse(localStorage.getItem("USER"));

    if (user?.username) {
      try {
        //서버에 현재 유저 정보를 요청
        const { data } = await api.get(`/auth/user`);
        const roles = data.roles;

        if (roles.includes("ROLE_ADMIN")) {
          localStorage.setItem("IS_ADMIN", JSON.stringify(true));
          setIsAdmin(true);
        } else {
          localStorage.removeItem("IS_ADMIN");
          setIsAdmin(false);
        }
        setCurrentUser(data);
      } catch (error) {
        console.error("Error fetching current user", error);
        toast.error("Error fetching current user");
      }
    }
  };

  //처음 시작시, 토큰이 바뀔때 마다 유저 정보 저장
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  //컨텍스트 프로바이더가 value의 모든 정보를 저장
  return (
    <ContextApi.Provider
      value={{
        token,
        setToken,
        currentUser,
        setCurrentUser,
        openSidebar,
        setOpenSidebar,
        isAdmin,
        setIsAdmin,
      }}
    >
      {children}
    </ContextApi.Provider>
  );
};

//useMyContext()로 이 컨텍스트를 사용함
export const useMyContext = () => {
  const context = useContext(ContextApi);

  return context;
};
