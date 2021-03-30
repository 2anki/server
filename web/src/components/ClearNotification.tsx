import React, { useEffect } from "react";

const ClearNotification: React.FC<{
  msg: string;
  seconds: number;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ msg, seconds, setShow }) => {
  useEffect(() => {
    console.log("useEffect");
    const ms = seconds * 1000;
    const interval = setInterval(() => {
      setShow(false);
    }, ms);
    return () => clearInterval(interval);
  }, [seconds, setShow]);

  return (
    <div className="notification">
      <button className="delete" onClick={() => setShow(false)}></button>
      {msg}
    </div>
  );
};

export default ClearNotification;
