import { useNavigate } from "react-router-dom";
import { getUserInfo, googleLogin } from "../api/user";

export const WorkflowLabs = () => {
  const nav = useNavigate();

  const clickHandler = async () => {
    const loginResult = await googleLogin();
    if (loginResult) {
      const userInfo = await getUserInfo();

      if (userInfo) {
        // 어딘가에 user 정보 저장
      } else {
        nav("/fishSignup");
      }
    }
  };

  return (
    <div>
      <button onClick={clickHandler}>로그인 예시(구글)</button>
    </div>
  );
};
