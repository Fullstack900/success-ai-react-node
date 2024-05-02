import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function useUserVerifyCheck() {
  const user = useSelector((state) => state.user);
  const [verified, setVerified] = useState("loading");
  useEffect(() => {
    if (user) {
      setVerified(user?.emailVerified===true?"verified":user?.emailVerified===false?"unverified":"loading")
    }
  }, [user]);
  return { verified };
}

export default useUserVerifyCheck;
