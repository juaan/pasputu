import { createSignal, Show, Index, onCleanup, createEffect } from "solid-js";
import removeBackground from "@imgly/background-removal";
import { toJpeg } from "html-to-image";

import styles from "./App.module.css";

function App() {
  const [selectedImage, setSelectedImage] = createSignal("");
  const [onLoading, setOnLoading] = createSignal(false);
  const [removalProgress, setRemovalProgress] = createSignal(0);
  const [processImage, setProcessImage] = createSignal(false);
  const [cameraStream, setCameraStream] = createSignal(null);

  let camRef;

  // Function to initialize the camera
  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      currentStream = stream;
    } catch (error) {
      console.error("Error accessing the camera:", error);
    }
  };

  createEffect(() => {
    if (cameraStream() !== null) {
      camRef.srcObject = cameraStream();
    }
  });

  // Function to capture a picture
  const capturePicture = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = camRef.videoWidth;
    canvas.height = camRef.videoHeight;
    canvas
      .getContext("2d")
      .drawImage(camRef, 0, 0, canvas.width, canvas.height);
    processBgRemoval(canvas.toDataURL("image/png"));
  };

  const isMobile = () => /Mobi|Android/i.test(navigator.userAgent);

  const processBgRemoval = async (image) => {
    camRef?.remove();
    setCameraStream(null);
    setRemovalProgress(0);
    setSelectedImage("");
    setOnLoading(true);
    const imgWithoutBg = await removeBackground(image, configRemoveBg);
    const reader = new FileReader();

    reader.onload = () => {
      setSelectedImage(reader.result);
      setProcessImage(false);
    };
    reader.readAsDataURL(imgWithoutBg);
    setOnLoading(false);
  };

  const switchCamera = async () => {
    try {
      // Get the current stream
      const currentStream = cameraStream();

      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }

      // Get all available video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      const isFrontCam = currentStream
        ?.getVideoTracks()[0]
        .label.includes("front");

      const nextCam = isFrontCam ? "back" : "front";

      const nextCamIdx = videoDevices.findIndex((device) =>
        device.label.includes(nextCam)
      );

      // Get the new stream with the next camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: videoDevices[nextCamIdx].deviceId } },
      });

      setCameraStream(stream);
    } catch (error) {
      console.error("Error switching camera:", error);
    }
  };

  const configRemoveBg = {
    progress: (key, current, total) => {
      const progress = ((current / total) * 100).toFixed(0);
      setRemovalProgress(progress);
      if (key == "compute:inference" && progress < 100) {
        setProcessImage(true);
      }

      console.log(`Downloading ${key}: ${current} of ${total}`);
    },
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  onCleanup(() => {
    if (cameraStream()) {
      cameraStream()
        .getTracks()
        .forEach((track) => track.stop());
    }
  });

  return (
    <div class={styles.App}>
      <div class={styles.header}>
        <div class={styles.titleGradient}>pasputu</div>
        {isIOS && (
          <p class="text-slate-600 mt-8 text-sm tracking-wide">
             because of the resource constraints, for now this web app is only working on android and desktop browser
          </p>
        )}
        {!isIOS() && (
          <div class="wrapper bg-white rounded-lg px-6 py-6 ring-1 ring-slate-900/5 shadow-md mt-6">
            {cameraStream() && (
              <div style={{ position: "relative" }}>
                <video autoPlay ref={camRef}></video>
                <button
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "40px",
                    height: "40px",
                    "border-radius": "50%",
                    "background-color": "#FF0000",
                    border: "5px solid #fff",
                    cursor: "pointer",
                    display: "flex",
                    "justify-content": "center",
                    "align-items": "center",
                  }}
                  onClick={capturePicture}
                ></button>
                {isMobile() && (
                  <button
                    style={{
                      position: "absolute",
                      bottom: "20px",
                      left: "90%",
                      transform: "translateX(-50%)",
                      cursor: "pointer",
                      display: "flex",
                      "justify-content": "center",
                      "align-items": "center",
                    }}
                    onClick={switchCamera}
                  >
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 49 49"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M34.6063 12.3521H14.4958L17.9667 7.14583C18.375 6.53333 18.9875 6.22708 19.7021 6.22708H29.5021C30.2167 6.22708 30.8292 6.53333 31.2375 7.14583L34.6063 12.3521Z"
                        fill="white"
                      />
                      <path
                        d="M14.2917 11.2292H8.16666V9.39166C8.16666 8.67707 8.67707 8.16666 9.39166 8.16666H13.0667C13.7812 8.16666 14.2917 8.67707 14.2917 9.39166V11.2292Z"
                        fill="white"
                      />
                      <path
                        d="M40.8333 42.875H8.16666C5.92083 42.875 4.08333 41.0375 4.08333 38.7917V14.2917C4.08333 12.0458 5.92083 10.2083 8.16666 10.2083H40.8333C43.0792 10.2083 44.9167 12.0458 44.9167 14.2917V38.7917C44.9167 41.0375 43.0792 42.875 40.8333 42.875Z"
                        fill="white"
                      />
                      <path
                        d="M34.7083 25.5208C34.7083 19.9062 30.1146 15.3125 24.5 15.3125C22.05 15.3125 19.8042 16.1292 18.0688 17.5583L19.2938 19.1917C20.7229 18.0687 22.4583 17.3542 24.5 17.3542C28.9917 17.3542 32.6667 21.0292 32.6667 25.5208H29.0938L33.6875 31.2375L38.2813 25.5208H34.7083Z"
                        fill="black"
                      />
                      <path
                        d="M29.7062 31.85C28.2771 32.9729 26.4396 33.6875 24.5 33.6875C20.0083 33.6875 16.3333 30.0125 16.3333 25.5208H19.9062L15.3125 19.8042L10.7188 25.5208H14.2917C14.2917 31.1354 18.8854 35.7292 24.5 35.7292C26.95 35.7292 29.1958 34.9125 30.9312 33.4833L29.7062 31.85Z"
                        fill="black"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
            <p class="text-slate-600 mt-8 text-sm tracking-wide">
              simple open source app to replace your background using your
              photos or camera, and change it with your desired background.
            </p>
            <div>
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                onChange={(e) => processBgRemoval(e.target.files[0])}
                style={{ display: "none" }} // Hide the file input
              />
              <div class="mt-8 flex items-center justify-center gap-x-6">
                <Show
                  when={!onLoading()}
                  fallback={
                    <button
                      class="bg-cyan-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm rounded-md cursor-not-allowed opacity-70"
                      disabled
                    >
                      Processing...
                    </button>
                  }
                >
                  <button
                    onClick={initializeCamera}
                    class="rounded-md bg-cyan-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Take photo
                  </button>
                </Show>

                <p class="text-slate-500"> or </p>
                <Show
                  when={!onLoading()}
                  fallback={
                    <button
                      class="bg-cyan-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm rounded-md cursor-not-allowed opacity-70"
                      disabled
                    >
                      Processing...
                    </button>
                  }
                >
                  <button
                    onClick={() => {
                      document.getElementById("fileInput").click();
                    }}
                    class="rounded-md bg-cyan-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Upload image
                  </button>
                </Show>
              </div>
            </div>
            <Editor
              image={selectedImage()}
              onLoading={onLoading()}
              removalProgress={removalProgress()}
              processImage={processImage()}
            />
          </div>
        )}

        <footer>
          <p class="text-slate-600 mt-8 text-sm tracking-wide">
            made with 🚬 by{" "}
            <a href="https://github.com/juaan/pasputu" class="text-blue-500">
              Juan
            </a>
          </p>
          <p class="text-slate-600 text-sm tracking-wide">
            inspired by{" "}
            <a href="https://www.editpasfoto.com/" class="text-blue-500">
              editpasfoto
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

function Editor(props) {
  const [width, setWidth] = createSignal("300");
  const [height, setHeight] = createSignal("300");
  const [getVert, setVert] = createSignal("0");
  const [getHoriz, setHoriz] = createSignal("0");
  const [bgColor, setBgColor] = createSignal("white");
  const [scale, setScale] = createSignal("1");
  let imgRef;

  const onRatioChange = (e) => {
    const ratio = e.target.value;
    if (ratio == "1:1") {
      setWidth("300");
      setHeight("300");
    } else if (ratio == "3:4") {
      setWidth("225");
      setHeight("300");
    } else if (ratio == "2:3") {
      setWidth("200");
      setHeight("300");
    }
  };

  const onDownload = () => {
    if (imgRef === null) {
      return;
    }

    toJpeg(imgRef, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `pasputu.jpeg`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div class="flex flex-col justify-center items-center bg-stone-100 p-8 mt-8 rounded-lg">
      <div
        ref={imgRef}
        class={`mb-8 ring-1 ring-neutral-400/5 shadow-xl overflow-hidden relative top-0 left-0`}
        style={{
          width: `${width()}px`,
          height: `${height()}px`,
          "background-color": bgColor(),
        }}
      >
        <Show
          when={props.image !== ""}
          fallback={
            <div
              class={`w-full h-full flex justify-center items-center flex-col rounded px-2`}
              style={{
                "background-color": bgColor(),
              }}
            >
              {/* processing image spinner*/}
              {props.onLoading && props.processImage && (
                <div role="status">
                  <svg
                    aria-hidden="true"
                    class="w-8 h-8 text-gray-200 animate-spin fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                </div>
              )}

              {/* downloading assets progress bar*/}
              {props.onLoading && !props.processImage && (
                <div class="w-full bg-gray-200 rounded-full">
                  <div
                    class="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
                    style={{ width: `${props.removalProgress}%` }}
                  >
                    {props.removalProgress}%
                  </div>
                </div>
              )}

              {/* display default img*/}
              {!props.onLoading &&
                !props.processImage &&
                props.image === "" && (
                  <>
                    <svg
                      class="w-10 h-10 text-gray-600"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 18"
                    >
                      <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                    </svg>
                  </>
                )}
            </div>
          }
        >
          <div
            className={`relative overflow-hidden}`}
            style={{
              width: `${width()}px`,
              height: `${height()}px`,
              "background-repeat": "no-repeat",
              "background-image": `url(${props.image})`,
              "background-position-x": `${getHoriz()}px`,
              "background-position-y": `${getVert()}px`,
              "background-size": `${scale() * 100}%`,
            }}
          ></div>
        </Show>
      </div>
      <div class="flex flex-row justify-center w-full mb-8">
        <div class="px-8 text-start">
          <label
            for="default-range"
            class="block text-sm font-medium text-gray-900"
          >
            Background
          </label>
          <DropdownSelector
            opts={["white", "blue", "red"]}
            onDataChange={(e) => setBgColor(e.target.value)}
          />
        </div>
        <div class="px-8 text-start">
          <label
            for="default-range"
            class="block text-sm font-medium text-gray-900"
          >
            Ratio
          </label>
          <DropdownSelector
            opts={["1:1", "3:4", "2:3"]}
            onDataChange={onRatioChange}
          />
        </div>
      </div>
      <div class="px-8 w-full text-start">
        <label
          for="default-range"
          class="block text-sm font-medium text-gray-900"
        >
          Vertical
        </label>
        <input
          id="default-range"
          step="1"
          onInput={(e) => setVert(e.target.value)}
          type="range"
          max="200"
          value={`${getVert()}`}
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        ></input>
      </div>
      <div class="px-8 w-full text-start">
        <label
          for="default-range"
          class="block text-sm font-medium text-gray-900"
        >
          Horizontal
        </label>
        <input
          id="default-range"
          step="1"
          max="200"
          onInput={(e) => setHoriz(e.target.value)}
          type="range"
          value={`${getHoriz()}`}
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        ></input>
      </div>
      <div class="px-8 w-full text-start">
        <label
          for="default-range"
          class="block text-sm font-medium text-gray-900"
        >
          Zoom
        </label>
        <input
          id="default-range"
          type="range"
          max="3"
          step="0.05"
          value={scale()}
          onInput={(e) => setScale(e.target.value)}
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        ></input>
      </div>

      <div>
        <div class="mt-8 flex items-center justify-center gap-x-6">
          <button
            onClick={onDownload}
            class="rounded-md bg-cyan-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

function DropdownSelector(props) {
  return (
    <div>
      <select
        onChange={(e) => props.onDataChange(e)}
        class="py-2 text-sm text-gray-700"
      >
        <Index each={props.opts}>
          {(opt, _) => <option value={opt()}>{opt}</option>}
        </Index>
      </select>
    </div>
  );
}

export default App;
