"use client";
import { useRef } from "react";
import { prepareImage } from "@/lib/imageUtils";

export default function ImageUploader({ image, onChange }) {
  const ref = useRef();
  const pick = async (e) => {
    const f = e.target.files?.[0];
    if (f) onChange(await prepareImage(f).catch(() => null));
  };
  return (
    <div className="drop" onClick={() => ref.current.click()}>
      <input ref={ref} type="file" accept="image/*" capture="environment" hidden onChange={pick} />
      {image ? (<><img src={image.preview} alt="ফসলের ছবি" /><button type="button" className="ghost" onClick={(e) => { e.stopPropagation(); onChange(null); }}>ছবি সরান</button></>)
        : (<div><b>পাতা বা ফসলের ছবি তুলুন</b><p>ক্যামেরা খুলবে, অথবা গ্যালারি থেকে বেছে নিন</p></div>)}
    </div>
  );
}
