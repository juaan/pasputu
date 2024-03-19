import { createSignal, Show, Index } from "solid-js";
import imglyRemoveBackground from "@imgly/background-removal"

import styles from "./App.module.css";

function App() {
  const [selectedImage, setSelectedImage] = createSignal("");

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <div class="wrapper bg-white rounded-lg px-6 py-8 ring-1 ring-slate-900/5 shadow-xl">
          <div class={styles.titleGradient}>pasputu</div>
          <p class="text-slate-600 mt-8 text-sm tracking-wide">
            simple app to replace your background using your camera/photos, and
            change with your desired background
          </p>
          <div>
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              onChange={async (e) =>{
                const file = e.target.files[0];
                console.log("loading")
                const imgWithoutBg = await imglyRemoveBackground(file)
                setSelectedImage(URL.createObjectURL(imgWithoutBg));
                console.log("finished")
              }}
              style={{ display: "none" }} // Hide the file input
            />
            <div class="mt-8 flex items-center justify-center gap-x-6">
              <button class="rounded-md bg-cyan-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                Take photo
              </button>
              <p class="text-slate-500"> or </p>
              <button
                onClick={() => {
                  document.getElementById("fileInput").click();
                }}
                class="rounded-md bg-cyan-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Upload image
              </button>
            </div>
          </div>
          <Editor image={selectedImage()} />
          <div>
            <div class="mt-8 flex items-center justify-center gap-x-6">
              <button class="rounded-md bg-cyan-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                Download
              </button>
            </div>
          </div>
        </div>
      </header>
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
      setWidth("300")
      setHeight("300")
    } else if (ratio == "3:4") {
      setWidth("225")
      setHeight("300")
    } else if (ratio == "2:3") {
      setWidth("200")
      setHeight("300")
    }
  };

  const onBgChange = (e) => {
    setBgColor(e.target.value);
  };

  return (
    <div class="flex flex-col justify-center items-center bg-stone-100 p-8 mt-8 rounded-lg">
      <div
        ref={imgRef}
        class={`mb-8 bg-${bgColor()}-600 rounded-lg ring-1 ring-neutral-400/5 shadow-xl overflow-hidden relative top-0 left-0`}
        style={{
          width: `${width()}px`,
          height: `${height()}px`,
        }}
      >
        <Show when={props.image !== null} fallback={<p>no image</p>}>
          <div
            className={`relative overflow-hidden bg-no-repeat`}
            style={{
              width: `${width()}px`,
              height: `${height()}px`,
              "background-image": `url(${props.image})`,
              "background-position-x": `${getVert()}px`,
              "background-position-y": `${getHoriz()}px`,
              "background-size": `${scale() * 100}%`,
            }}
          ></div>
        </Show>
      </div>
      <div class="flex flex-row justify-center w-full mb-8">
        <div class="px-8 text-start">
          <label
            for="default-range"
            class="block text-sm font-medium text-gray-900 dark:text-white"
          >
            Background
          </label>
          <DropdownSelector
            opts={["white", "blue", "red"]}
            onDataChange={onBgChange}
          />
        </div>
        <div class="px-8 text-start">
          <label
            for="default-range"
            class="block text-sm font-medium text-gray-900 dark:text-white"
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
          class="block text-sm font-medium text-gray-900 dark:text-white"
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
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        ></input>
      </div>
      <div class="px-8 w-full text-start">
        <label
          for="default-range"
          class="block text-sm font-medium text-gray-900 dark:text-white"
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
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        ></input>
      </div>
      <div class="px-8 w-full text-start">
        <label
          for="default-range"
          class="block text-sm font-medium text-gray-900 dark:text-white"
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
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        ></input>
      </div>
    </div>
  );
}

function DropdownSelector(props) {
  return (
    <div>
      <select
        onChange={(e) => props.onDataChange(e)}
        class="py-2 text-sm text-gray-700 dark:text-gray-200"
      >
        <Index each={props.opts}>
          {(opt, _) => <option value={opt()}>{opt}</option>}
        </Index>
      </select>
    </div>
  );
}

export default App;
