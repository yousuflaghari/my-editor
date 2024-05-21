import React from "react";
import "./photo.css";

const Photo = ({ src, style }) => {
  return (
    <>
      <img src={src} className={`photo ${style}`} alt="Screenshot" />
    </>
  );
};
export default Photo;
