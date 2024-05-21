import React, { useState, useRef, useCallback } from "react";
import * as htmlToImage from "html-to-image";
import Cropper from "react-easy-crop";
import Photo from "./components/photo";
import Button from "./components/buttons";
import "./App.css";

const App = () => {
  const [style, setStyle] = useState("");
  const [rotateValue, setRotateValue] = useState(0);
  const containerRef = useRef(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = (imageSrc, cropPixels, rotation = 0) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.crossOrigin = "anonymous";
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const safeArea = Math.max(image.width, image.height) * 2;

        canvas.width = safeArea;
        canvas.height = safeArea;

        ctx.translate(safeArea / 2, safeArea / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-safeArea / 2, -safeArea / 2);

        ctx.drawImage(
          image,
          safeArea / 2 - image.width * 0.5,
          safeArea / 2 - image.height * 0.5
        );

        const data = ctx.getImageData(
          safeArea / 2 - cropPixels.width * 0.5,
          safeArea / 2 - cropPixels.height * 0.5,
          cropPixels.width,
          cropPixels.height
        );

        canvas.width = cropPixels.width;
        canvas.height = cropPixels.height;
        ctx.putImageData(data, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          blob.name = "cropped.jpg";
          const croppedImageUrl = window.URL.createObjectURL(blob);
          resolve(croppedImageUrl);
        }, "image/jpeg");
      };
      image.onerror = () => {
        reject(new Error("Failed to load image"));
      };
    });
  };

  const showCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(
        "/assets/yousuf.jpg",
        croppedAreaPixels,
        rotateValue
      );
      console.log("done", { croppedImage });
      setCroppedImage(croppedImage);
      setShowCropper(false);

      // Automatically trigger the download of the cropped image
      const link = document.createElement("a");
      link.download = "cropped-image.jpg";
      link.href = croppedImage;
      link.click();
    } catch (e) {
      console.error(e);
    }
  };

  const changeDegree = () => {
    const newDegree = (rotateValue + 90) % 360;
    setRotateValue(newDegree);
    setStyle(`rotate-${newDegree}`);
    console.log(newDegree);
  };

  const saveImage = () => {
    if (containerRef.current) {
      htmlToImage
        .toPng(containerRef.current)
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "edited-image.png";
          link.href = dataUrl;
          link.click();
        })
        .catch((error) => {
          console.error("Failed to save image", error);
        });
    }
  };

  const cropImage = () => {
    setShowCropper(true);
  };

  return (
    <div>
      {showCropper ? (
        <div className="cropper-container">
          <Cropper
            image="/assets/yousuf.jpg"
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          <div className="cropped-buttons">
            <Button onClick={showCroppedImage}>Save Cropped Image</Button>
            <Button onClick={() => setShowCropper(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="container" ref={containerRef}>
            <Photo src={croppedImage || "/assets/yousuf.jpg"} style={style} />
          </div>
          <div className="button-container">
            <Button onClick={() => setStyle("style1")}>Sepia</Button>
            <Button onClick={() => setStyle("style2")}>Grayscale</Button>
            <Button onClick={() => setStyle("style3")}>Blur</Button>
            <Button onClick={() => setStyle("style4")}>Saturation</Button>
            <Button onClick={() => setStyle("style5")}>Brightness</Button>
            <Button onClick={() => setStyle("style6")}>Contrast</Button>
            <Button onClick={() => setStyle("style7")}>Hue Rotate</Button>
            <Button onClick={changeDegree}>Rotate</Button>
            <Button onClick={cropImage}>Crop</Button>
            <Button onClick={saveImage}>Save Image</Button>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
